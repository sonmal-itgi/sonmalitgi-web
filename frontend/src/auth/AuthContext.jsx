import { useEffect, useState } from 'react';
import { authService, isSupabaseConfigured, supabase } from '../lib/supabase.js';

import { AuthContext } from './context.js';

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [initializing, setInitializing] = useState(isSupabaseConfigured);
  const [profileState, setProfileState] = useState({ userId: null, profile: null, error: '' });
  useEffect(() => {
    if (!supabase) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (!nextSession) setProfileState({ userId: null, profile: null, error: '' });
      setInitializing(false);
    });
    return () => subscription.unsubscribe();
  }, []);
  const userId = session?.user.id;
  useEffect(() => {
    if (!userId) return;
    let active = true;
    authService.getProfile(userId).then(
      (profile) => { if (active) setProfileState({ userId, profile, error: '' }); },
      (error) => { if (active) setProfileState({ userId, profile: null, error: error.message }); },
    );
    return () => { active = false; };
  }, [userId]);
  const profileReady = profileState.userId === userId;
  return <AuthContext.Provider value={{
    session, profile: userId && profileReady ? profileState.profile : null,
    error: userId && profileReady ? profileState.error : '',
    loading: initializing || Boolean(userId && !profileReady),
    configured: isSupabaseConfigured, logout: authService.logout,
  }}>{children}</AuthContext.Provider>;
}
