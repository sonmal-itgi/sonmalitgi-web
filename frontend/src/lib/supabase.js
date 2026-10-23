import { createClient } from '@supabase/supabase-js';
import { createAuthService } from './auth.js';

const url = import.meta.env.VITE_SUPABASE_URL || '';
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '';
export const isSupabaseConfigured = /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(url)
  && (key.startsWith('sb_publishable_') || key.startsWith('eyJ'));
export const supabase = isSupabaseConfigured ? createClient(url, key) : null;
export const authService = createAuthService(supabase);
