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
import { loadFaceApiModels, descriptorsMatch } from 'utils/faceApi';
import * as faceapi from 'face-api.js';
import useAuth from 'hooks/useAuth';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';

const STORAGE_KEY = 'faceWatchdogEnabled';
const ABSENCE_TIMEOUT_MS = 30_000;    // 30 seconds
const POLL_INTERVAL_SECURE = 30_000;  // check every 30 seconds when face is present
const POLL_INTERVAL_ALERT = 1_000;    // check every 1 second during alert countdown

export default function useFaceWatchdog() {
  const { user, logout } = useAuth();
  const dispatch = useDispatch();

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
    if (user && user.autoLogoutOnFaceAbsence === 0) {
      return;
    }
    const next = Boolean(val);
    localStorage.setItem(STORAGE_KEY, String(next));
    enabledRef.current = next;
    setEnabledState(next);
  }, [user]);

  /** Stop camera + clear all timers */
  const stopAll = useCallback(() => {
    clearTimeout(pollTimerRef.current);
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

  /** Start camera + polling loop */
  const startWatchdog = useCallback(async () => {
    const getRegisteredDescriptor = () => {
      if (!user || !user.faceDescriptor) return null;
      try {
        if (typeof user.faceDescriptor === 'string') {
          return JSON.parse(user.faceDescriptor);
        }
        if (Array.isArray(user.faceDescriptor)) {
          return user.faceDescriptor;
        }
      } catch (e) {
        console.warn('[FaceWatchdog] Failed to parse registered face descriptor:', e);
      }
      return null;
    };

    // Dynamic recursive polling loop
    const runPoll = async () => {
      if (!enabledRef.current || !mountedRef.current) return;

      let detection = null;
      try {
        await loadFaceApiModels();
        if (!enabledRef.current || !mountedRef.current) return;

        // Initialize camera stream & video DOM element if they don't exist yet
        if (!streamRef.current) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: 320, height: 240 }
          });
          if (!enabledRef.current || !mountedRef.current) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }
          streamRef.current = stream;

          // Create off-screen video element appended to DOM with valid size to allow browser decoding
          const video = document.createElement('video');
          video.width = 320;
          video.height = 240;
          video.autoplay = true;
          video.muted = true;
          video.playsInline = true;
          video.style.position = 'fixed';
          video.style.top = '-9999px';
          video.style.left = '-9999px';
          video.style.width = '320px';
          video.style.height = '240px';
          document.body.appendChild(video);

          video.srcObject = stream;
          video.muted = true;
          video.playsInline = true;

          // Explicitly wait for video stream metadata to load before playing and starting faceapi
          await new Promise((resolve) => {
            video.onloadedmetadata = () => resolve();
            // Fallback in case it was already loaded or event was missed
            if (video.readyState >= 1) resolve();
          });
          await video.play();

          if (!enabledRef.current || !mountedRef.current) {
            stream.getTracks().forEach((t) => t.stop());
            if (video.parentNode) {
              video.parentNode.removeChild(video);
            }
            return;
          }
          videoRef.current = video;
        }

        if (videoRef.current && enabledRef.current && mountedRef.current) {
          detection = await faceapi
            .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.3 }))
            .withFaceLandmarks()
            .withFaceDescriptor();
        }
      } catch (err) {
        console.warn('[FaceWatchdog] Poll check error or camera denied:', err);
      }

      if (!enabledRef.current || !mountedRef.current) return;

      const detected = !!detection;

      if (detected) {
        // Face found. Verify identity if a descriptor is registered.
        const registered = getRegisteredDescriptor();
        if (registered && detection.descriptor) {
          const currentDescriptor = Array.from(detection.descriptor);
          const isMatch = descriptorsMatch(registered, currentDescriptor);

          if (!isMatch) {
            console.warn('[FaceWatchdog] Face mismatch detected! Logging out immediately.');
            dispatch(openSnackbar({
              open: true,
              message: 'Session terminated: Biometric identity mismatch detected!',
              variant: 'alert',
              alert: { variant: 'filled' },
              severity: 'error',
              close: true,
              autoHideDuration: 10000
            }));
            stopAll();
            logout().catch(console.error);
            return; // Exit recursion immediately on identity mismatch
          }
        }

        setFacePresent(true);

        // Reset countdown, face present
        absentSinceRef.current = null;
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
        setCountdown(null);

        // Turn OFF camera immediately to save battery and shut off recording indicator light!
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
      } else {
        setFacePresent(false);

        // Face is absent!
        if (!absentSinceRef.current) {
          absentSinceRef.current = Date.now();

          // Start visual countdown updating every 500ms
          countdownTimerRef.current = setInterval(() => {
            if (!mountedRef.current) return;
            const elapsed = Date.now() - (absentSinceRef.current || Date.now());
            const remaining = Math.ceil((ABSENCE_TIMEOUT_MS - elapsed) / 1000);
            if (remaining <= 0) {
              setCountdown(0);
              dispatch(openSnackbar({
                open: true,
                message: 'Session terminated: Logged out due to face absence.',
                variant: 'alert',
                alert: { variant: 'filled' },
                severity: 'warning',
                close: true,
                autoHideDuration: 10000
              }));
              stopAll();
              logout().catch(console.error);
            } else {
              setCountdown(remaining);
            }
          }, 500);
        }

        // Check if timeout exceeded
        const elapsed = Date.now() - absentSinceRef.current;
        if (elapsed >= ABSENCE_TIMEOUT_MS) {
          dispatch(openSnackbar({
            open: true,
            message: 'Session terminated: Logged out due to face absence.',
            variant: 'alert',
            alert: { variant: 'filled' },
            severity: 'warning',
            close: true,
            autoHideDuration: 10000
          }));
          stopAll();
          logout().catch(console.error);
          return;
        }
      }

      // Schedule next check
      // 1 second during active alert countdown, 30 seconds when session is secure
      const nextDelay = absentSinceRef.current ? POLL_INTERVAL_ALERT : POLL_INTERVAL_SECURE;

      if (enabledRef.current && mountedRef.current) {
        pollTimerRef.current = setTimeout(runPoll, nextDelay);
      }
    };

    // Kick off the loop
    pollTimerRef.current = setTimeout(runPoll, 100);
  }, [logout, stopAll, user, dispatch]);

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
    if (user) {
      if (user.autoLogoutOnFaceAbsence === 0) {
        setEnabledState(false);
      } else if (user.autoLogoutOnFaceAbsence === 1) {
        // If enabled by admin, automatically turn on the watchdog by default on first load
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === null) {
          localStorage.setItem(STORAGE_KEY, 'true');
          enabledRef.current = true;
          setEnabledState(true);
        } else {
          setEnabledState(stored === 'true');
        }
      }
    }
  }, [user]);

  /** Mark unmounted */
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const isFeatureAllowed = user ? user.autoLogoutOnFaceAbsence !== 0 : false;

  return { enabled, setEnabled, facePresent, countdown, isFeatureAllowed };
}
