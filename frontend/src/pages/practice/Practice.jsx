import { useEffect, useRef, useState } from 'react';
import './Practice.css';

const WS_URL = import.meta.env.VITE_AI_WS_URL || 'ws://localhost:8000/ws/v1/evaluate';

export function SignEvaluation({ targetId, word, embedded = false, initialResult = null, onAttemptStart, onFinal }) {
  const video = useRef(null);
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
    const s = { closed: false, stopping: false, awaiting: false, ready: false };
    session.current = s;
    onAttemptStart?.();
    setActive(true);
    setResult(null);
    setMode(null);
    setStatus('카메라 연결 중…');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }, audio: false,
      });
      if (s.closed) { stream.getTracks().forEach(track => track.stop()); return; }
      s.stream = stream;
      video.current.srcObject = stream;
      await video.current.play();
      if (s.closed) return;
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const ws = new WebSocket(WS_URL);
      s.ws = ws;
      s.watchdog = setTimeout(() => {
        cleanup(s);
        setStatus('서버 연결 시간이 초과됐습니다.');
      }, 10000);
      const capture = async () => {
        if (s.closed || s.stopping || s.awaiting || ws.readyState !== WebSocket.OPEN) return;
        const v = video.current;
        if (!v?.videoWidth) { s.timer = setTimeout(capture, 125); return; }
        const scale = Math.min(640 / v.videoWidth, 480 / v.videoHeight, 1);
        canvas.width = Math.floor(v.videoWidth * scale);
        canvas.height = Math.floor(v.videoHeight * scale);
        context.drawImage(v, 0, 0, canvas.width, canvas.height);
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', .7));
        if (s.closed || s.stopping) return;
        if (!blob || blob.size > 150000) {
          cleanup(s); setStatus('프레임 생성에 실패했거나 크기가 너무 큽니다.'); return;
        }
        if (ws.bufferedAmount > 150000) { s.timer = setTimeout(capture, 125); return; }
        s.awaiting = true;
        ws.send(blob);
        clearTimeout(s.watchdog);
        s.watchdog = setTimeout(() => {
          cleanup(s); setStatus('분석 응답 시간이 초과됐습니다.');
        }, 15000);
      };
      ws.onopen = () => {
        if (s.closed) return;
        ws.send(JSON.stringify({ type: 'start', attempt_id: crypto.randomUUID(), target_id: target.trim() }));
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
          setStatus('수어를 표현하세요. 최근 16프레임을 4프레임마다 분석합니다.');
          s.deadline = setTimeout(stop, 29000);
          capture();
        } else if (msg.type === 'ack') {
          clearTimeout(s.watchdog);
          s.awaiting = false;
          if (!s.stopping) s.timer = setTimeout(capture, 125);
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
      if (!s.closed) { cleanup(s); setStatus(`카메라 시작 실패: ${error.message}`); }
    }
  }

  return <section className={`ai-practice${embedded ? " ai-practice-embedded" : ""}`} aria-label="수어 평가">
    <h2>{word ? `‘${word}’ 수어 평가` : "한국수어 준실시간 평가"}</h2>
    <p>최근 동작 구간을 반복 분석합니다. 한 번에 최대 30초 촬영합니다.</p>
    {targetId === undefined
      ? <label>목표 수어 ID <input value={target} maxLength={64} disabled={active} onChange={e => setTarget(e.target.value)} /></label>
      : <p>현재 표현: {word} · {target || "수어 ID 연결 예정"}</p>}
    {targetId === null && <p className="notice">이 표현의 수어 ID가 아직 연결되지 않아 평가를 시작할 수 없습니다.</p>}
    <video ref={video} autoPlay muted playsInline />
    <div className="buttons">
      <button onClick={start} disabled={active || !target.trim()}>평가 시작</button>
      <button onClick={stop} disabled={!active}>종료 및 최종 평가</button>
    </div>
    <p role="status">{status}</p>
    {mode === 'demo' && <p className="notice">통신 테스트 모드 · 실제 수어 인식 모델이 연결되지 않았습니다.</p>}
    {result && <section aria-live="polite">
      <h2>{result.type === 'final' ? '최종' : '진행 중'}: {result.result}</h2>
      <p>{result.feedback}</p>
      <p>예측 ID: {result.predicted_id || '없음'} · 모델 점수: {result.confidence?.toFixed(3)}</p>
    </section>}
  </section>;
}

export default function Practice() {
  return <main><SignEvaluation /></main>;
}
