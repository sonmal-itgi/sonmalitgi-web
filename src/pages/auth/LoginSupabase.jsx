import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase.js";
import "./Auth.css";

function LoginSupabase() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMessage("");
        setLoading(true);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        setLoading(false);

        if (error) {
            setErrorMessage("이메일 또는 비밀번호를 확인해주세요.");
            return;
        }

        navigate("/level");
    };

    return (
        <main className="auth-page">
            <section className="auth-card">
                <button
                    type="button"
                    className="back-button"
                    onClick={() => navigate("/")}
                    aria-label="홈으로 이동"
                >
                    ←
                </button>

                <div className="auth-logo">🌱</div>

                <h1>로그인</h1>
                <p>계정에 로그인하고 학습을 이어가세요.</p>

                <form onSubmit={handleLogin}>
                    <label htmlFor="email">이메일</label>
                    <input
                        id="email"
                        type="email"
                        placeholder="이메일을 입력하세요"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <label htmlFor="password">비밀번호</label>
                    <input
                        id="password"
                        type="password"
                        placeholder="비밀번호를 입력하세요"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    {errorMessage && (
                        <p style={{ color: "#d64545", margin: "0 0 16px", fontWeight: 600 }}>
                            {errorMessage}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="main-button full"
                        disabled={loading}
                    >
                        {loading ? "로그인 중..." : "로그인"}
                    </button>
                </form>

                <div className="auth-divider">
                    <span>처음이신가요?</span>
                </div>

                <button
                    type="button"
                    className="outline-button full"
                    onClick={() => navigate("/signup")}
                >
                    회원가입
                </button>
            </section>
        </main>
    );
}

export default LoginSupabase;
