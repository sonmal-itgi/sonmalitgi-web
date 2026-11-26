import { createLiveLandmarker, clearStaleOverlay } from '../../lib/live-landmarker';
import { createCaptureFeedback } from '../../lib/capture-feedback';
import { landmarkFrame, drawLandmarks } from '../../lib/mediapipe';
import { useEffect, useRef, useState } from 'react';
import './Practice.css';
import { lessons } from '../../data/curriculum';

const WORD_WS_URL = import.meta.env.VITE_WORD_AI_WS_URL || 'ws://localhost:8000/ws/v1/word/evaluate';
const WS_URL = import.meta.env.VITE_AI_WS_URL || 'ws://localhost:8000/ws/v1/evaluate';

const expressionById = new Map(Object.values(lessons).flatMap(({ expressions }) =>
  expressions.filter(({ contentId }) => contentId).map(({ contentId, word }) => [contentId, word]),
));

export function SignEvaluation({ evaluationKind, targetId, word, embedded = false, initialResult = null, onAttemptStart, onFinal }) {
  const video = useRef(null);
  const overlay = useRef(null);
  const [landmarks, setLandmarks] = useState(null);
  const [captureFeedback, setCaptureFeedback] = useState(null);
  const session = useRef(null);
  const measurementLog = useRef(null);
  const [measurements, setMeasurements] = useState(null);
  const [includeLandmarks, setIncludeLandmarks] = useState(false);
  const [active, setActive] = useState(false);
  const [manualTarget, setTarget] = useState('FS0824');
  const target = targetId === undefined ? manualTarget : (targetId || '');
  const [status, setStatus] = useState(initialResult ? '이 표현의 이전 평가 결과입니다. 다시 평가할 수 있어요.' : '시작하면 카메라와 서버에 연결합니다.');
  const [result, setResult] = useState(initialResult);
  const [mode, setMode] = useState(initialResult?.model_mode || null);

  function cleanup(s) {
    if (!s || s.closed) return;
    s.closed = true;
    if (measurementLog.current && !measurementLog.current.finished_at) {
      measurementLog.current.finished_at = new Date().toISOString();
    }
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
      setCaptureFeedback(null);
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
    const s = { closed: false, stopping: false, inFlight: 0, ready: false, lastSentAt: -Infinity };
    s.captureFeedback = createCaptureFeedback();
    s.needsBothHands = evaluationKind === 'sentence' && ['SEN0009', 'SEN0011'].includes(target);
    session.current = s;
    setCaptureFeedback(null);
    onAttemptStart?.();
    setActive(true);
    setResult(null);
    setMeasurements(null);
    measurementLog.current = {
      started_at: new Date().toISOString(),
      target_id: target,
      target_word: word || expressionById.get(target) || target,
      events: [],
      include_landmarks: includeLandmarks,
      ...(includeLandmarks ? { frames: [] } : {}),
    };
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
      const landmarker = await createLiveLandmarker();
      if (s.closed) { landmarker.close(); return; }
      s.landmarker = landmarker;
      const ws = new WebSocket(evaluationKind ? WORD_WS_URL : WS_URL);
      s.ws = ws;
      s.watchdog = setTimeout(() => {
        cleanup(s);
        setStatus('서버 연결 시간이 초과됐습니다.');
      }, 10000);
      const capture = async () => {
        if (s.closed || s.stopping || ws.readyState !== WebSocket.OPEN) return;
        clearStaleOverlay(overlay.current, s.lastDrawnAt ?? -Infinity, performance.now());
        const v = video.current;
        s.timer = setTimeout(capture, 33);
        if (!v?.videoWidth || v.readyState < 2 || s.lastVideoTime === v.currentTime) return;
        try {
          const timestamp = performance.now();
          s.lastVideoTime = v.currentTime;
          const detection = await s.landmarker.detectForVideo(v, timestamp);
          if (s.closed || s.stopping || !detection) return;
          const frame = landmarkFrame(detection, timestamp);
          frame.image_width = v.videoWidth;
          frame.image_height = v.videoHeight;
          if (performance.now() - timestamp <= 200) {
            drawLandmarks(overlay.current, v, frame);
            s.lastDrawnAt = timestamp;
          }
          const guidance = s.captureFeedback(frame, s.needsBothHands, timestamp);
          if ((guidance?.id || null) !== s.feedbackId) {
            s.feedbackId = guidance?.id || null;
            setCaptureFeedback(guidance);
          }
          if (s.inFlight >= 2 || ws.bufferedAmount > 150000 || timestamp - s.lastSentAt < 125) return;
          s.lastSentAt = timestamp;
          setLandmarks(frame);
          s.inFlight += 1;
          ws.send(JSON.stringify(frame));
          if (measurementLog.current?.include_landmarks) {
            measurementLog.current.frames.push(frame);
          }
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
        if (msg.metrics) setMeasurements(previous => ({ ...previous, ...msg.metrics }));
        if (['ready', 'ack', 'prediction', 'final', 'error'].includes(msg.type)) {
          // Record timing and classifications. Landmark arrays remain outside this log.
          measurementLog.current?.events.push({ received_at: new Date().toISOString(), ...msg });
        }
        if (msg.type === 'ready') {
          clearTimeout(s.watchdog);
          s.ready = true;
          setMode(msg.model_mode);
          setStatus('수어를 표현하세요. 양손을 카메라에 보여 주세요. 손 좌표를 분석합니다.');
          s.deadline = setTimeout(stop, 29000);
          capture();
        } else if (msg.type === 'ack') {
          s.inFlight = Math.max(0, s.inFlight - 1);
          if (!s.stopping && s.inFlight === 0) clearTimeout(s.watchdog);
        } else if (msg.type === 'prediction' || msg.type === 'final') {
          setResult(msg);
          if (msg.recognized_words?.includes('운전')) s.needsBothHands = false;
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

  function downloadMeasurements() {
    const log = measurementLog.current;
    if (!log) return;
    const blob = new Blob([JSON.stringify(log, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `손말잇기-웹캠평가-${log.target_id}-${log.started_at.replaceAll(':', '-')}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const predictedWord = expressionById.get(result?.predicted_id);

  return <section className={`ai-practice${embedded ? " ai-practice-embedded" : ""}`} aria-label="수어 평가">
    <h2>{word ? `‘${word}’ 수어 평가` : "한국수어 준실시간 평가"}</h2>
    {evaluationKind === 'word' && <p className="notice">중급은 양손 좌표를 사용하는 단어 모델로 평가합니다. 모델 준비 상태와 지원 단어에 따라 평가 가능 여부가 안내됩니다.</p>}
    {evaluationKind === 'sentence' ? <>
      <p>문장을 처음부터 끝까지 표현하세요. 목표 수어가 3회 연속 인식되면 자동으로 통과합니다. 동작을 세 번 반복할 필요는 없습니다.</p>
      <p className="notice">학습 데이터 출처는 <a href="https://aihub.or.kr/aihubdata/data/view.do?dataSetSn=103" target="_blank" rel="noreferrer">AI Hub 수어 영상</a>입니다.</p>
    </> : <p>최근 동작 구간을 반복 분석합니다. 한 번에 최대 30초 촬영합니다.</p>}
    {targetId === undefined
      ? <label>목표 수어 ID <input value={target} maxLength={64} disabled={active} onChange={e => setTarget(e.target.value)} /></label>
      : <p>현재 표현: {word} · {target || "수어 ID 연결 예정"}</p>}
    {targetId === null && <p className="notice">이 표현의 수어 ID가 아직 연결되지 않아 평가를 시작할 수 없습니다.</p>}
    <div className="evaluation-layout">
      <div className="landmark-preview">
        <video ref={video} autoPlay muted playsInline />
        <canvas ref={overlay} aria-hidden="true" />
      </div>
      <section className="evaluation-result" aria-live="polite">
        {active && <aside className="capture-feedback" role="status">
          <strong>실시간 피드백</strong>
          <p>{captureFeedback?.message || '손 전체가 카메라에 보이도록 표현해 주세요.'}</p>
          <small>손 검출·화면 위치와 운전 구간의 주먹 모양을 확인합니다. 수형 안내는 참고용입니다.</small>
        </aside>}
        {result ? <>
          <h2>{result.type === 'final' ? '최종' : '진행 중'}: {result.result === 'EXPERIMENTAL' ? '연습 결과' : result.result}</h2>
          {evaluationKind === 'sentence' && Number.isInteger(result.stable_count) && result.stable_required > 0 && (
            <div className="recognition-progress">
              <p>{expressionById.get(result.stable_target) || result.stable_target || '목표 수어'} · 연속 인식 <strong>{result.stable_count}/{result.stable_required}</strong></p>
              <progress aria-label="목표 수어 연속 인식" value={result.stable_count} max={result.stable_required} />
              <small>인식이 끊기거나 다른 수어가 인식되면 다시 시작해요.</small>
            </div>
          )}
          <p>{result.feedback}</p>
          {result.recognized_words?.length > 0 && (
            <p>인식한 순서 · {result.recognized_words.join(' → ')}</p>
          )}
          <p>예측: {predictedWord ? `${predictedWord} (${result.predicted_id})` : result.predicted_id || '없음'} · 모델 점수: {result.confidence?.toFixed(3)}</p>
        </> : <p>평가를 시작하면 이곳에 인식 결과가 표시됩니다.</p>}
      </section>
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
    <details className="evaluation-measurements">
      <summary>웹캠 평가 측정 기록</summary>
      <p>수신 속도는 서버 도착 기준이며, 판정 구간은 촬영 좌표의 시간 기준입니다.</p>
      <label>
        <input type="checkbox" checked={includeLandmarks} disabled={active}
          onChange={event => setIncludeLandmarks(event.target.checked)} />
        측정 파일에 손 좌표 포함
      </label>
      <p>원인 분석을 위해 서버에 보낸 손 좌표를 내려받는 JSON 파일에 함께 저장합니다.</p>
      {measurements ? <>
        <p>최근 수신 속도 · {measurements.received_fps ?? '측정 중'} fps</p>
        <p>평균 수신 속도 · {measurements.average_received_fps ?? '측정 중'} fps · 받은 프레임 {measurements.frame_count}개</p>
        <p>최근 판정 구간 · {measurements.window_seconds ?? '측정 중'}초 · {measurements.window_frames ?? '—'}프레임</p>
        <p>최근 예측 · {expressionById.get(measurements.raw_predicted_id) || measurements.raw_predicted_id || '대기 중'} · 점수 {measurements.raw_confidence?.toFixed(3) ?? '—'}</p>
        <p>추론 {measurements.inference_ms ?? '—'}ms · 서버 대기 {measurements.queue_ms ?? '—'}ms</p>
        <p>통과 시간 · {measurements.pass_seconds == null ? '통과 대기 중' : `${measurements.pass_seconds}초`}</p>
      </> : <p>평가를 시작하면 측정됩니다.</p>}
      <button onClick={downloadMeasurements} disabled={active || !measurementLog.current}>측정 기록 다운로드</button>
    </details>
    <section className="landmark-json" aria-label="랜드마크 좌표 JSON">
      <h3>랜드마크 좌표 JSON</h3>
      <p>서버로 보내는 최신 프레임입니다. 촬영 중 자동으로 갱신되며 종료 후에도 마지막 좌표가 남습니다.</p>
      {landmarks
        ? <pre tabIndex={0} aria-label="최신 프레임 좌표"><code>{JSON.stringify(landmarks, null, 2)}</code></pre>
        : <p>평가를 시작하면 추출한 좌표가 여기에 표시됩니다.</p>}
    </section>
    {mode === 'demo' && <p className="notice">통신 테스트 모드 · 실제 수어 인식 모델이 연결되지 않았습니다.</p>}
  </section>;
}

export default function Practice() {
  return <main><SignEvaluation /></main>;
}
