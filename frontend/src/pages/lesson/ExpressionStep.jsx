import { useState } from 'react';
import { SignEvaluation } from '../practice/Practice.jsx';
import { canAdvanceExpression, referenceVideoUrl } from '../../lib/lessonEvaluation.js';

const VIDEO_BASE = import.meta.env.VITE_SIGN_VIDEO_BASE_URL || '';

export default function ExpressionStep({ expression, index, total, isLast, pending, saveError, onNext }) {
  const [phase, setPhase] = useState('video');
  const [watched, setWatched] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [assessment, setAssessment] = useState(null);
  const url = referenceVideoUrl(expression, VIDEO_BASE);
  const canAdvance = canAdvanceExpression(expression, watched, assessment);

  function replay() {
    setPhase('video');
    setAssessment(null);
  }

  return <>
    <ol className="expression-stages" aria-label="표현 학습 순서">
      <li aria-current={phase === 'video' ? 'step' : undefined}>1. 기준 영상 보기</li>
      <li aria-current={phase === 'evaluation' ? 'step' : undefined}>2. 직접 표현하고 평가받기</li>
    </ol>
    <div className="expression-card">
      <div className="expression-info"><p className="expression-label">표현 {index + 1} / {total}</p><h2>{expression.word}</h2><p className="expression-description">{expression.description}</p></div>
      {phase === 'video' ? <>
        {url && !videoError ? <video className="reference-video" controls playsInline preload="metadata"
          aria-label={`${expression.word} 기준 수어 영상`} src={url}
          onEnded={() => { setWatched(true); setPhase('evaluation'); }}
          onError={() => setVideoError(true)} />
          : <div className="sign-video"><div className="video-placeholder">
            <p>{videoError ? '기준 영상을 불러오지 못했습니다.' : '이 표현의 기준 영상은 준비 중입니다.'}</p>
            <span>영상이 연결되면 끝까지 시청한 뒤 평가가 이어집니다.</span>
            {videoError && <button className="outline-button" onClick={() => setVideoError(false)}>영상 다시 불러오기</button>}
          </div></div>}
        {watched && <button className="next-button" onClick={() => setPhase('evaluation')}>이 표현 평가하기</button>}
        {(!url || videoError) && <button className="outline-button evaluation-preview" onClick={() => setPhase('evaluation')}>평가 화면 미리보기</button>}
      </> : <>
        <button className="lesson-back" onClick={replay} disabled={pending}>← 기준 영상 다시 보기</button>
        {!watched && <p className="evaluation-notice">영상 미연결 상태의 미리보기입니다. 학습 완료로 기록되지 않습니다.</p>}
        <SignEvaluation key={expression.contentId || expression.word} embedded word={expression.word}
          targetId={expression.contentId ?? null}
          onAttemptStart={() => setAssessment(null)} onFinal={setAssessment} />
      </>}
    </div>
    {saveError && <p className="lesson-save-error" role="alert">{saveError}</p>}
    {phase === 'evaluation' && <>
      <button className="next-button" disabled={pending || !canAdvance} onClick={onNext}>
        {pending ? '저장 중…' : isLast ? '마지막 평가 완료 · 유닛 완료' : '평가 완료 · 다음 표현'}
      </button>
      <p className="lesson-progress-text">기준 영상을 시청하고 이 표현의 평가를 통과하면 다음 표현으로 이동할 수 있어요. 재시도와 촬영 오류는 완료에 포함하지 않아요.</p>
    </>}
  </>;
}
