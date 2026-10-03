import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  return (
      <div className="home">

        {/* =========================
          Header
      ========================= */}
        <header className="home-header">

          <div
              className="home-logo"
              onClick={() => navigate("/")}
          >
            <img
                src="/sonmalitgi-icon.png"
                alt="손말잇기"
                className="home-logo-image"
            />

            <span>손말잇기</span>
          </div>

          <div className="home-header-buttons">

            <button
                className="home-login-button"
                onClick={() => navigate("/login")}
            >
              로그인
            </button>

            <button
                className="home-signup-button"
                onClick={() => navigate("/signup")}
            >
              회원가입
            </button>

          </div>
        </header>


        {/* =========================
          Main
      ========================= */}
        <main>

          {/* Hero */}
          <section className="home-hero">

            <div className="home-hero-hand">
              <img
                  src="/sonmalitgi-icon.png"
                  alt="손말잇기"
              />
            </div>

            <h1>
              손으로 배우고,
              <br />
              서로를 잇다.
            </h1>

            <p>
              AI와 함께 쉽고 재미있게 배우는
              <br />
              한국수어 학습 서비스
            </p>

            <button
                className="home-main-button"
                onClick={() => navigate("/login")}
            >
              학습하기
              <span>→</span>
            </button>

          </section>


          {/* =========================
            Service Introduction
        ========================= */}
          <section className="home-intro">

            <div className="home-section-title">

              <span>손말잇기는</span>

              <h2>
                이런 서비스예요
              </h2>

            </div>


            <div className="home-feature-grid">

              <div className="home-feature-card">

                <div className="home-feature-icon">
                  📚
                </div>

                <h3>
                  단계별 학습
                </h3>

                <p>
                  초보자부터 고급까지
                  <br />
                  내 수준에 맞게 차근차근 배워요.
                </p>

              </div>


              <div className="home-feature-card">

                <div className="home-feature-icon">
                  🎥
                </div>

                <h3>
                  직접 표현하기
                </h3>

                <p>
                  영상을 보는 것에서 끝나지 않고
                  <br />
                  직접 수어를 표현해봐요.
                </p>

              </div>


              <div className="home-feature-card">

                <div className="home-feature-icon">
                  🤖
                </div>

                <h3>
                  AI 학습 코치
                </h3>

                <p>
                  AI가 나의 수어 표현을 분석하고
                  <br />
                  다시 연습할 부분을 알려줘요.
                </p>

              </div>


              <div className="home-feature-card">

                <div className="home-feature-icon">
                  📖
                </div>

                <h3>
                  나만의 오답노트
                </h3>

                <p>
                  어려웠던 수어를 자동으로 모아
                  <br />
                  집중적으로 복습할 수 있어요.
                </p>

              </div>

            </div>

          </section>


          {/* =========================
            Learning Process
        ========================= */}
          <section className="home-process">

            <div className="home-process-title">

            <span>
              LEARNING PROCESS
            </span>

              <h2>
                손말잇기는 이렇게 배워요
              </h2>

            </div>


            <div className="home-process-list">

              <div className="home-process-item">

              <span className="process-number">
                01
              </span>

                <div className="process-icon">
                  📖
                </div>

                <strong>
                  배우기
                </strong>

                <p>
                  수어 영상으로
                  <br />
                  표현을 익혀요.
                </p>

              </div>


              <div className="home-process-item">

              <span className="process-number">
                02
              </span>

                <div className="process-icon">
                  ✋
                </div>

                <strong>
                  따라하기
                </strong>

                <p>
                  카메라를 보고
                  <br />
                  직접 표현해요.
                </p>

              </div>


              <div className="home-process-item">

              <span className="process-number">
                03
              </span>

                <div className="process-icon">
                  🤖
                </div>

                <strong>
                  AI 분석
                </strong>

                <p>
                  AI가 나의 표현을
                  <br />
                  분석해요.
                </p>

              </div>


              <div className="home-process-item">

              <span className="process-number">
                04
              </span>

                <div className="process-icon">
                  🔄
                </div>

                <strong>
                  복습하기
                </strong>

                <p>
                  부족한 표현은
                  <br />
                  다시 연습해요.
                </p>

              </div>

            </div>

          </section>


          {/* =========================
            CTA
        ========================= */}
          <section className="home-cta">

            <div className="home-cta-text">

            <span>
              오늘부터 시작해볼까요?
            </span>

              <h2>
                나만의 한국수어 학습을
                <br />
                시작해보세요.
              </h2>

            </div>


            <button
                className="home-main-button"
                onClick={() => navigate("/signup")}
            >
              시작하기
              <span>→</span>
            </button>

          </section>

        </main>


        {/* =========================
          Footer
      ========================= */}
        <footer className="home-footer">

          <div className="home-footer-logo">

            <img
                src="/sonmalitgi-icon.png"
                alt="손말잇기"
                className="home-footer-logo-image"
            />

            <span>
            손말잇기
          </span>

          </div>

          <p>
            손으로 배우고, 서로를 잇다.
          </p>

          <span>
          © 2026 손말잇기. All rights reserved.
        </span>

        </footer>

      </div>
  );
}

export default Home;