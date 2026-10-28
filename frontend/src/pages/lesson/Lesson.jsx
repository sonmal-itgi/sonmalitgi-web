import { useEffect, useState } from 'react';
import { lessons, getLevelId } from '../../data/curriculum.js';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../auth/context.js';
import { progressService } from '../../lib/supabase.js';
import { canAdvanceExpression } from '../../lib/lessonEvaluation.js';
import ExpressionStep from './ExpressionStep.jsx';
import './Lesson.css';

function LessonSession({ lesson, listPath }) {
  const navigate = useNavigate();
  // 0..N-1: all reference videos; N..2N-1: all expression evaluations.
  const [step, setStep] = useState(0);
  const [watched, setWatched] = useState({});
  const [assessments, setAssessments] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [pending, setPending] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const unitId = lesson.id;
  const total = lesson.expressions.length;
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const record = await progressService.getUnit(unitId);
        if (!active) return;
        // Existing progress is not proof of watching every video or passing AI evaluation.
        // Start this session at video 1; keep historical completed progress intact.
        if (!record) await progressService.save(unitId, 0);
        if (active) { setLoading(false); setLoadError(''); }
      } catch (e) { if (active) { setLoadError(e.message); setLoading(false); } }
    })();
    return () => { active = false; };
  }, [unitId, attempt]);

  const phase = step < total ? 'video' : 'evaluation';
  const index = step % total;
  const passed = lesson.expressions.map((expression, i) => canAdvanceExpression(expression, watched[i], assessments[i]));
  const watchedCount = Object.values(watched).filter(Boolean).length;
  const passedCount = passed.filter(Boolean).length;
  const allPassed = passed.every(Boolean);
  let passedPrefix = 0;
  while (passedPrefix < total && passed[passedPrefix]) passedPrefix++;

  function previous() {
    if (pending) return;
    setSaveError('');
    setStep((current) => Math.max(0, current - 1));
  }
  async function next() {
    if (pending || step === total * 2 - 1) return;
    setSaveError('');
    if (phase === 'evaluation' && passedPrefix > 0) {
      setPending(true);
      try {
        // Browsing ahead must never count skipped/failed expressions as completed.
        await progressService.save(unitId, Math.min(passedPrefix, total - 1), false);
      } catch (e) { setSaveError(e.message); return; }
      finally { setPending(false); }
    }
    setStep((current) => current + 1);
  }
  async function complete() {
    if (pending || !allPassed) return;
    setPending(true); setSaveError('');
    try {
      await progressService.save(unitId, total - 1, true);
      navigate(listPath);
    } catch (e) { setSaveError(e.message); }
    finally { setPending(false); }
  }
  if (loading) return <main className="auth-status" role="status">학습 기록을 확인하고 있어요…</main>;
  if (loadError) return <main className="auth-status">
    <p role="alert">{loadError}</p>
    <button className="outline-button" onClick={() => { setLoading(true); setLoadError(''); setAttempt((n) => n + 1); }}>다시 시도</button>
    <button className="text-button" onClick={() => navigate(listPath)}>유닛 목록으로</button>
  </main>;
  const current = lesson.expressions[index];
  return <div className="lesson-page"><div className="lesson-container">
    <button className="lesson-back" disabled={pending} onClick={() => navigate(listPath)}>← Unit 목록</button>
    <div className="lesson-header"><span>UNIT {unitId}</span><h1>{lesson.title}</h1><p>{lesson.description}</p></div>
    <ol className="expression-stages" aria-label="유닛 학습 순서">
      <li aria-current={phase === 'video' ? 'step' : undefined}>1. 영상 전체 시청 ({total}개)</li>
      <li aria-current={phase === 'evaluation' ? 'step' : undefined}>2. 표현별 평가 ({total}개)</li>
    </ol>
    <div className="lesson-progress">
      <div className="lesson-progress-text">{phase === 'video' ? '영상' : '평가'} {index + 1} / {total} · 시청 완료 {watchedCount}개 · 평가 통과 {passedCount}개</div>
      <div className="progress-background"><div className="progress-fill" style={{ width: `${(step + 1) / (total * 2) * 100}%` }} /></div>
    </div>
    {phase === 'evaluation' && watchedCount < total && <p className="evaluation-notice">아직 모든 영상을 시청하지 않았어요. 평가 화면은 둘러볼 수 있지만 유닛 완료에는 전체 영상 시청과 모든 평가 통과가 필요해요.</p>}
    <ExpressionStep key={step} expression={current} index={index} total={total} phase={phase}
      watched={Boolean(watched[index])} result={assessments[index] || null}
      onWatched={() => setWatched((previous) => ({ ...previous, [index]: true }))}
      onAttemptStart={() => setAssessments((previous) => ({ ...previous, [index]: null }))}
      onFinal={(result) => setAssessments((previous) => ({ ...previous, [index]: result }))} />
    {saveError && <p className="lesson-save-error" role="alert">{saveError}</p>}
    <nav className="lesson-navigation" aria-label="학습 이전 다음 이동">
      <button className="outline-button" disabled={pending || step === 0} onClick={previous}>
        {phase === 'video' ? '이전 영상' : index === 0 ? '영상으로 돌아가기' : '이전 평가'}
      </button>
      <button className="next-button" disabled={pending || step === total * 2 - 1} onClick={next}>
        {pending ? '저장 중…' : phase === 'video' ? index === total - 1 ? '평가로 이동' : '다음 영상' : '다음 평가'}
      </button>
    </nav>
    {phase === 'evaluation' && <>
      <p className="lesson-progress-text">이전·다음으로 평가를 이동해도 이 세션의 결과는 유지돼요. 다시 평가하면 해당 표현의 결과만 갱신돼요.</p>
      {index === total - 1 && <button className="next-button" disabled={pending || !allPassed} onClick={complete}>{pending ? '저장 중…' : '유닛 완료'}</button>}
    </>}
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
