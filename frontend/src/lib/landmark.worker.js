// Classic Worker: MediaPipe WASM 로더의 importScripts 호환성을 유지한다.
// 설치한 JS/WASM 버전과 동일한 공식 배포 파일만 사용한다.
importScripts('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.2/vision_bundle.js');
async function createLandmarker(delegate, modelUrl) {
  const files = await Vision.FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.2/wasm');
  return Vision.HandLandmarker.createFromOptions(files, {
    baseOptions: { modelAssetPath: modelUrl, delegate }, runningMode: 'VIDEO', numHands: 2,
    minHandDetectionConfidence: .5, minHandPresenceConfidence: .5, minTrackingConfidence: .5,
  });
}
let model;
self.onmessage = async ({ data }) => {
  if (data.type === 'init') {
    try {
      try { model = await createLandmarker('GPU', data.modelUrl); }
      catch { model = await createLandmarker('CPU', data.modelUrl); }
      self.postMessage({ type: 'ready' });
    } catch (error) { self.postMessage({ type: 'error', message: error.message }); }
    return;
  }
  if (data.type === 'frame') {
    try {
      const result = model.detectForVideo(data.bitmap, data.timestamp);
      self.postMessage({ type: 'result', result });
    } catch (error) { self.postMessage({ type: 'error', message: error.message }); }
    finally { data.bitmap.close(); }
  }
};
