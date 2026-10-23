import { useEffect, useState, useCallback } from "react";
import { supabaseUrl, supabase } from "../../lib/supabase.js";

function Row({ label, status, detail }) {
  const color =
    status === "pending" ? "#68756e" : status === "ok" ? "#2f9b5f" : "#d64545";
  const badge =
    status === "pending" ? "…" : status === "ok" ? "OK" : "NG";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 12,
        padding: "10px 12px",
        borderRadius: 8,
        background: "#f4f7f5",
        border: "1px solid #e3eae6",
        marginBottom: 10,
      }}
    >
      <span
        style={{
          minWidth: 40,
          padding: "2px 8px",
          borderRadius: 999,
          background: "#fff",
          border: `1px solid ${color}`,
          color,
          fontSize: 12,
          fontWeight: 700,
          textAlign: "center",
        }}
      >
        {badge}
      </span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
        <div style={{ color: "#526059", fontSize: 13, whiteSpace: "pre-wrap" }}>
          {detail}
        </div>
      </div>
    </div>
  );
}

export default function HealthCheck() {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState({
    env: { status: "pending", detail: "" },
    authHealth: { status: "pending", detail: "" },
    loginProbe: { status: "pending", detail: "" },
    summary: { status: "pending", detail: "" },
  });

  const run = useCallback(async () => {
    setRunning(true);
    const next = {
      env: { status: "pending", detail: "" },
      authHealth: { status: "pending", detail: "" },
      loginProbe: { status: "pending", detail: "" },
      summary: { status: "pending", detail: "" },
    };

    // 1) 환경 변수 확인
    if (!supabaseUrl) {
      next.env = {
        status: "ng",
        detail:
          "VITE_SUPABASE_URL이 없습니다. .env.local을 확인하고 개발 서버를 재시작하세요.",
      };
      next.summary = {
        status: "ng",
        detail: "환경 변수가 없어 테스트를 진행할 수 없습니다.",
      };
      setResults(next);
      setRunning(false);
      return;
    } else {
      next.env = {
        status: "ok",
        detail: `VITE_SUPABASE_URL 감지됨: ${supabaseUrl}`,
      };
    }

    // 2) Auth 서비스 헬스체크
    try {
      const res = await fetch(`${supabaseUrl}/auth/v1/health`, {
        method: "GET",
      });
      const text = await res.text().catch(() => "");
      if (res.ok) {
        next.authHealth = {
          status: "ok",
          detail: `응답: ${text || "OK"} (HTTP ${res.status})`,
        };
      } else {
        next.authHealth = {
          status: "ng",
          detail: `HTTP ${res.status} ${res.statusText} - 응답: ${text}`,
        };
      }
    } catch (e) {
      next.authHealth = {
        status: "ng",
        detail: `요청 실패: ${e?.message || String(e)}`,
      };
    }

    // 3) 로그인 프로브(의도적 실패를 통해 경로/키/CORS 확인)
    //    - 무작위 이메일로 잘못된 비밀번호 로그인 시도
    //    - 네트워크/키/CORS 문제가 없다면 "잘못된 자격 증명" 등 정상 에러가 돌아와야 함
    if (!supabase) {
      next.loginProbe = {
        status: "ng",
        detail:
          "Supabase 클라이언트가 생성되지 않았습니다. 환경 변수를 확인하세요.",
      };
    } else {
      try {
        const email = `_diag_${Date.now()}_${Math.random()
          .toString(36)
          .slice(2, 8)}@example.com`;
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: "DefinitelyWrongPwd#1234",
        });

        if (error) {
          const msg = error.message || String(error);
          // 정상 경로의 "자격증명 불일치" 에러는 연결 OK로 판단
          const looksLikeInvalidCred =
            /invalid|자격|credential|grant|password|email/i.test(msg);
          next.loginProbe = {
            status: looksLikeInvalidCred ? "ok" : "ng",
            detail: `에러 수신: ${msg}`,
          };
        } else {
          // 이 경우는 극히 드묾(혹시 세션이 이미 있거나, 정책이 특이한 경우)
          next.loginProbe = {
            status: "ok",
            detail:
              "요청이 성공적으로 처리되었습니다. 연결 경로는 정상입니다.",
          };
        }
      } catch (e) {
        next.loginProbe = {
          status: "ng",
          detail: `요청 실패: ${e?.message || String(e)}`,
        };
      }
    }

    // 요약
    const okAll =
      next.env.status === "ok" &&
      next.authHealth.status === "ok" &&
      next.loginProbe.status === "ok";

    next.summary = {
      status: okAll ? "ok" : "ng",
      detail: okAll
        ? "모든 테스트를 통과했습니다. 연결이 정상입니다."
        : "일부 테스트가 실패했습니다. 위 항목의 상세를 확인하세요.",
    };

    setResults(next);
    setRunning(false);
  }, []);

  useEffect(() => {
    // 페이지 진입 시 자동 1회 실행
    run();
  }, [run]);

  return (
    <main
      className="page-container"
      style={{ maxWidth: 720, paddingTop: 28, paddingBottom: 40 }}
    >
      <h1 style={{ margin: "0 0 8px" }}>Supabase 연결 테스트</h1>
      <p style={{ color: "#526059", margin: "0 0 18px" }}>
        이 페이지는 환경변수, 서비스 헬스, 로그인 요청 경로를 점검해 연결 상태를
        진단합니다.
      </p>

      <div style={{ margin: "16px 0" }}>
        <Row
          label="환경 변수 확인"
          status={results.env.status}
          detail={results.env.detail}
        />
        <Row
          label="Auth 서비스 헬스체크"
          status={results.authHealth.status}
          detail={results.authHealth.detail}
        />
        <Row
          label="로그인 요청 프로브"
          status={results.loginProbe.status}
          detail={results.loginProbe.detail}
        />
        <Row
          label="요약"
          status={results.summary.status}
          detail={results.summary.detail}
        />
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          className="main-button"
          onClick={run}
          disabled={running}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            background: "#26332d",
            color: "#fff",
            fontWeight: 700,
          }}
        >
          {running ? "테스트 실행 중…" : "다시 테스트"}
        </button>

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
      </div>
    </main>
  );
}
