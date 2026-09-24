import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    // 나중에 Java Spring Boot 로그인 API 연결
    navigate("/learn");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <button
          className="back-button"
          onClick={() => navigate("/")}
        >
          ←
        </button>

        <div className="auth-logo">🤟</div>

        <h1>다시 만나요!</h1>

        <p>손말잇기에 로그인하고<br />학습을 계속해보세요.</p>

        <form onSubmit={handleLogin}>
          <label>이메일</label>
          <input
            type="email"
            placeholder="이메일을 입력해주세요"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>비밀번호</label>
          <input
            type="password"
            placeholder="비밀번호를 입력해주세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="main-button full">
            로그인
          </button>
        </form>

        <div className="auth-divider">
          <span>처음이신가요?</span>
        </div>

        <button
          className="outline-button full"
          onClick={() => navigate("/signup")}
        >
          회원가입하기
        </button>
      </div>
    </div>
  );
}

export default Login;
