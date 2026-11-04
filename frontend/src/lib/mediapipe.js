import { FilesetResolver, HolisticLandmarker } from '@mediapipe/tasks-vision';

// Keep the WASM version identical to the installed JS package.
const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.2/wasm';
const MODEL_URL = import.meta.env.VITE_MEDIAPIPE_MODEL_URL ||
  'https://storage.googleapis.com/mediapipe-models/holistic_landmarker/holistic_landmarker/float16/1/holistic_landmarker.task';

export async function createLandmarker() {
  const files = await FilesetResolver.forVisionTasks(WASM_URL);
  return HolisticLandmarker.createFromOptions(files, {
    baseOptions: { modelAssetPath: MODEL_URL },
    runningMode: 'VIDEO',
    outputFaceBlendshapes: false,
    outputPoseSegmentationMasks: false,
  });
}

export function landmarkFrame(result, timestamp) {
  const points = key => (result[key]?.[0] || []).map(p => ({
    x: p.x, y: p.y, z: p.z,
    ...(Number.isFinite(p.visibility) ? { visibility: p.visibility } : {}),
  }));
  return {
    type: 'landmarks', schema: 'mediapipe-holistic-v1', timestamp_ms: timestamp,
    pose: points('poseLandmarks'), face: points('faceLandmarks'),
    left_hand: points('leftHandLandmarks'), right_hand: points('rightHandLandmarks'),
  };
}

export function drawLandmarks(canvas, video, frame) {
  if (!canvas) return;
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  const groups = [
    [frame.pose, HolisticLandmarker.POSE_CONNECTIONS, '#63dfba'],
    [frame.left_hand, HolisticLandmarker.HAND_CONNECTIONS, '#ffcb61'],
    [frame.right_hand, HolisticLandmarker.HAND_CONNECTIONS, '#79baff'],
    [frame.face, [], '#ffffff'],
  ];
  for (const [points, connections, color] of groups) {
    ctx.strokeStyle = ctx.fillStyle = color;
    ctx.lineWidth = 2;
    for (const { start, end } of connections) {
      const a = points[start], b = points[end];
      if (!a || !b || a.visibility < .5 || b.visibility < .5) continue;
      ctx.beginPath(); ctx.moveTo(a.x * canvas.width, a.y * canvas.height);
      ctx.lineTo(b.x * canvas.width, b.y * canvas.height); ctx.stroke();
    }
    for (const p of points) {
      if (p.visibility < .5) continue;
      ctx.beginPath(); ctx.arc(p.x * canvas.width, p.y * canvas.height, points === frame.face ? 1 : 3, 0, Math.PI * 2); ctx.fill();
    }
  }
}
