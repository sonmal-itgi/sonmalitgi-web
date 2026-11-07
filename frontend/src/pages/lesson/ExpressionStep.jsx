import { useRef, useState } from 'react';
import { SignEvaluation } from '../practice/Practice.jsx';
import { referenceVideoUrl } from '../../lib/lessonEvaluation.js';

const VIDEO_BASE = import.meta.env.VITE_SIGN_VIDEO_BASE_URL || '';

export default function ExpressionStep({ levelId, expression, index, total, phase, watched, result, onWatched, onAttemptStart, onFinal }) {
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const url = referenceVideoUrl(expression, VIDEO_BASE);
  function togglePlayback() {
    const video = videoRef.current;
    if (video.paused) void video.play().catch(() => setPlaying(false));
    else video.pause();
  }

  function finishPlayback(event) {
    setPlaying(false);
    onWatched();
    // Native looping suppresses the ended event used to record progress.
    if (repeat) {
      const video = event.currentTarget;
      video.currentTime = 0;
      void video.play().catch(() => setPlaying(false));
    }
  }

  return <div className="expression-card">
    <div className="expression-info"><p className="expression-label">{phase === 'video' ? '영상' : '평가'} {index + 1} / {total}</p><h2>{expression.word}</h2><p className="expression-description">{expression.description}</p></div>
    {phase === 'video' ? <>
      {url && !videoError ? <>
        <video ref={videoRef} className="reference-video" controls playsInline preload="metadata"
        aria-label={`${expression.word} 기준 수어 영상`} src={url}
        onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
          onEnded={finishPlayback} onError={() => { setPlaying(false); setVideoError(true); }} />
        <div className="reference-video-controls">
          <button type="button" className="outline-button" onClick={togglePlayback}
            aria-label={playing ? '일시정지' : '재생'} title={playing ? '일시정지' : '재생'}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ verticalAlign: 'middle' }}>
              {playing ? <path d="M6 4h4v16H6zm8 0h4v16h-4z" /> : <path d="M8 4v16l12-8z" />}
            </svg>
          </button>
          <button type="button" className="outline-button" aria-label="반복 재생" aria-pressed={repeat}
            onClick={() => setRepeat(value => !value)}>반복 재생 {repeat ? 'ON' : 'OFF'}</button>
        </div>
      </>
        : <div className="sign-video"><div className="video-placeholder"><span className="video-placeholder-icon" aria-hidden="true"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m10 9 5 3-5 3Z" /></svg></span>
          <p>{videoError ? '기준 영상을 불러오지 못했습니다.' : '이 표현의 기준 영상은 준비 중입니다.'}</p>
          <span>이전·다음 버튼으로 다른 표현을 확인할 수 있어요.</span>
          {videoError && <button className="outline-button" onClick={() => setVideoError(false)}>영상 다시 불러오기</button>}
        </div></div>}
      <p className="lesson-progress-text">{watched ? '시청 완료 · 다시 볼 수 있어요.' : '영상이 끝나면 시청 완료로 표시돼요.'}</p>
    </> : <SignEvaluation embedded evaluationKind={levelId === 'intermediate' ? 'word' : undefined} word={expression.word} targetId={expression.contentId ?? null}
      initialResult={result} onAttemptStart={onAttemptStart} onFinal={onFinal} />}
  </div>;
}
