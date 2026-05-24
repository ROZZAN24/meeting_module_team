/**
 * useFaceWatchdog.js
 *
 * Background face-presence monitor.
 * When enabled (via localStorage 'faceWatchdogEnabled' = 'true'), opens the
 * user's camera silently and polls for a face every second.
 * If no face is detected for ABSENCE_TIMEOUT_MS (default 30 s), it calls
 * logout() automatically.
 *
 * The hook also exposes:
 *  - enabled       : boolean — current setting value
 *  - setEnabled    : fn     — toggle the setting (persists to localStorage)
 *  - facePresent   : boolean|null — live face detection state (null = loading)
 *  - countdown     : number|null — seconds remaining before auto-logout (null = not counting)
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { loadFaceApiModels } from 'utils/faceApi';
import * as faceapi from 'face-api.js';
import useAuth from 'hooks/useAuth';

const STORAGE_KEY = 'faceWatchdogEnabled';
const ABSENCE_TIMEOUT_MS = 30_000; // 30 seconds
const POLL_INTERVAL_MS = 1_000;    // check every 1 second

export default function useFaceWatchdog() {
  const { user, logout } = useAuth();

  const [enabled, setEnabledState] = useState(() => {
    if (user && user.autoLogoutOnFaceAbsence === 0) {
      return false;
    }
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === null ? false : stored === 'true';
  });
  const [facePresent, setFacePresent] = useState(null);
  const [countdown, setCountdown] = useState(null);

  // Refs keep latest values accessible inside async callbacks without stale closures
  const enabledRef = useRef(enabled);
  const streamRef = useRef(null);
  const videoRef = useRef(null);
  const pollTimerRef = useRef(null);
  const absentSinceRef = useRef(null); // timestamp when face last disappeared
  const countdownTimerRef = useRef(null);
  const mountedRef = useRef(true);

  /** Persist setting */
  const setEnabled = useCallback((val) => {
    const next = Boolean(val);
    localStorage.setItem(STORAGE_KEY, String(next));
    enabledRef.current = next;
    setEnabledState(next);
  }, []);

  /** Stop camera + clear all timers */
  const stopAll = useCallback(() => {
    clearInterval(pollTimerRef.current);
    clearInterval(countdownTimerRef.current);
    pollTimerRef.current = null;
    countdownTimerRef.current = null;

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      if (videoRef.current.parentNode) {
        videoRef.current.parentNode.removeChild(videoRef.current);
      }
      videoRef.current = null;
    }
    absentSinceRef.current = null;
    if (mountedRef.current) {
      setFacePresent(null);
      setCountdown(null);
    }
  }, []);

  /** Handle a face detection result from the poll loop */
  const handleDetectionResult = useCallback(
    (detected) => {
      if (!mountedRef.current) return;
      setFacePresent(detected);

      if (detected) {
        // Face present → reset absence timer
        absentSinceRef.current = null;
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
        setCountdown(null);
      } else {
        // No face → start counting if not already
        if (!absentSinceRef.current) {
          absentSinceRef.current = Date.now();

          // Start visual countdown
          countdownTimerRef.current = setInterval(() => {
            if (!mountedRef.current) return;
            const elapsed = Date.now() - (absentSinceRef.current || Date.now());
            const remaining = Math.ceil((ABSENCE_TIMEOUT_MS - elapsed) / 1000);
            if (remaining <= 0) {
              clearInterval(countdownTimerRef.current);
              setCountdown(0);
            } else {
              setCountdown(remaining);
            }
          }, 500);
        }

        // Check if timeout exceeded → logout
        const elapsed = Date.now() - absentSinceRef.current;
        if (elapsed >= ABSENCE_TIMEOUT_MS) {
          stopAll();
          logout().catch(console.error);
        }
      }
    },
    [logout, stopAll]
  );

  /** Start camera + polling loop */
  const startWatchdog = useCallback(async () => {
    try {
      await loadFaceApiModels();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 320, height: 240 }
      });
      if (!mountedRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      streamRef.current = stream;

      // Create off-screen video element appended to DOM to force browser decoding
      const video = document.createElement('video');
      video.style.position = 'fixed';
      video.style.top = '-9999px';
      video.style.left = '-9999px';
      video.style.width = '1px';
      video.style.height = '1px';
      video.style.opacity = '0';
      video.style.pointerEvents = 'none';
      document.body.appendChild(video);

      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;
      await video.play();
      videoRef.current = video;

      // Poll every second
      pollTimerRef.current = setInterval(async () => {
        if (!enabledRef.current || !videoRef.current || !mountedRef.current) return;
        try {
          const detection = await faceapi.detectSingleFace(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })
          );
          handleDetectionResult(!!detection);
        } catch {
          // ignore transient errors
        }
      }, POLL_INTERVAL_MS);
    } catch (err) {
      console.warn('[FaceWatchdog] Camera start failed:', err.message);
    }
  }, [handleDetectionResult]);

  /** React to enabled changes */
  useEffect(() => {
    enabledRef.current = enabled;
    if (enabled) {
      startWatchdog();
    } else {
      stopAll();
    }

    return stopAll; // cleanup on unmount or re-run
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  /** Sync with user profile settings when loaded or changed */
  useEffect(() => {
    if (user && user.autoLogoutOnFaceAbsence === 0) {
      setEnabledState(false);
    }
  }, [user]);

  /** Mark unmounted */
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return { enabled, setEnabled, facePresent, countdown };
}
