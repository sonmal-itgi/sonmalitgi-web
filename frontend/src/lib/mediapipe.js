import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

// Keep the WASM version identical to the installed JS package.
const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.2/wasm';
const MODEL_URL = import.meta.env?.VITE_MEDIAPIPE_MODEL_URL ||
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/holistic_landmarker.task';

export async function createLandmarker() {
  const files = await FilesetResolver.forVisionTasks(WASM_URL);
  return HandLandmarker.createFromOptions(files, {
    baseOptions: { modelAssetPath: MODEL_URL },
    runningMode: 'VIDEO',
    numHands: 2,
    minHandDetectionConfidence: 0.5,
    minHandPresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });
}

export function landmarkFrame(result, timestamp) {
  const frame = {
    type: 'landmarks', schema: 'mediapipe-hands-v1', timestamp_ms: timestamp,
    left_hand: [], right_hand: [],
  };
  const scores = { left_hand: -1, right_hand: -1 };
  for (let i = 0; i < (result.landmarks?.length || 0); i++) {
    const label = result.handedness[i]?.[0];
    if (!label) continue;
    // The hand model assumes selfie (mirrored) input. Our video input is raw;
    // swap the labels to report the user's anatomical left/right hand.
    const key = label.categoryName === 'Left' ? 'right_hand'
      : label.categoryName === 'Right' ? 'left_hand' : null;
    if (!key || label.score <= scores[key]) continue;
    scores[key] = label.score;
    frame[key] = result.landmarks[i].map(({ x, y, z }) => ({ x, y, z }));
  }
  return frame;
}

export function drawLandmarks(canvas, video, frame) {
  if (!canvas) return;
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  const groups = [
    [frame.left_hand, HandLandmarker.HAND_CONNECTIONS, '#ffcb61'],
    [frame.right_hand, HandLandmarker.HAND_CONNECTIONS, '#79baff'],
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
      ctx.beginPath(); ctx.arc(p.x * canvas.width, p.y * canvas.height, 3, 0, Math.PI * 2); ctx.fill();
    }
  }
}
