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

import { createClient } from "@supabase/supabase-js";

/**
 * Supabase 설정과 클라이언트의 단일 소스
 * - 중복 export를 방지하고, 클라이언트를 필요할 때만 생성합니다.
 */

// 환경변수(반드시 vite 환경변수 접두어 VITE_ 사용)
export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Lazy singleton 클라이언트
let _supabaseClient;

/**
 * getSupabaseClient
 * - 최초 한 번만 생성해 재사용합니다.
 */
export function getSupabaseClient() {
  if (_supabaseClient) return _supabaseClient;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("[Supabase] 환경변수 누락: VITE_SUPABASE_URL 또는 VITE_SUPABASE_ANON_KEY");
    return undefined;
  }

  _supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  return _supabaseClient;
}

/**
 * 과거 코드 호환용: supabase 네임드 export
 * - 모듈 로드시 즉시 생성(환경변수 없으면 undefined)
 */
export const supabase = getSupabaseClient();

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
