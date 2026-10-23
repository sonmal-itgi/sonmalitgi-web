import { createClient } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export let supabase = undefined;

try {
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } else {
    console.warn(
      "[Supabase] 환경변수가 설정되지 않았습니다. .env.local에 VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY를 추가하세요."
    );
  }
} catch (e) {
  console.error("[Supabase] 클라이언트 생성 실패:", e);
}
export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export let supabase = undefined;

try {
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } else {
    // 환경변수가 없으면 앱이 죽지 않도록 경고만 표시
    console.warn(
      "[Supabase] 환경변수가 설정되지 않았습니다. VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY를 .env.local에 추가하세요."
    );
  }
} catch (e) {
  console.error("[Supabase] 클라이언트 생성 실패:", e);
}

/**
 * Supabase 헬스체크
 * - auth 서비스의 /health 엔드포인트를 호출해 OK 여부를 반환합니다.
 */
export async function getSupabaseHealth() {
  try {
    if (!supabaseUrl) {
      return { ok: false, error: "VITE_SUPABASE_URL이 설정되지 않았습니다." };
    }

    const res = await fetch(`${supabaseUrl}/auth/v1/health`, { method: "GET" });
    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status} ${res.statusText}` };
    }

    const text = await res.text().catch(() => "OK");
    return { ok: true, detail: text };
  } catch (e) {
    return { ok: false, error: e?.message || String(e) };
  }
}
