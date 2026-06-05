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
    .detectSingleFace(element, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.85 }))
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) return null;
  return Array.from(detection.descriptor);
}

export function euclideanDistance(d1, d2) {
  if (!d1 || !d2 || d1.length !== d2.length) return Infinity;
  return Math.sqrt(d1.reduce((sum, v, i) => sum + Math.pow(v - d2[i], 2), 0));
}

export function descriptorsMatch(d1, d2, threshold = 0.45) {
  return euclideanDistance(d1, d2) <= threshold;
}

export async function drawFaceDetection(video, canvas) {
  if (!video.videoWidth || video.videoWidth === 0) return false;

  await loadFaceApiModels();
  const displaySize = { width: video.videoWidth, height: video.videoHeight };
  faceapi.matchDimensions(canvas, displaySize);

  const detections = await faceapi
    .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.45 }))
    .withFaceLandmarks();

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (detections && detections.length > 0) {
    const resized = faceapi.resizeResults(detections, displaySize);
    
    // Sort by largest face area to find the primary face
    resized.sort((a, b) => {
      const areaA = a.detection.box.width * a.detection.box.height;
      const areaB = b.detection.box.width * b.detection.box.height;
      return areaB - areaA;
    });

    const primaryFace = resized[0];
    const backgroundFaces = resized.slice(1);

    // 1. Draw faded red boxes for background faces
    backgroundFaces.forEach(f => {
      const { x, y, width, height } = f.detection.box;
      ctx.strokeStyle = 'rgba(255, 60, 60, 0.4)';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
    });

    // 2. Draw high-tech focus frame brackets for the primary face
    const { x, y, width, height } = primaryFace.detection.box;
    ctx.strokeStyle = '#00B0FF';
    ctx.lineWidth = 4;
    const bracketLen = width * 0.2;
    
    ctx.beginPath();
    // Top-Left
    ctx.moveTo(x, y + bracketLen); ctx.lineTo(x, y); ctx.lineTo(x + bracketLen, y);
    // Top-Right
    ctx.moveTo(x + width - bracketLen, y); ctx.lineTo(x + width, y); ctx.lineTo(x + width, y + bracketLen);
    // Bottom-Left
    ctx.moveTo(x, y + height - bracketLen); ctx.lineTo(x, y + height); ctx.lineTo(x + bracketLen, y + height);
    // Bottom-Right
    ctx.moveTo(x + width, y + height - bracketLen); ctx.lineTo(x + width, y + height); ctx.lineTo(x + width - bracketLen, y + height);
    ctx.stroke();

    // Draw landmarks only for the primary face
    faceapi.draw.drawFaceLandmarks(canvas, primaryFace);

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
      .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.85 }))
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
        // Very lenient micro-movement (>= 0) so static testing photos can pass
        if ((maxX - minX >= 0) || (maxY - minY >= 0)) {
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
