import { useEffect, useRef, useState } from 'react';
import { lessons, getLevelId } from '../../data/curriculum.js';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../auth/context.js';
import { progressService } from '../../lib/supabase.js';
import { progressDetails } from '../../lib/progress.js';
import { canAdvanceExpression } from '../../lib/lessonEvaluation.js';
import ExpressionStep from './ExpressionStep.jsx';
import './Lesson.css';

function LessonSession({ lesson, listPath }) {
  const navigate = useNavigate();
  // 0..N-1: all reference videos; N..2N-1: all expression evaluations.
  const [step, setStep] = useState(0);
  const [watched, setWatched] = useState({});
  const [assessments, setAssessments] = useState({});
  const [credits, setCredits] = useState({});
  const [syncing, setSyncing] = useState(0);
  const learning = useRef({ watched: {}, passed: {} });
  const queue = useRef(Promise.resolve());
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
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
        const saved = record || await progressService.saveCombined(unitId, [], []);
        if (active) {
          const detail = progressDetails(saved);
          const restored = { watched: Object.fromEntries(detail.watched.map((i) => [i, true])), passed: Object.fromEntries(detail.passed.map((i) => [i, true])) };
          learning.current = restored;
          setWatched(restored.watched); setCredits(restored.passed);
          setLoading(false); setLoadError('');
        }
      } catch (e) { if (active) { setLoadError(e.message); setLoading(false); } }
    })();
    return () => { active = false; };
  }, [unitId, attempt]);

  const phase = step < total ? 'video' : 'evaluation';
  const index = step % total;
  const passed = lesson.expressions.map((_expression, i) => Boolean(watched[i] && credits[i]));
  const detail = progressDetails({ total_expressions: total,
    watched_expression_indices: Object.keys(watched).map(Number), passed_expression_indices: Object.keys(credits).map(Number) });
  const { watchedCount, passedCount, percent } = detail;
  const allPassed = passed.every(Boolean);

  function enqueueSave(snapshot = learning.current, complete = false) {
    const watchedIndices = Object.keys(snapshot.watched).map(Number);
    const passedIndices = Object.keys(snapshot.passed).map(Number);
    setSyncing((count) => count + 1);
    const job = queue.current.then(async () => {
      if (!alive.current) return false;
      try {
        await progressService.saveCombined(unitId, watchedIndices, passedIndices, complete);
        if (alive.current) setSaveError('');
        return true;
      } catch (e) {
        if (alive.current) setSaveError(e.message);
        return false;
      } finally { if (alive.current) setSyncing((count) => count - 1); }
    });
    queue.current = job;
    return job;
  }
  function markWatched() {
    if (learning.current.watched[index]) return;
    const snapshot = { ...learning.current, watched: { ...learning.current.watched, [index]: true } };
    learning.current = snapshot;
    setWatched(snapshot.watched);
    void enqueueSave(snapshot);
  }
  function receiveResult(result) {
    setAssessments((previous) => ({ ...previous, [index]: result }));
    if (!canAdvanceExpression(lesson.expressions[index], learning.current.watched[index], result)
      || learning.current.passed[index]) return;
    const snapshot = { ...learning.current, passed: { ...learning.current.passed, [index]: true } };
    learning.current = snapshot;
    setCredits(snapshot.passed);
    void enqueueSave(snapshot);
  }
  function previous() { if (!pending) setStep((current) => Math.max(0, current - 1)); }
  function next() { if (!pending) setStep((current) => Math.min(total * 2 - 1, current + 1)); }
  async function leave() {
    if (pending) return;
    setPending(true);
    if (await enqueueSave()) navigate(listPath);
    setPending(false);
  }
  async function complete() {
    if (pending || !allPassed) return;
    setPending(true);
    if (await enqueueSave(learning.current, true)) navigate(listPath);
    setPending(false);
  }
  if (loading) return <main className="auth-status" role="status">학습 기록을 확인하고 있어요…</main>;
  if (loadError) return <main className="auth-status">
    <p role="alert">{loadError}</p>
    <button className="outline-button" onClick={() => { setLoading(true); setLoadError(''); setAttempt((n) => n + 1); }}>다시 시도</button>
    <button className="text-button" onClick={() => navigate(listPath)}>유닛 목록으로</button>
  </main>;
  const current = lesson.expressions[index];
  return <div className="lesson-page"><div className="lesson-container">
    <button className="lesson-back" disabled={pending} onClick={leave}>← 유닛 목록</button>
    <div className="lesson-header"><span>UNIT {unitId}</span><h1>{lesson.title}</h1><p>{lesson.description}</p></div>
    <ol className="expression-stages" aria-label="유닛 학습 순서">
      <li aria-current={phase === 'video' ? 'step' : undefined}>1. 영상 전체 시청 ({total}개)</li>
      <li aria-current={phase === 'evaluation' ? 'step' : undefined}>2. 표현별 평가 ({total}개)</li>
    </ol>
    <div className="lesson-progress">
      <div className="lesson-progress-summary"><strong>전체 진행률 <span>{percent}%</span></strong><span>시청 완료 {watchedCount}개 · 평가 통과 {passedCount}개</span></div>
      <div className="progress-background" role="progressbar" aria-label="시청과 평가 통합 진행률" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}><div className="progress-fill" style={{ width: `${percent}%` }} /></div>
      <p className="lesson-progress-text">영상 시청 50% + 평가 통과 50%</p>
    </div>
    {phase === 'evaluation' && watchedCount < total && <p className="evaluation-notice">아직 모든 영상을 시청하지 않았어요. 평가 화면은 둘러볼 수 있지만 유닛 완료에는 전체 영상 시청과 모든 평가 통과가 필요해요.</p>}
    <ExpressionStep key={step} expression={current} index={index} total={total} phase={phase}
      watched={Boolean(watched[index])} result={assessments[index] || null}
      onWatched={markWatched}
      onAttemptStart={() => setAssessments((previous) => ({ ...previous, [index]: null }))}
      onFinal={receiveResult} />
    {credits[index] && phase === 'evaluation' && <p className="lesson-progress-text">이 표현은 이미 평가를 통과했어요. 다시 연습해도 완료 기록은 유지됩니다.</p>}
    {syncing > 0 && <p className="lesson-progress-text" role="status">시청·평가 기록 저장 중…</p>}
    {saveError && <div className="lesson-save-error" role="alert"><p>{saveError}</p><button className="outline-button" onClick={() => void enqueueSave()} disabled={syncing > 0}>다시 저장</button></div>}
    <nav className="lesson-navigation" aria-label="학습 이전 다음 이동">
      <button className="outline-button" disabled={pending || step === 0} onClick={previous}>
        {phase === 'video' ? '이전 영상' : index === 0 ? '영상으로 돌아가기' : '이전 평가'}
      </button>
      <button className="next-button" disabled={pending || step === total * 2 - 1} onClick={next}>
        {pending ? '저장 중…' : phase === 'video' ? index === total - 1 ? '평가로 이동' : '다음 영상' : '다음 평가'}
      </button>
    </nav>
    {phase === 'evaluation' && <>
      <p className="lesson-progress-text">이전·다음으로 이동해도 진행률은 그대로예요. 시청 완료와 평가 통과만 반영해요.</p>
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
