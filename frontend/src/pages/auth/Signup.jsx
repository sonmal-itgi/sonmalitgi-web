import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";
function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      alert("모든 항목을 입력해주세요.");
      return;
    }

    // 나중에 Java Spring Boot 회원가입 API 연결
    navigate("/level");
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

        <h1>손말잇기에 오신 걸<br />환영해요!</h1>

        <p>간단한 정보를 입력하고<br />학습을 시작해보세요.</p>

        <form onSubmit={handleSignup}>
          <label>이름</label>
          <input
            type="text"
            placeholder="이름을 입력해주세요"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

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
            회원가입
          </button>
        </form>

        <button
          className="text-button"
          onClick={() => navigate("/login")}
        >
          이미 계정이 있으신가요? 로그인
        </button>
      </div>
    </div>
  );
}

export default Signup;
