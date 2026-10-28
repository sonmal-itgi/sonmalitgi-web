import { useEffect, useState } from 'react';
import { lessons, getLevelId } from '../../data/curriculum.js';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../auth/context.js';
import { progressService } from '../../lib/supabase.js';
import './Lesson.css';
import ExpressionStep from './ExpressionStep.jsx';

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
    <p className="lesson-progress-text">이 유닛은 표현 {lesson.expressions.length}개를 각각 시청하고 평가합니다. 현재 {currentIndex + 1}번째 평가 순서예요.</p>
    <ExpressionStep key={currentIndex} expression={current} index={currentIndex}
      total={lesson.expressions.length} isLast={isLast} pending={pending}
      saveError={saveError} onNext={nextExpression} />
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
