import { useEffect, useState } from 'react';
import { lessons, getLevelId } from '../../data/curriculum.js';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../auth/context.js';
import { progressService } from '../../lib/supabase.js';
import './Lesson.css';

function LessonSession({ lesson, listPath }) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [pending, setPending] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const unitId = lesson.id;
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const record = await progressService.getUnit(unitId);
        if (!active) return;
        const index = record?.completed_at ? 0 : Math.min(record?.expression_index || 0, lesson.count - 1);
        await progressService.save(unitId, index);
        if (active) { setCurrentIndex(index); setLoading(false); setLoadError(''); }
      } catch (e) { if (active) { setLoadError(e.message); setLoading(false); } }
    })();
    return () => { active = false; };
  }, [unitId, lesson.count, attempt]);

  const isLast = currentIndex === lesson.expressions.length - 1;
  async function nextExpression() {
    if (pending) return;
    setPending(true); setSaveError('');
    try {
      await progressService.save(unitId, isLast ? currentIndex : currentIndex + 1, isLast);
      if (isLast) navigate(listPath);
      else setCurrentIndex((index) => index + 1);
    } catch (e) { setSaveError(e.message); }
    finally { setPending(false); }
  }
  if (loading) return <main className="auth-status" role="status">이전에 공부한 위치를 확인하고 있어요…</main>;
  if (loadError) return <main className="auth-status">
    <p role="alert">{loadError}</p>
    <button className="outline-button" onClick={() => { setLoading(true); setLoadError(''); setAttempt((n) => n + 1); }}>다시 시도</button>
    <button className="text-button" onClick={() => navigate(listPath)}>유닛 목록으로</button>
  </main>;
  const current = lesson.expressions[currentIndex];
  return <div className="lesson-page"><div className="lesson-container">
    <button className="lesson-back" onClick={() => navigate(listPath)}>← Unit 목록</button>
    <div className="lesson-header"><span>UNIT {unitId}</span><h1>{lesson.title}</h1><p>{lesson.description}</p></div>
    <div className="lesson-progress">
      <div className="lesson-progress-text">표현 {currentIndex + 1} / {lesson.expressions.length}</div>
      <div className="progress-background"><div className="progress-fill" style={{ width: `${(currentIndex + 1) / lesson.expressions.length * 100}%` }} /></div>
    </div>
    <div className="expression-card">
      <div className="sign-video"><div className="video-placeholder"><div className="video-icon">▶</div><p>수어 영상 영역</p><span>추후 실제 수어 영상을 연결합니다.</span></div></div>
      <div className="expression-info"><p className="expression-label">학습 표현</p><h2>{current.word}</h2><p className="expression-description">{current.description}</p></div>
    </div>
    {saveError && <p className="lesson-save-error" role="alert">{saveError}</p>}
    <button className="next-button" disabled={pending} onClick={nextExpression}>{pending ? '저장 중…' : isLast ? '학습 완료' : '다음 표현'}</button>
    <p className="lesson-progress-text">다음 표현 또는 학습 완료를 누르면 학습현황이 저장돼요.</p>
  </div></div>;
}

export default function Lesson() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { session } = useAuth();
  const navigate = useNavigate();
  const lesson = lessons[Number(id)];
  const listPath = `/learn?level=${lesson?.levelId || getLevelId(searchParams.get('level'))}`;
  if (!lesson) return <main className="auth-status"><h1>존재하지 않는 유닛입니다.</h1><button onClick={() => navigate(listPath)}>유닛 목록으로</button></main>;
  return <LessonSession key={`${session.user.id}:${lesson.id}`} lesson={lesson} listPath={listPath} />;
}
