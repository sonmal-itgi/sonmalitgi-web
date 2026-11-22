// 처리 중에는 새 프레임을 버린다. 추론 큐와 메인 스레드 동기 추론을 만들지 않는다.
export async function createLiveLandmarker() {
  const worker = new Worker(new URL('./landmark.worker.js', import.meta.url));
  let closed = false, busy = false, pending = null;
  let resolveReady, rejectReady;
  const ready = new Promise((resolve, reject) => { resolveReady = resolve; rejectReady = reject; });
  const fail = error => {
    rejectReady(error);
    pending?.reject(error); pending = null;
    busy = false;
  };
  worker.onmessage = ({ data }) => {
    if (data.type === 'ready') resolveReady();
    else if (data.type === 'error') fail(new Error(data.message));
    else if (data.type === 'result') {
      busy = false;
      pending?.resolve(data.result); pending = null;
    }
  };
  worker.onerror = event => fail(new Error(event.message || '손 검출 Worker 오류'));
  const timeout = setTimeout(() => fail(new Error('손 검출 모델 준비 시간이 초과됐습니다.')), 30000);
  worker.postMessage({ type: 'init', modelUrl: import.meta.env?.VITE_MEDIAPIPE_MODEL_URL || 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task' });
  try { await ready; }
  catch (error) { worker.terminate(); throw error; }
  finally { clearTimeout(timeout); }
  return {
    async detectForVideo(video, timestamp) {
      if (closed || busy) return null;
      busy = true;
      let bitmap;
      try {
        bitmap = await createImageBitmap(video);
        if (closed) { bitmap.close(); busy = false; return null; }
        return await new Promise((resolve, reject) => {
          pending = { resolve, reject };
          worker.postMessage({ type: 'frame', bitmap, timestamp }, [bitmap]);
        });
      } catch (error) { bitmap?.close(); pending = null; busy = false; throw error; }
    },
    close() {
      closed = true; worker.terminate();
      pending?.resolve(null); pending = null;
    },
  };
}

export function clearStaleOverlay(canvas, lastDrawnAt, now) {
  if (canvas && now - lastDrawnAt > 200) {
    canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
  }
}
