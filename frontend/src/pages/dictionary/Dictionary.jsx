import { createLiveLandmarker, clearStaleOverlay } from '../../lib/live-landmarker';
import { useEffect, useRef, useState } from 'react';
import { landmarkFrame, drawLandmarks } from '../../lib/mediapipe';
import { lessons } from '../../data/curriculum';
import './Dictionary.css';

const endpoint = new URL(import.meta.env.VITE_WORD_AI_WS_URL || 'ws://localhost:8000/ws/v1/word/evaluate');
endpoint.pathname = '/ws/v1/dictionary/recognize';
const names = new Map(Object.values(lessons).flatMap(({ expressions }) =>
  expressions.map(({ contentId, word }) => [contentId, word])));
const scopes = {
  intermediate: ['WORD1290', 'WORD1201', 'WORD1589', 'WORD1191', 'WORD1185', 'WORD1342', 'WORD1343', 'WORD1345', 'WORD1149', 'WORD1295', 'WORD1274'],
  unit5: ['운전', '천천히', '빨리'],
};

export default function Dictionary() {
  const video = useRef(null), overlay = useRef(null), session = useRef(null);
  const [scope, setScope] = useState('intermediate');
  const [active, setActive] = useState(false);
  const [status, setStatus] = useState('시작을 누르고 카메라 앞에서 수어를 표현해 주세요.');
  const [result, setResult] = useState(null);
  const [supported, setSupported] = useState(null);

  function cleanup(s) {
    if (!s || s.closed) return;
    s.closed = true;
    clearTimeout(s.timer);
    clearTimeout(s.watchdog);
    s.ws?.close();
    s.stream?.getTracks().forEach(track => track.stop());
    s.landmarker?.close();
    if (session.current === s) {
      session.current = null;
      if (video.current) video.current.srcObject = null;
      const canvas = overlay.current;
      canvas?.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  useEffect(() => () => cleanup(session.current), []);

  function stop() {
    cleanup(session.current);
    setActive(false);
    setResult(null);
    setStatus('인식을 종료했어요. 다시 시작할 수 있습니다.');
  }

  async function start() {
    if (session.current) return;
    const s = { closed: false, inFlight: 0, lastSent: -Infinity };
    session.current = s;
    setActive(true); setResult(null); setSupported(null);
    setStatus('카메라와 인식 모델 준비 중…');
    const fail = message => {
      if (s.closed) return;
      cleanup(s); setActive(false); setResult(null); setStatus(message);
    };
    const watch = () => {
      clearTimeout(s.watchdog);
      s.watchdog = setTimeout(() => fail('서버 응답 시간이 초과됐습니다. 다시 시작해 주세요.'), 15000);
    };
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
      const ws = s.ws = new WebSocket(endpoint);
      watch();
      const capture = async () => {
        if (s.closed) return;
        s.timer = setTimeout(capture, 33);
        clearStaleOverlay(overlay.current, s.lastDrawnAt ?? -Infinity, performance.now());
        const v = video.current;
        if (!v?.videoWidth || v.readyState < 2 || s.lastVideoTime === v.currentTime) return;
        try {
          const now = performance.now();
          s.lastVideoTime = v.currentTime;
          const detection = await landmarker.detectForVideo(v, now);
          if (s.closed || !detection) return;
          const frame = landmarkFrame(detection, now);
          if (performance.now() - now <= 200) {
            drawLandmarks(overlay.current, v, frame);
            s.lastDrawnAt = now;
          }
          if (s.inFlight >= 2 || ws.bufferedAmount > 150000 || now - s.lastSent < 125 || ws.readyState !== WebSocket.OPEN) return;
          frame.image_width = v.videoWidth; frame.image_height = v.videoHeight;
          s.lastSent = now; s.inFlight++;
          ws.send(JSON.stringify(frame));
        } catch { fail('손 좌표를 추출하지 못했어요. 다시 시작해 주세요.'); }
      };
      ws.onopen = () => { if (!s.closed) ws.send(JSON.stringify({ type: 'start', scope })); };
      ws.onmessage = event => {
        if (s.closed) return;
        watch();
        let msg;
        try { msg = JSON.parse(event.data); } catch { fail('서버 응답을 읽지 못했어요.'); return; }
        if (msg.type === 'ready') {
          setSupported(msg.supported_ids);
          setStatus('양손이 보이도록 수어를 표현해 주세요.');
          capture();
        } else if (msg.type === 'ack') s.inFlight = Math.max(0, s.inFlight - 1);
        else if (msg.type === 'prediction') {
          setResult(msg.stable && msg.predicted_id ? msg : null);
          setStatus(msg.message || (msg.stable ? '인식 후보가 나왔어요. 다음 단어도 표현해 보세요.' : '동작을 이어서 표현해 주세요.'));
        } else if (msg.type === 'error' || msg.type === 'ended') fail(msg.message);
      };
      ws.onerror = () => fail('인식 서버에 연결하지 못했어요. 다시 시작해 주세요.');
      ws.onclose = () => fail('연결이 종료됐어요. 다시 시작해 주세요.');
    } catch (error) {
      fail(error.name === 'NotAllowedError' ? '카메라 권한을 허용한 뒤 다시 시작해 주세요.' : '카메라 또는 인식 모델을 준비하지 못했어요. 다시 시작해 주세요.');
    }
  }

  return <main className="dictionary-page" aria-labelledby="dictionary-title">
    <header className="dictionary-heading">
      <p className="dictionary-eyebrow">손으로 찾는 단어</p>
      <h1 id="dictionary-title">수어 사전</h1>
      <p>카메라 앞에서 수어를 표현하고 인식한 단어를 확인하세요.</p>
    </header>
    <div className="dictionary-toolbar">
      <label htmlFor="dictionary-scope">인식 범위</label>
      <select id="dictionary-scope" value={scope} disabled={active} onChange={e => { setScope(e.target.value); setSupported(null); setResult(null); }}>
        <option value="intermediate">중급 단어 11개</option>
        <option value="unit5">운전 · 천천히 · 빨리</option>
      </select>
      <button type="button" onClick={active ? stop : start}>{active ? '인식 종료' : '카메라로 시작'}</button>
    </div>
    <p className="dictionary-supported">인식 가능: {(supported || scopes[scope]).map(id => names.get(id) || id).join(' · ')}</p>
    <section className="dictionary-preview" aria-label="실시간 수어 인식">
      <div className="dictionary-camera-preview">
        <video ref={video} muted playsInline aria-label="거울 모드 카메라" />
        <canvas ref={overlay} aria-hidden="true" />
        {!active && <span className="dictionary-camera-empty">카메라로 시작해 보세요</span>}
      </div>
      <div className="dictionary-intro">
        <span className="dictionary-badge">{active ? '실시간 인식' : '수어 인식'}</span>
        <div className="dictionary-result" aria-live="polite" aria-atomic="true">
          <h2>{result ? names.get(result.predicted_id) || result.predicted_id : '어떤 단어일까요?'}</h2>
          {result && <p>인식 후보 · 모델 점수 {result.confidence.toFixed(3)}</p>}
        </div>
        <p role="status">{status}</p>
        <p className="dictionary-note">거울 모드입니다. 손과 상체가 화면에 보이도록 해 주세요. 다른 단어로 바꿀 때는 손을 잠시 화면 밖으로 내렸다가 표현해 주세요.</p>
      </div>
    </section>
    <p className="dictionary-footnote">현재 선택한 범위의 단어를 인식하는 실험 기능입니다. 범위 밖의 수어도 지원 단어로 분류될 수 있으며, 모델 점수는 정확도를 뜻하지 않습니다. 영상은 전송하지 않고 손 좌표를 서버로 보내 분석합니다.</p>
  </main>;
}
