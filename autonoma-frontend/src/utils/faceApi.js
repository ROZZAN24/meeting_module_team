import * as faceapi from 'face-api.js';

const MODEL_URL = '/models';
let modelsLoaded = false;
let modelsLoading = false;
let modelLoadCallbacks = [];

export async function loadFaceApiModels() {
  if (modelsLoaded) return;
  if (modelsLoading) {
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

export async function getFaceDescriptor(element) {
  await loadFaceApiModels();

  const detection = await faceapi
    .detectSingleFace(element, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }))
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) return null;
  return Array.from(detection.descriptor);
}

export function euclideanDistance(d1, d2) {
  if (!d1 || !d2 || d1.length !== d2.length) return Infinity;
  return Math.sqrt(d1.reduce((sum, v, i) => sum + Math.pow(v - d2[i], 2), 0));
}

export function descriptorsMatch(d1, d2, threshold = 0.6) {
  return euclideanDistance(d1, d2) <= threshold;
}

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
    return true;
  }
  return false;
}

function dist2D(p1, p2) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

function getEAR(eyePoints) {
  const p2_p6 = dist2D(eyePoints[1], eyePoints[5]);
  const p3_p5 = dist2D(eyePoints[2], eyePoints[4]);
  const p1_p4 = dist2D(eyePoints[0], eyePoints[3]);
  return (p2_p6 + p3_p5) / (2.0 * p1_p4);
}

export async function checkLiveness(videoElement, timeoutMs = 2500) {
  await loadFaceApiModels();
  const startTime = Date.now();
  let minEAR = 1.0;
  let maxEAR = 0.0;
  let positions = [];
  let faceFoundCount = 0;

  while (Date.now() - startTime < timeoutMs) {
    const detection = await faceapi
      .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }))
      .withFaceLandmarks();

    if (detection) {
      faceFoundCount++;
      const leftEye = detection.landmarks.getLeftEye();
      const rightEye = detection.landmarks.getRightEye();

      const leftEAR = getEAR(leftEye);
      const rightEAR = getEAR(rightEye);
      const ear = (leftEAR + rightEAR) / 2.0;

      minEAR = Math.min(minEAR, ear);
      maxEAR = Math.max(maxEAR, ear);

      if (maxEAR - minEAR > 0.04 && minEAR < 0.28) {
        return 'live'; 
      }

      const nose = detection.landmarks.getNose()[0];
      positions.push(nose);
      
      // Reduce frame requirement to 3 frames (~300-500ms) for a much faster check
      if (positions.length >= 3) {
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        for (let p of positions) {
          if (p.x < minX) minX = p.x;
          if (p.x > maxX) maxX = p.x;
          if (p.y < minY) minY = p.y;
          if (p.y > maxY) maxY = p.y;
        }
        // Very lenient micro-movement (1.5px) due to natural camera noise/pulse
        if ((maxX - minX > 1.5) || (maxY - minY > 1.5)) {
           return 'live'; 
        }
      }
    }
    // Reduced wait time between frames
    await new Promise(r => setTimeout(r, 20)); 
  }
  
  if (faceFoundCount === 0) {
    return 'no_face';
  }
  return 'spoof';
}
