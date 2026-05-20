/**
 * faceApi.js — Browser-side face embedding utility using face-api.js
 *
 * Generates 128-dimensional face descriptors (embeddings) from video/image
 * elements using TensorFlow.js models. Descriptors are compared via
 * Euclidean distance on the backend (threshold ≤ 0.6 = same person).
 */
import * as faceapi from 'face-api.js';

const MODEL_URL = '/models';
let modelsLoaded = false;
let modelsLoading = false;
let modelLoadCallbacks = [];

/**
 * Load face-api.js models (lazy, singleton, safe for concurrent calls).
 * Models are served from /public/models/ at runtime.
 */
export async function loadFaceApiModels() {
  if (modelsLoaded) return;
  if (modelsLoading) {
    // Wait for the in-progress load to finish
    return new Promise((resolve, reject) => {
      modelLoadCallbacks.push({ resolve, reject });
    });
  }

  modelsLoading = true;
  try {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
    modelsLoaded = true;
    modelsLoading = false;
    modelLoadCallbacks.forEach((cb) => cb.resolve());
    modelLoadCallbacks = [];
  } catch (err) {
    modelsLoading = false;
    modelLoadCallbacks.forEach((cb) => cb.reject(err));
    modelLoadCallbacks = [];
    throw err;
  }
}

/**
 * Detect a single face in a video/canvas/image element and return its
 * 128-dimensional descriptor as a plain JS number array.
 *
 * @param {HTMLVideoElement|HTMLCanvasElement|HTMLImageElement} element
 * @returns {number[]|null} descriptor array, or null if no face detected
 */
export async function getFaceDescriptor(element) {
  await loadFaceApiModels();

  const detection = await faceapi
    .detectSingleFace(element, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }))
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) return null;
  return Array.from(detection.descriptor); // Float32Array → number[128]
}

/**
 * Calculate Euclidean distance between two 128-D descriptor arrays.
 * Distance < 0.6 → same person (industry-standard face-api.js threshold).
 *
 * @param {number[]} d1
 * @param {number[]} d2
 * @returns {number}
 */
export function euclideanDistance(d1, d2) {
  if (!d1 || !d2 || d1.length !== d2.length) return Infinity;
  return Math.sqrt(d1.reduce((sum, v, i) => sum + Math.pow(v - d2[i], 2), 0));
}

/**
 * Check whether two descriptors match (distance below threshold).
 * @param {number[]} d1
 * @param {number[]} d2
 * @param {number} threshold defaults to 0.6
 * @returns {boolean}
 */
export function descriptorsMatch(d1, d2, threshold = 0.6) {
  return euclideanDistance(d1, d2) <= threshold;
}

/**
 * Draw a face detection overlay on a canvas element (for visual feedback).
 * @param {HTMLVideoElement} video
 * @param {HTMLCanvasElement} canvas
 */
export async function drawFaceDetection(video, canvas) {
  await loadFaceApiModels();
  const displaySize = { width: video.videoWidth || video.width, height: video.videoHeight || video.height };
  faceapi.matchDimensions(canvas, displaySize);

  const detection = await faceapi
    .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.4 }))
    .withFaceLandmarks();

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (detection) {
    const resized = faceapi.resizeResults(detection, displaySize);
    faceapi.draw.drawDetections(canvas, resized);
    faceapi.draw.drawFaceLandmarks(canvas, resized);
    return true; // face found
  }
  return false; // no face
}
