import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase.js";
import "./Auth.css";

function SignupSupabase() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const handleSignup = async (e) => {
        e.preventDefault();

        setErrorMessage("");
        setSuccessMessage("");

        if (password.length < 6) {
            setErrorMessage("비밀번호는 6자 이상이어야 합니다.");
            return;
        }

        if (password !== passwordConfirm) {
            setErrorMessage("비밀번호가 일치하지 않습니다.");
            return;
        }

        setLoading(true);

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/login`,
            },
        });

        setLoading(false);

        if (error) {
            setErrorMessage("회원가입에 실패했습니다. 입력 정보를 확인해주세요.");
            return;
        }

        if (data.session) {
            // 이메일 인증을 사용하지 않을 때는 session이 즉시 생성됩니다.
            navigate("/level");
            return;
        }

        setSuccessMessage("회원가입이 완료되었습니다. 이메일 인증 후 로그인해주세요.");
    };

    return (
        <main className="auth-page">
            <section className="auth-card">
                <button
                    type="button"
                    className="back-button"
                    onClick={() => navigate("/login")}
                    aria-label="로그인으로 이동"
                >
                    ←
                </button>

                <div className="auth-logo">🌱</div>

                <h1>회원가입</h1>
                <p>새 계정을 만들고 학습을 시작하세요.</p>

                <form onSubmit={handleSignup}>
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
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        minLength={6}
                        required
                    />

                    <label htmlFor="passwordConfirm">비밀번호 확인</label>
                    <input
                        id="passwordConfirm"
                        type="password"
                        placeholder="비밀번호를 한 번 더 입력하세요"
                        autoComplete="new-password"
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                        minLength={6}
                        required
                    />

                    {errorMessage && (
                        <p style={{ color: "#d64545", margin: "0 0 16px", fontWeight: 600 }}>
                            {errorMessage}
                        </p>
                    )}

                    {successMessage && (
                        <p style={{ color: "#2f9b5f", margin: "0 0 16px", fontWeight: 600 }}>
                            {successMessage}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="main-button full"
                        disabled={loading}
                    >
                        {loading ? "가입 중..." : "회원가입"}
                    </button>
                </form>

                <button
                    type="button"
                    className="text-button"
                    onClick={() => navigate("/login")}
                >
                    이미 계정이 있으신가요? 로그인
                </button>
            </section>
        </main>
    );
}

export default SignupSupabase;
