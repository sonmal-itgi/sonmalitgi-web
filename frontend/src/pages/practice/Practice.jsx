import { createLandmarker, landmarkFrame, drawLandmarks } from '../../lib/mediapipe';
import { useEffect, useRef, useState } from 'react';
import './Practice.css';

const WORD_WS_URL = import.meta.env.VITE_WORD_AI_WS_URL || 'ws://localhost:8000/ws/v1/word/evaluate';
const WS_URL = import.meta.env.VITE_AI_WS_URL || 'ws://localhost:8000/ws/v1/evaluate';

export function SignEvaluation({ evaluationKind, targetId, word, embedded = false, initialResult = null, onAttemptStart, onFinal }) {
  const video = useRef(null);
  const overlay = useRef(null);
  const [landmarks, setLandmarks] = useState(null);
  const session = useRef(null);
  const [active, setActive] = useState(false);
  const [manualTarget, setTarget] = useState('FS0824');
  const target = targetId === undefined ? manualTarget : (targetId || '');
  const [status, setStatus] = useState(initialResult ? '이 표현의 이전 평가 결과입니다. 다시 평가할 수 있어요.' : '시작하면 카메라와 서버에 연결합니다.');
  const [result, setResult] = useState(initialResult);
  const [mode, setMode] = useState(initialResult?.model_mode || null);

  function cleanup(s) {
    if (!s || s.closed) return;
    s.closed = true;
    s.landmarker?.close();
    overlay.current?.getContext('2d')?.clearRect(0, 0, overlay.current.width, overlay.current.height);
    clearTimeout(s.timer);
    clearTimeout(s.deadline);
    clearTimeout(s.watchdog);
    s.stream?.getTracks().forEach(track => track.stop());
    s.ws?.close();
    if (session.current === s) {
      session.current = null;
      if (video.current) video.current.srcObject = null;
      setActive(false);
    }
  }
  useEffect(() => () => cleanup(session.current), []);

  function stop() {
    const s = session.current;
    if (!s || s.closed || s.stopping) return;
    if (s.ws?.readyState !== WebSocket.OPEN || !s.ready) {
      cleanup(s);
      setStatus('연결을 취소했습니다.');
      return;
    }
    s.stopping = true;
    clearTimeout(s.timer);
    clearTimeout(s.watchdog);
    s.stream?.getTracks().forEach(track => track.stop());
    s.ws.send(JSON.stringify({ type: 'stop' }));
    setStatus('최종 결과를 기다립니다.');
    s.watchdog = setTimeout(() => {
      cleanup(s);
      setStatus('최종 응답 시간이 초과됐습니다. 다시 시작해 주세요.');
    }, 15000);
  }

  async function start() {
    if (session.current) return;
    const s = { closed: false, stopping: false, awaiting: false, ready: false, lastSentAt: -Infinity };
    session.current = s;
    onAttemptStart?.();
    setActive(true);
    setResult(null);
    setLandmarks(null);
    setMode(null);
    setStatus('카메라와 양손 인식 모델 준비 중…');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }, audio: false,
      });
      if (s.closed) { stream.getTracks().forEach(track => track.stop()); return; }
      s.stream = stream;
      video.current.srcObject = stream;
      await video.current.play();
      if (s.closed) return;
      const landmarker = await createLandmarker();
      if (s.closed) { landmarker.close(); return; }
      s.landmarker = landmarker;
      const ws = new WebSocket(evaluationKind ? WORD_WS_URL : WS_URL);
      s.ws = ws;
      s.watchdog = setTimeout(() => {
        cleanup(s);
        setStatus('서버 연결 시간이 초과됐습니다.');
      }, 10000);
      const capture = () => {
        if (s.closed || s.stopping || ws.readyState !== WebSocket.OPEN) return;
        const v = video.current;
        s.timer = setTimeout(capture, 33);
        if (!v?.videoWidth || v.readyState < 2 || s.lastVideoTime === v.currentTime) return;
        try {
          const timestamp = performance.now();
          const detection = s.landmarker.detectForVideo(v, timestamp);
          const frame = landmarkFrame(detection, timestamp);
          frame.image_width = v.videoWidth;
          frame.image_height = v.videoHeight;
          s.lastVideoTime = v.currentTime;
          drawLandmarks(overlay.current, v, frame);
          if (s.awaiting || ws.bufferedAmount > 150000 || timestamp - s.lastSentAt < 125) return;
          s.lastSentAt = timestamp;
          setLandmarks(frame);
          s.awaiting = true;
          ws.send(JSON.stringify(frame));
        } catch (error) {
          cleanup(s); setStatus(`랜드마크 추출 실패: ${error.message}`); return;
        }
        clearTimeout(s.watchdog);
        s.watchdog = setTimeout(() => {
          cleanup(s); setStatus('분석 응답 시간이 초과됐습니다.');
        }, 15000);
      };
      ws.onopen = () => {
        if (s.closed) return;
        ws.send(JSON.stringify({ type: 'start', input_mode: 'landmarks', attempt_id: crypto.randomUUID(), target_id: target.trim() }));
      };
      ws.onmessage = event => {
        if (s.closed) return;
        let msg;
        try { msg = JSON.parse(event.data); }
        catch { cleanup(s); setStatus('서버 응답 형식 오류'); return; }
        if (msg.type === 'ready') {
          clearTimeout(s.watchdog);
          s.ready = true;
          setMode(msg.model_mode);
          setStatus('수어를 표현하세요. 양손을 카메라에 보여 주세요. 손 좌표를 분석합니다.');
          s.deadline = setTimeout(stop, 29000);
          capture();
        } else if (msg.type === 'ack') {
          if (!s.stopping) clearTimeout(s.watchdog);
          s.awaiting = false;
        } else if (msg.type === 'prediction' || msg.type === 'final') {
          setResult(msg);
          if (msg.type === 'final') {
            setStatus('평가 완료');
            // Spring Boot integration: send only a server-verifiable evaluation receipt.
            // Never use this browser JSON alone to unlock lessons or award progress.
            cleanup(s);
            onFinal?.(msg);
          }
        } else if (msg.type === 'error') {
          cleanup(s); setStatus(msg.message);
        }
      };
      ws.onerror = () => { cleanup(s); setStatus('WebSocket 연결에 실패했습니다. 서버 주소를 확인해 주세요.'); };
      ws.onclose = () => {
        if (!s.closed) { cleanup(s); setStatus('연결이 종료됐습니다. 다시 시작해 주세요.'); }
      };
    } catch (error) {
      if (!s.closed) { cleanup(s); setStatus(`카메라 또는 MediaPipe 준비 실패: ${error.message}`); }
    }
  }

  return <section className={`ai-practice${embedded ? " ai-practice-embedded" : ""}`} aria-label="수어 평가">
    <h2>{word ? `‘${word}’ 수어 평가` : "한국수어 준실시간 평가"}</h2>
    {evaluationKind === 'word' && <p className="notice">중급은 양손 좌표를 사용하는 단어 모델로 평가합니다. 모델 준비 상태와 지원 단어에 따라 평가 가능 여부가 안내됩니다.</p>}
    {evaluationKind === 'sentence' ? <>
      <p>문장을 처음부터 끝까지 표현하세요. 목표 문장이 확인되면 자동으로 통과합니다.</p>
      <p className="notice">학습 데이터 출처는 <a href="https://aihub.or.kr/aihubdata/data/view.do?dataSetSn=103" target="_blank" rel="noreferrer">AI Hub 수어 영상</a>입니다.</p>
    </> : <p>최근 동작 구간을 반복 분석합니다. 한 번에 최대 30초 촬영합니다.</p>}
    {targetId === undefined
      ? <label>목표 수어 ID <input value={target} maxLength={64} disabled={active} onChange={e => setTarget(e.target.value)} /></label>
      : <p>현재 표현: {word} · {target || "수어 ID 연결 예정"}</p>}
    {targetId === null && <p className="notice">이 표현의 수어 ID가 아직 연결되지 않아 평가를 시작할 수 없습니다.</p>}
    <div className="landmark-preview">
      <video ref={video} autoPlay muted playsInline />
      <canvas ref={overlay} aria-hidden="true" />
    </div>
    {landmarks && <p>검출된 점 · 왼손 {landmarks.left_hand.length} · 오른손 {landmarks.right_hand.length}</p>}
    <div className="buttons">
      <button onClick={start} disabled={active || !target.trim()}>평가 시작</button>
      {evaluationKind === 'sentence'
        ? <button onClick={() => {
          cleanup(session.current);
          setStatus('평가를 취소했습니다.');
        }} disabled={!active}>평가 취소</button>
        : <button onClick={stop} disabled={!active}>종료 및 최종 평가</button>}
    </div>
    <p role="status">{status}</p>
    <section className="landmark-json" aria-label="랜드마크 좌표 JSON">
      <h3>랜드마크 좌표 JSON</h3>
      <p>서버로 보내는 최신 프레임입니다. 촬영 중 자동으로 갱신되며 종료 후에도 마지막 좌표가 남습니다.</p>
      {landmarks
        ? <pre tabIndex={0} aria-label="최신 프레임 좌표"><code>{JSON.stringify(landmarks, null, 2)}</code></pre>
        : <p>평가를 시작하면 추출한 좌표가 여기에 표시됩니다.</p>}
    </section>
    {mode === 'demo' && <p className="notice">통신 테스트 모드 · 실제 수어 인식 모델이 연결되지 않았습니다.</p>}
    {result && <section aria-live="polite">
      <h2>{result.type === 'final' ? '최종' : '진행 중'}: {result.result === 'EXPERIMENTAL' ? '연습 결과' : result.result}</h2>
      <p>{result.feedback}</p>
      <p>예측 ID: {result.predicted_id || '없음'} · 모델 점수: {result.confidence?.toFixed(3)}</p>
    </section>}
  </section>;
}

export default function Practice() {
  return <main><SignEvaluation /></main>;
}
