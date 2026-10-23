import { useCallback, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase.js";

export default function AuthTest() {
  const available = !!supabase;

  const [email, setEmail] = useState(
    `test_${Math.random().toString(36).slice(2, 6)}@example.com`
  );
  const [password, setPassword] = useState("TestPwd#12345");
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState([]);

  const appendLog = useCallback((entry) => {
    setLog((prev) => [
      {
        ts: new Date().toLocaleTimeString(),
        ...entry,
      },
      ...prev,
    ]);
  }, []);

  const guard = useCallback(() => {
    if (!available) {
      appendLog({
        level: "error",
        msg: "Supabase 클라이언트가 생성되지 않았습니다. .env.local 설정 및 서버 재시작을 확인하세요.",
      });
      return false;
    }
    return true;
  }, [available, appendLog]);

  const whoAmI = useCallback(async () => {
    if (!guard()) return;
    setBusy(true);
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      if (data?.user) {
        appendLog({
          level: "info",
          msg: `로그인 상태: ${data.user.email} (id: ${data.user.id})`,
        });
      } else {
        appendLog({ level: "warn", msg: "로그인되어 있지 않습니다." });
      }
    } catch (e) {
      appendLog({ level: "error", msg: `내 정보 조회 실패: ${e.message || e}` });
    } finally {
      setBusy(false);
    }
  }, [guard, appendLog]);

  const signUp = useCallback(async () => {
    if (!guard()) return;
    setBusy(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;

      appendLog({
        level: "success",
        msg:
          `회원가입 요청 성공: ${data?.user?.email || email}\n` +
          `주의: 프로젝트 설정에 따라 이메일 확인(Confirm)이 필요할 수 있습니다.`,
      });
    } catch (e) {
      appendLog({ level: "error", msg: `회원가입 실패: ${e.message || e}` });
    } finally {
      setBusy(false);
    }
  }, [guard, email, password, appendLog]);

  const signIn = useCallback(async () => {
    if (!guard()) return;
    setBusy(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      appendLog({
        level: "success",
        msg: `로그인 성공: ${data?.user?.email || email}`,
      });
    } catch (e) {
      appendLog({
        level: "error",
        msg:
          `로그인 실패: ${e.message || e}\n` +
          `이메일 확인이 필요한 설정이면, 가입 메일의 Confirm을 먼저 완료해야 로그인됩니다.`,
      });
    } finally {
      setBusy(false);
    }
  }, [guard, email, password, appendLog]);

  const signOut = useCallback(async () => {
    if (!guard()) return;
    setBusy(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      appendLog({ level: "success", msg: "로그아웃 성공" });
    } catch (e) {
      appendLog({ level: "error", msg: `로그아웃 실패: ${e.message || e}` });
    } finally {
      setBusy(false);
    }
  }, [guard, appendLog]);

  // DB 저장/조회 테스트 (profiles 테이블 가정: id(uuid, PK), username(text), updated_at(timestamptz))
  const upsertProfile = useCallback(async () => {
    if (!guard()) return;
    setBusy(true);
    try {
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      const user = userRes?.user;
      if (!user) {
        appendLog({ level: "warn", msg: "로그인 후 실행하세요." });
        return;
      }

      const payload = {
        id: user.id,
        username:
          "user_" + (user.email?.split("@")[0] || user.id.slice(0, 6)),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("profiles").upsert(payload, {
        onConflict: "id",
      });
      if (error) throw error;

      appendLog({
        level: "success",
        msg: `DB 저장 성공 (profiles): ${JSON.stringify(payload)}`,
      });
    } catch (e) {
      appendLog({
        level: "error",
        msg:
          `DB 저장 실패: ${e.message || e}\n` +
          `- 테이블(profiles) 존재 여부와 RLS 정책(Authenticated INSERT/UPDATE 허용)을 확인하세요.`,
      });
    } finally {
      setBusy(false);
    }
  }, [guard, appendLog]);

  const readProfile = useCallback(async () => {
    if (!guard()) return;
    setBusy(true);
    try {
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      const user = userRes?.user;
      if (!user) {
        appendLog({ level: "warn", msg: "로그인 후 실행하세요." });
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        appendLog({
          level: "success",
          msg: `DB 조회 성공 (profiles): ${JSON.stringify(data[0])}`,
        });
      } else {
        appendLog({
          level: "warn",
          msg: "DB 조회 결과가 없습니다. 먼저 저장을 시도해 보세요.",
        });
      }
    } catch (e) {
      appendLog({
        level: "error",
        msg:
          `DB 조회 실패: ${e.message || e}\n` +
          `- 테이블(profiles) 존재 여부와 RLS 정책(Authenticated SELECT 허용)을 확인하세요.`,
      });
    } finally {
      setBusy(false);
    }
  }, [guard, appendLog]);

  const banner = useMemo(() => {
    if (!available) {
      return "환경변수 미설정 또는 클라이언트 생성 실패로 테스트를 실행할 수 없습니다.";
    }
    return "이메일 확인(Confirm) 설정에 따라 회원가입 직후에는 메일 인증이 필요할 수 있습니다.";
  }, [available]);

  const levelColor = (level) =>
    level === "success"
      ? "#2f9b5f"
      : level === "info"
      ? "#3178c6"
      : level === "warn"
      ? "#b8860b"
      : "#d64545";

  return (
    <main className="page-container" style={{ maxWidth: 720, paddingTop: 28 }}>
      <h1 style={{ margin: "0 0 8px" }}>Auth / DB 테스트</h1>
      <p style={{ color: "#526059", margin: "0 0 18px" }}>{banner}</p>

      <section
        style={{
          padding: 16,
          border: "1px solid #e3eae6",
          borderRadius: 10,
          background: "#f7faf8",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 10,
            marginBottom: 10,
          }}
        >
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid #cbd5cf",
              outline: "none",
            }}
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid #cbd5cf",
              outline: "none",
            }}
          />
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <button
            onClick={signUp}
            disabled={busy || !available}
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              background: "#26332d",
              color: "#fff",
              fontWeight: 700,
            }}
          >
            회원가입
          </button>
          <button
            onClick={signIn}
            disabled={busy || !available}
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              background: "#3f5d52",
              color: "#fff",
              fontWeight: 700,
            }}
          >
            로그인
          </button>
          <button
            onClick={whoAmI}
            disabled={busy || !available}
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              background: "#f4f7f5",
              border: "1px solid #e3eae6",
              fontWeight: 700,
            }}
          >
            내 정보
          </button>
          <button
            onClick={signOut}
            disabled={busy || !available}
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              background: "#f4f7f5",
              border: "1px solid #e3eae6",
              fontWeight: 700,
            }}
          >
            로그아웃
          </button>
        </div>
      </section>

      <section
        style={{
          padding: 16,
          border: "1px solid #e3eae6",
          borderRadius: 10,
          background: "#f7faf8",
          marginBottom: 16,
        }}
      >
        <h3 style={{ marginTop: 0 }}>DB 테스트 (profiles)</h3>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={upsertProfile}
            disabled={busy || !available}
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              background: "#26332d",
              color: "#fff",
              fontWeight: 700,
            }}
          >
            DB 저장(upsert)
          </button>
          <button
            onClick={readProfile}
            disabled={busy || !available}
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              background: "#f4f7f5",
              border: "1px solid #e3eae6",
              fontWeight: 700,
            }}
          >
            DB 조회(select)
          </button>
        </div>
        <p style={{ color: "#526059" }}>
          참고: public.profiles 테이블이 존재하고, RLS 정책으로 인증 사용자에게
          INSERT/UPDATE/SELECT가 허용되어야 합니다.
        </p>
      </section>

      <section
        style={{
          padding: 16,
          border: "1px solid #e3eae6",
          borderRadius: 10,
          background: "#fff",
          marginBottom: 40,
        }}
      >
        <h3 style={{ marginTop: 0 }}>로그</h3>
        <div style={{ display: "grid", gap: 8 }}>
          {log.length === 0 ? (
            <div style={{ color: "#68756e" }}>아직 로그가 없습니다.</div>
          ) : (
            log.map((l, i) => (
              <div
                key={i}
                style={{
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: "1px solid #e3eae6",
                  background: "#f7faf8",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "baseline",
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: 12,
                      color: "#68756e",
                      minWidth: 60,
                    }}
                  >
                    {l.ts}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: levelColor(l.level),
                    }}
                  >
                    {l.level.toUpperCase()}
                  </span>
                </div>
                <div
                  style={{
                    whiteSpace: "pre-wrap",
                    color: "#26332d",
                    wordBreak: "break-word",
                  }}
                >
                  {l.msg}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <a
        href="/"
        style={{
          padding: "10px 14px",
          borderRadius: 8,
          background: "#f4f7f5",
          border: "1px solid #e3eae6",
          fontWeight: 700,
        }}
      >
        홈으로
      </a>
    </main>
  );
}
