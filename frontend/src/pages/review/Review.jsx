import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/context.js';
import { lessons, levels } from '../../data/curriculum.js';
import { reviewService } from '../../lib/supabase.js';
import { reviewLessonLink } from '../../lib/review.js';
import './Review.css';

export default function Review() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const [attempt, setAttempt] = useState(0);
  const [filter, setFilter] = useState('active');
  const [state, setState] = useState({ userId: null, attempt: -1, notes: [], error: '' });
  useEffect(() => {
    let active = true;
    reviewService.getAll().then(notes => {
      if (active) setState({ userId, attempt, notes, error: '' });
    }, error => { if (active) setState({ userId, attempt, notes: [], error: error.message }); });
    return () => { active = false; };
  }, [userId, attempt]);
  const loading = state.userId !== userId || state.attempt !== attempt;
  const notes = loading ? [] : state.notes;
  const activeCount = notes.filter(note => !note.resolved_at).length;
  const resolvedCount = notes.length - activeCount;
  const filtered = notes.filter(note => filter === 'all' || (filter === 'resolved' ? note.resolved_at : !note.resolved_at));
  return <main className="review-page">
    <div className="review-heading"><div><p className="page-eyebrow">ONE MORE TRY</p><h1>다시 익히는,<br /><span>나의 표현.</span></h1><p>틀렸던 표현을 한 번 더 살펴보고,<br />직접 표현하며 나의 것으로 만들어보세요.</p></div>
      <div className="review-summary"><span aria-hidden="true">↺</span><div><strong>{loading || state.error ? '—' : activeCount}<small>개 표현</small></strong><p>다시 연습할 표현이 모여 있어요.</p></div></div>
    </div>
    <div className="review-tabs" role="group" aria-label="오답노트 분류">
      {[['active','복습할 표현',activeCount],['resolved','복습 완료',resolvedCount],['all','전체',notes.length]].map(([value,label,count]) => <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{label} <span>{loading || state.error ? '—' : count}</span></button>)}
    </div>
    {loading ? <div className="review-empty" role="status">오답노트를 불러오고 있어요…</div>
      : state.error ? <div className="review-empty" role="alert"><p>{state.error}</p><button className="outline-button" onClick={() => setAttempt(n => n + 1)}>다시 불러오기</button></div>
      : filtered.length === 0 ? <div className="review-empty"><span className="review-empty-icon" aria-hidden="true">{filter === 'active' && notes.length ? '✓' : '↺'}</span><h2>{filter === 'resolved' ? '복습 완료한 표현이 아직 없어요.' : filter === 'active' && notes.length ? '복습할 표현을 모두 익혔어요!' : '차곡차곡, 다시 배워가요.'}</h2><p>{filter === 'resolved' ? '오답 표현을 다시 평가해 통과하면 이곳에 모여요.' : '평가에서 틀린 표현은 자동으로 저장돼요.'}</p><Link className="review-primary" to="/level">학습하러 가기 <span aria-hidden="true">→</span></Link></div>
      : <div className="review-grid">{filtered.map(note => {
        const lesson = lessons[note.unit_id];
        const expression = lesson.expressions[note.expression_index];
        return <article className="review-card" key={`${note.unit_id}:${note.expression_index}`}>
          <div className="review-card-top"><span>{levels[lesson.levelId].name} · UNIT {note.unit_id}</span><span className={note.resolved_at ? 'review-badge resolved' : 'review-badge'}>{note.resolved_at ? '복습 완료' : '복습 필요'}</span></div>
          <p className="review-unit-name">{lesson.title} · 표현 {note.expression_index + 1}</p><h2>{expression.word}</h2><p className="review-description">{expression.description}</p>
          <div className="review-feedback"><small>마지막 오답 피드백</small><p>{note.feedback || '기준 영상을 다시 보고 표현을 연습해보세요.'}</p></div>
          <p className="review-meta">오답 {note.mistake_count}회 <span>·</span> 마지막 오답 {new Date(note.last_failed_at).toLocaleDateString('ko-KR')}</p>
          <div className="review-actions"><Link to={reviewLessonLink(note.unit_id,note.expression_index)}>기준 영상 보기</Link><Link className="review-primary" to={reviewLessonLink(note.unit_id,note.expression_index,'evaluation')}>다시 평가하기 <span aria-hidden="true">→</span></Link></div>
        </article>;
      })}</div>}
    <p className="review-footnote">촬영 오류·판단 불확실·통신 테스트 결과는 오답으로 저장하지 않아요.</p>
  </main>;
}
