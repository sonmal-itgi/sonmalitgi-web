import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context.js';
import { authService } from '../../lib/supabase.js';
import './Auth.css';

export default function AuthPage({ signup = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { configured } = useAuth();
  const [values, setValues] = useState({ name: '', username: '', password: '' });
  const [confirmation, setConfirmation] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(() =>
    new URLSearchParams(location.search).has('error') || new URLSearchParams(location.hash.slice(1)).has('error')
      ? '카카오 로그인이 취소되었거나 완료되지 않았습니다. 다시 시도해주세요.' : '');
  const [kakaoReady, setKakaoReady] = useState(false);
  useEffect(() => {
    let active = true;
    if (configured) authService.kakaoAvailable().then(
      ready => { if (active) setKakaoReady(ready); },
      () => { if (active) setKakaoReady(false); },
    );
    return () => { active = false; };
  }, [configured]);
  async function kakaoLogin() {
    if (pending || !kakaoReady) return;
    setError(''); setPending(true);
    try {
      await authService.loginWithKakao({origin:window.location.origin, next:location.state?.from || new URLSearchParams(location.search).get('next')});
    } catch (e) { setError(e.message); setPending(false); }
  }
  function update(event) { setValues({ ...values, [event.target.name]: event.target.value }); }
  async function submit(event) {
    event.preventDefault();
    if (pending) return;
    setError('');
    if (signup && confirmation !== values.password) { setError('비밀번호가 일치하지 않습니다.'); return; }
    setPending(true);
    try {
      await (signup ? authService.signup(values) : authService.login(values));
      // GuestOnly waits for a persisted profile before redirecting.
    } catch (e) { setError(e.message); }
    finally { setPending(false); }
  }
  return <main className="auth-page"><div className="auth-layout">
    <aside className="auth-story" aria-label="손말잇기 소개">
      <a href="/" className="auth-brand"><img src="/sonmalitgi-icon.png" alt="" />손말잇기</a>
      <div className="auth-story-copy"><span className="page-eyebrow">A LITTLE, EVERY DAY</span>
        <h2>손끝에서 시작되는<br /><span>새로운 대화.</span></h2>
        <p>한 표현을 알아가는 오늘이<br />서로를 이해하는 내일이 되도록.</p>
      </div>
      <div className="auth-story-art" aria-hidden="true"><div className="auth-art-ring" /><img src="/sonmalitgi-icon.png" alt="" /><span>너와 나 사이, 손말잇기</span></div>
      <p className="auth-story-footer">보고, 표현하고, 배움을 쌓아요. <span aria-hidden="true">↗</span></p>
    </aside>
    <div className="auth-card">
    <button type="button" className="back-button" aria-label="홈으로" onClick={() => navigate('/')}>←</button>
    <p className="auth-form-eyebrow">{signup ? "JOIN OUR JOURNEY" : "WELCOME BACK"}</p>
    <h1>{signup ? <>손말잇기에 오신 걸<br />환영해요!</> : '다시 만나 반가워요.'}</h1>
    <p>{signup ? <>이름과 아이디를 입력하고<br />학습을 시작해보세요.</> : <>손말잇기에 로그인하고<br />학습을 계속해보세요.</>}</p>
    {!configured && <p className="auth-error" role="status">회원 서비스 연결을 준비 중입니다.</p>}
    <form onSubmit={submit}><fieldset disabled={pending || !configured}>
      {signup && <>
        <label htmlFor="name">이름</label>
        <input id="name" name="name" autoComplete="name" placeholder="이름을 입력해주세요" value={values.name} onChange={update} required maxLength={50} />
      </>}
      <label htmlFor="username">아이디</label>
      <input id="username" name="username" autoComplete="username" autoCapitalize="none" spellCheck={false} placeholder="영문, 숫자, 밑줄 4~20자" value={values.username} onChange={update} required minLength={4} maxLength={20} aria-describedby="username-hint" />
      <small id="username-hint" className="auth-hint">영문 대소문자는 구분하지 않아요.</small>
      <label htmlFor="password">비밀번호</label>
      <input id="password" name="password" type="password" autoComplete={signup ? 'new-password' : 'current-password'} placeholder={signup ? '8자 이상 입력해주세요' : '비밀번호를 입력해주세요'} value={values.password} onChange={update} required minLength={signup ? 8 : undefined} maxLength={signup ? 128 : undefined} />
      {signup && <>
        <label htmlFor="confirmation">비밀번호 확인</label>
        <input id="confirmation" type="password" autoComplete="new-password" placeholder="비밀번호를 다시 입력해주세요" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} required maxLength={128} />
      </>}
      {error && <p className="auth-error" role="alert">{error}</p>}
      <button type="submit" className="main-button full">{pending ? '처리 중…' : signup ? '회원가입' : '로그인'}</button>
    </fieldset></form>
    <div className="auth-divider"><span>간편 로그인</span></div>
    <button type="button" className="kakao-login-button full" disabled={pending || !configured || !kakaoReady} onClick={kakaoLogin}>
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M12 3C6.5 3 2 6.4 2 10.6c0 2.7 1.8 5.1 4.6 6.4L5.5 21l4.6-3a14 14 0 0 0 1.9.2c5.5 0 10-3.4 10-7.6S17.5 3 12 3Z" /></svg>
      {kakaoReady ? '카카오로 로그인' : '카카오 로그인 준비 중'}
    </button>
    {!signup && <div className="auth-divider"><span>처음이신가요?</span></div>}
    <button type="button" disabled={pending} className={signup ? 'text-button' : 'outline-button full'} onClick={() => navigate(signup ? '/login' : '/signup', { state: location.state })}>
      {signup ? '이미 계정이 있으신가요? 로그인' : '회원가입하기'}
    </button>
  </div></div></main>;
}
