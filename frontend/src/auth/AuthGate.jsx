import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from './context.js';

export function AuthStatus() {
  const { loading, error, logout } = useAuth();
  const [logoutError, setLogoutError] = useState('');
  if (loading) return <main className="auth-status" role="status">회원 정보를 확인하고 있어요…</main>;
  if (!error) return null;
  return <main className="auth-status">
    <p role="alert">{logoutError || error}</p>
    <button type="button" className="outline-button" onClick={async () => {
      try { await logout(); } catch (e) { setLogoutError(e.message); }
    }}>로그아웃하고 다시 시도</button>
  </main>;
}

export function RequireAuth() {
  const { session, loading, error } = useAuth();
  const location = useLocation();
  if (loading || error) return <AuthStatus />;
  if (!session) return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  return <Outlet />;
}

export function GuestOnly() {
  const { session, loading, error } = useAuth();
  const location = useLocation();
  if (loading || error) return <AuthStatus />;
  const from = location.state?.from;
  const destination = typeof from === 'string' && /^\/(level|learn|lesson|mypage|review)(\/|\?|$)/.test(from) ? from : '/level';
  return session ? <Navigate to={destination} replace /> : <Outlet />;
}
