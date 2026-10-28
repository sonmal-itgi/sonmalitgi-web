import { useState } from 'react';
import { SignEvaluation } from '../practice/Practice.jsx';
import { referenceVideoUrl } from '../../lib/lessonEvaluation.js';

const VIDEO_BASE = import.meta.env.VITE_SIGN_VIDEO_BASE_URL || '';

export default function ExpressionStep({ expression, index, total, phase, watched, result, onWatched, onAttemptStart, onFinal }) {
  const [videoError, setVideoError] = useState(false);
  const url = referenceVideoUrl(expression, VIDEO_BASE);
  return <div className="expression-card">
    <div className="expression-info"><p className="expression-label">{phase === 'video' ? '영상' : '평가'} {index + 1} / {total}</p><h2>{expression.word}</h2><p className="expression-description">{expression.description}</p></div>
    {phase === 'video' ? <>
      {url && !videoError ? <video className="reference-video" controls playsInline preload="metadata"
        aria-label={`${expression.word} 기준 수어 영상`} src={url}
        onEnded={onWatched} onError={() => setVideoError(true)} />
        : <div className="sign-video"><div className="video-placeholder">
          <p>{videoError ? '기준 영상을 불러오지 못했습니다.' : '이 표현의 기준 영상은 준비 중입니다.'}</p>
          <span>이전·다음 버튼으로 다른 표현을 확인할 수 있어요.</span>
          {videoError && <button className="outline-button" onClick={() => setVideoError(false)}>영상 다시 불러오기</button>}
        </div></div>}
      <p className="lesson-progress-text">{watched ? '시청 완료 · 다시 볼 수 있어요.' : '영상이 끝나면 시청 완료로 표시돼요.'}</p>
    </> : <SignEvaluation embedded word={expression.word} targetId={expression.contentId ?? null}
      initialResult={result} onAttemptStart={onAttemptStart} onFinal={onFinal} />}
  </div>;
}
