import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/context.js';

export function MemberControls() {
  const { profile, logout } = useAuth();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  if (!profile) return null;
  return <div className="member-controls">
    <span>{profile.name}님</span>
    <Link to="/mypage" className="member-mypage-link">마이페이지</Link>
    <button type="button" className="home-login-button" disabled={pending} onClick={async () => {
      setPending(true); setError('');
      try { await logout(); } catch (e) { setError(e.message); }
      finally { setPending(false); }
    }}>{pending ? '로그아웃 중…' : '로그아웃'}</button>
    {error && <span className="auth-error" role="alert">{error}</span>}
  </div>;
}

export default function Header() {
  return <>
    <header className="member-header"><Link to="/" className="member-logo"><img src="/sonmalitgi-icon.png" alt="" /> 손말잇기</Link><MemberControls /></header>
    <Outlet />
  </>;
}
