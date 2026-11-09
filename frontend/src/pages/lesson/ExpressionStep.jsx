import { useRef, useState } from 'react';
import { SignEvaluation } from '../practice/Practice.jsx';
import { referenceVideoUrl } from '../../lib/lessonEvaluation.js';

import { numberSignSource, numberSignVideos } from '../../data/numberSignVideos.js';

/*
 * [한국수어사전 콘텐츠 이용 안내]
 * 본 서비스의 일부 수어 학습 콘텐츠는 국립국어원 한국수어사전에서 제공하는 자료를 참조합니다.
 * CC BY-NC-ND 2.0 대한민국 라이선스가 적용되는 콘텐츠는 저작자표시, 비영리, 변경금지 조건을 준수해야 합니다.
 * 원본 영상을 임의로 수정하거나, 별도 허가 없이 다운로드 및 재배포하지 않습니다.
 * 공식적으로 허용된 임베드 방식 또는 원본 상세 페이지 연결 방식만 사용합니다.
 * 주의: 코드 주석은 개발자용 안내이며, 실제 웹페이지에도 이용자가 확인할 수 있는 출처 및 라이선스 정보를 표시해야 합니다.
 */

const VIDEO_BASE = import.meta.env.VITE_SIGN_VIDEO_BASE_URL || '';

export default function ExpressionStep({ levelId, expression, index, total, phase, watched, result, onWatched, onAttemptStart, onFinal }) {
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const dictionaryVideo = levelId === 'beginner' ? numberSignVideos[expression.contentId] : undefined;
  const url = dictionaryVideo ? null : referenceVideoUrl(expression, VIDEO_BASE);
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
      {dictionaryVideo ? <>
        <div className="sign-video"><div className="video-placeholder">
          <p>{dictionaryVideo.headword}</p>
          <a className="outline-button dictionary-video-link" href={dictionaryVideo.detailUrl} target="_blank" rel="noopener noreferrer">
            원본 수어 영상 보기 (새 탭)
          </a>
        </div></div>
        <div className="lesson-progress-text dictionary-video-credit">
          <p>출처: {numberSignSource.name}</p>
          <p>라이선스: <a href={numberSignSource.licenseUrl}>{numberSignSource.license}</a> · <a href={numberSignSource.policyUrl}>사전 저작권 정책</a></p>
          <ul>
            <li>저작자표시(BY): 저작자 및 원본 출처 명시</li>
            <li>비영리(NC): 영리 목적 사용 금지</li>
            <li>변경금지(ND): 원본 영상의 수정 및 편집 금지</li>
          </ul>
        </div>
        {!watched && <button type="button" className="outline-button" onClick={onWatched}>시청 완료 표시</button>}
      </> : url && !videoError ? <>
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
      <p className="lesson-progress-text">{watched ? '시청 완료 · 다시 볼 수 있어요.' : dictionaryVideo
        ? '새 탭에서 영상을 끝까지 본 뒤, 이 화면에서 시청 완료를 표시해 주세요.'
        : '영상이 끝나면 시청 완료로 표시돼요.'}</p>
    </> : <SignEvaluation embedded evaluationKind={levelId === 'intermediate' ? 'word' : undefined} word={expression.word} targetId={expression.contentId ?? null}
      initialResult={result} onAttemptStart={onAttemptStart} onFinal={onFinal} />}
  </div>;
}
