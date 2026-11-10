import { useEffect, useRef, useState } from 'react';
import { SignEvaluation } from '../practice/Practice.jsx';
import { referenceVideoUrl } from '../../lib/lessonEvaluation.js';

import { dictionarySentenceVideos, dictionarySignSource, dictionarySignVideos, unavailableSentenceWords } from '../../data/dictionarySignVideos.js';

/*
 * [한국수어사전 콘텐츠 이용 안내]
 * 본 서비스의 일부 수어 학습 콘텐츠는 국립국어원 한국수어사전에서 제공하는 자료를 참조합니다.
 * CC BY-NC-ND 2.0 대한민국 라이선스가 적용되는 콘텐츠는 저작자표시, 비영리, 변경금지 조건을 준수해야 합니다.
 * 원본 영상을 임의로 수정하거나, 별도 허가 없이 다운로드 및 재배포하지 않습니다.
 * 확인된 원본 미디어를 직접 연결하고 사전 상세 페이지와 출처를 함께 표시합니다.
 * 주의: 코드 주석은 개발자용 안내이며, 실제 웹페이지에도 이용자가 확인할 수 있는 출처 및 라이선스 정보를 표시해야 합니다.
 */

const VIDEO_BASE = import.meta.env.VITE_SIGN_VIDEO_BASE_URL || '';

export default function ExpressionStep({ levelId, expression, index, total, phase, watched, result, onWatched, onAttemptStart, onFinal }) {
  const [showHandshape, setShowHandshape] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [clipIndex, setClipIndex] = useState(0);
  const resumePlayback = useRef(false);
  const clips = dictionarySentenceVideos[expression.contentId];
  const unavailableWord = unavailableSentenceWords[expression.contentId];
  const dictionaryVideo = clips?.[clipIndex] ?? dictionarySignVideos[expression.contentId]
    ?? (levelId === 'beginner' ? dictionarySignVideos[expression.word] : undefined);
  const url = dictionaryVideo?.videoUrl ?? referenceVideoUrl(expression, VIDEO_BASE);
  useEffect(() => {
    if (!resumePlayback.current || videoError || !videoRef.current) return;
    resumePlayback.current = false;
    void videoRef.current.play().catch(() => setPlaying(false));
  }, [clipIndex, videoError]);

  function moveToClip(nextIndex, play) {
    resumePlayback.current = play;
    setShowHandshape(false);
    setClipIndex(nextIndex);
  }

  function finishClip() {
    if (clips && clipIndex < clips.length - 1) {
      moveToClip(clipIndex + 1, true);
      return false;
    }
    onWatched();
    return true;
  }

  function togglePlayback() {
    const video = videoRef.current;
    if (clips && video.ended && clipIndex === clips.length - 1) {
      moveToClip(0, true);
      return;
    }
    if (video.paused) void video.play().catch(() => setPlaying(false));
    else video.pause();
  }

  function finishPlayback(event) {
    setPlaying(false);
    if (!finishClip()) return;
    if (repeat && clips) {
      moveToClip(0, true);
      return;
    }
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
      {unavailableWord && <p className="evaluation-notice">
        ‘{unavailableWord}’ 영상은 준비 중입니다. 연결된 구성 단어만 재생됩니다.
      </p>}
      {clips && <p className="lesson-progress-text">
        구성 단어 {clipIndex + 1} / {clips.length} · <strong>{dictionaryVideo.headword}</strong>
      </p>}
      {url && !videoError ? <>
        <video key={clipIndex} ref={videoRef} className="reference-video" controls playsInline preload="metadata"
        aria-label={`${clips ? dictionaryVideo.headword : expression.word} 기준 수어 영상`} src={url}
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
      {dictionaryVideo && <>
        {dictionaryVideo.alternate && <p className="evaluation-notice">
          <strong>⚠ 수형 확인 중</strong>{' '}
          ‘달리다’는 사전에 여러 수형이 있습니다. 현재 영상은 ‘(빠르게) 달리다, 뛰다’이며, AI 평가 모델과의 동작 일치 여부는 아직 확인되지 않았습니다.{' '}
          <a href={dictionaryVideo.alternate.detailUrl} target="_blank" rel="noopener noreferrer">
            다른 수형 ‘{dictionaryVideo.alternate.headword}’ 보기 (새 탭)
          </a>
        </p>}
        <div className="dictionary-handshape">
          <button type="button" className="handshape-button" aria-expanded={showHandshape}
            aria-controls="lesson-handshape" onClick={() => setShowHandshape(value => !value)}>
            수형 사진·설명 {showHandshape ? '접기' : '보기'}
            <span aria-hidden="true">{showHandshape ? '−' : '+'}</span>
          </button>
          <div id="lesson-handshape" className="handshape-panel" hidden={!showHandshape}>
            {showHandshape && <>
              <img src={dictionaryVideo.imageUrl} alt={`${dictionaryVideo.headword} 수형`} />
              <p>{dictionaryVideo.handshape}</p>
            </>}
          </div>
        </div>
        <div className="lesson-progress-text dictionary-video-credit">
          <a className="dictionary-video-link" href={dictionaryVideo.detailUrl} target="_blank" rel="noopener noreferrer">
            원본 수어 영상 보기 (새 탭)
          </a>
          <p>출처: {dictionarySignSource.name}</p>
          <p>라이선스: <a href={dictionarySignSource.licenseUrl}>{dictionarySignSource.license}</a></p>
        </div>
        {videoError && (!watched || clips) && <button type="button" className="outline-button" onClick={() => {
          if (clips && clipIndex < clips.length - 1) setVideoError(false);
          finishClip();
        }}>원본 시청 완료</button>}
      </>}
      <p className="lesson-progress-text">{watched ? (unavailableWord ? '제공된 단어 시청 완료 · 다시 볼 수 있어요.' : '시청 완료 · 다시 볼 수 있어요.') : dictionaryVideo && videoError
        ? '원본 페이지에서 시청한 뒤 시청 완료를 표시해 주세요.'
        : '영상이 끝나면 시청 완료로 표시돼요.'}</p>
    </> : <SignEvaluation embedded evaluationKind={levelId === 'intermediate' ? 'word' : undefined} word={expression.word} targetId={expression.contentId ?? null}
      initialResult={result} onAttemptStart={onAttemptStart} onFinal={onFinal} />}
  </div>;
}
