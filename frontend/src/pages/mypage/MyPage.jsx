import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/context.js';
import { levels, lessons } from '../../data/curriculum.js';
import { useLearningProgress } from '../../hooks/useLearningProgress.js';
import { authService } from '../../lib/supabase.js';
import { lessonLink, progressPercent } from '../../lib/progress.js';
import './MyPage.css';

function PasswordForm() {
  const [values, setValues] = useState({ currentPassword: '', password: '', confirmation: '' });
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState({ error: '', success: '' });
  async function submit(event) {
    event.preventDefault();
    if (pending) return;
    setMessage({ error: '', success: '' });
    if (values.password !== values.confirmation) {
      setMessage({ error: '새 비밀번호가 일치하지 않습니다.', success: '' }); return;
    }
    setPending(true);
    try {
      await authService.changePassword(values);
      setValues({ currentPassword: '', password: '', confirmation: '' });
      setMessage({ error: '', success: '비밀번호가 변경되었습니다. 다음 로그인부터 새 비밀번호를 사용해주세요.' });
    } catch (e) { setMessage({ error: e.message, success: '' }); }
    finally { setPending(false); }
  }
  return <section className="mypage-card">
    <div className="mypage-section-title"><span>계정 관리</span><h2>비밀번호 변경</h2></div>
    <form className="password-form" onSubmit={submit}>
      <fieldset disabled={pending}>
        <label htmlFor="current-password">현재 비밀번호</label>
        <input id="current-password" type="password" autoComplete="current-password" value={values.currentPassword} onChange={(e) => setValues({ ...values, currentPassword: e.target.value })} required />
        <label htmlFor="new-password">새 비밀번호</label>
        <input id="new-password" type="password" autoComplete="new-password" placeholder="8자 이상 입력해주세요" minLength={8} maxLength={128} value={values.password} onChange={(e) => setValues({ ...values, password: e.target.value })} required />
        <label htmlFor="confirm-password">새 비밀번호 확인</label>
        <input id="confirm-password" type="password" autoComplete="new-password" placeholder="새 비밀번호를 다시 입력해주세요" maxLength={128} value={values.confirmation} onChange={(e) => setValues({ ...values, confirmation: e.target.value })} required />
        {message.error && <p className="auth-error" role="alert">{message.error}</p>}
        {message.success && <p className="mypage-success" role="status">{message.success}</p>}
        <button className="main-button" type="submit">{pending ? '변경 중…' : '비밀번호 변경'}</button>
      </fieldset>
    </form>
  </section>;
}

export default function MyPage() {
  const { profile } = useAuth();
  const { records, loading, error, reload } = useLearningProgress();
  const byUnit = Object.fromEntries(records.map((r) => [r.unit_id, r]));
  const recent = records.find((r) => !r.completed_at && lessons[r.unit_id]) || records.find((r) => lessons[r.unit_id]);
  const completedUnits = records.filter((r) => r.completed_at && lessons[r.unit_id]).length;
  const studied = records.reduce((sum, r) => sum + (lessons[r.unit_id] ? r.completed_expressions : 0), 0);
  const total = Object.values(lessons).reduce((sum, unit) => sum + unit.count, 0);
  return <main className="mypage">
    <div className="mypage-intro"><span>MY PAGE</span><h1>나의 손말잇기</h1><p>{profile.name}님의 배움을 차곡차곡 모았어요.</p></div>
    <section className="mypage-profile mypage-card">
      <img src="/sonmalitgi-icon.png" alt="" />
      <div><h2>{profile.name}님</h2><p>아이디 · {profile.username}</p><small>가입일 · {new Date(profile.created_at).toLocaleDateString('ko-KR')}</small></div>
      <Link to="/level" className="mypage-link">학습하러 가기 →</Link>
    </section>
    <section className="mypage-card" aria-labelledby="progress-title">
      <div className="mypage-section-title"><span>나의 배움 기록</span><h2 id="progress-title">학습현황</h2></div>
      {loading ? <p role="status">학습 기록을 불러오고 있어요…</p> : error ? <div role="alert"><p className="auth-error">{error}</p><button className="outline-button" onClick={reload}>다시 불러오기</button></div> : <>
        <div className="mypage-stats">
          <div><strong>{completedUnits}<small> / {Object.keys(lessons).length}</small></strong><span>완료한 유닛</span></div>
          <div><strong>{studied}<small> / {total}</small></strong><span>학습한 표현</span></div>
          <div><strong>{records.length}</strong><span>시작한 유닛</span></div>
        </div>
        {recent ? <div className="mypage-resume">
          <div><small>{recent.completed_at ? '최근 완료한 학습' : '이어서 학습하기'}</small><h3>UNIT {recent.unit_id} · {lessons[recent.unit_id].title}</h3>
            <p>{recent.completed_at ? '완료한 내용을 다시 복습해보세요.' : `표현 ${recent.expression_index + 1} / ${recent.total_expressions} · ${lessons[recent.unit_id].expressions[recent.expression_index]?.word || ''}`}</p></div>
          <Link className="mypage-primary-link" to={lessonLink(recent.unit_id)}>{recent.completed_at ? '다시 학습하기' : '이어서 학습'} →</Link>
        </div> : <div className="mypage-empty"><h3>첫 배움을 시작해볼까요?</h3><p>유닛을 시작하면 이곳에 학습 기록이 쌓여요.</p><Link to="/level" className="mypage-primary-link">학습 시작하기 →</Link></div>}
        <div className="mypage-levels">{Object.entries(levels).map(([levelId, level]) => <section key={levelId}>
          <h3>{level.name}</h3><div className="mypage-units">{level.units.map((unit) => {
            const record = byUnit[unit.id]; const percent = progressPercent(record);
            return <Link key={unit.id} to={lessonLink(unit.id)} className="mypage-unit">
              <div className="mypage-unit-top"><small>UNIT {unit.id}</small><span className={record?.completed_at ? 'complete' : ''}>{record?.completed_at ? '학습 완료' : record ? '학습 중' : '시작 전'}</span></div>
              <h4>{unit.title}</h4><p>{record?.completed_expressions || 0} / {unit.count}개 표현 · {percent}%</p>
              <div className="progress-background" role="progressbar" aria-label={`${unit.title} 학습률`} aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}><div className="progress-fill" style={{ width: `${percent}%` }} /></div>
            </Link>;
          })}</div>
        </section>)}</div>
      </>}
    </section>
    <PasswordForm />
  </main>;
}
