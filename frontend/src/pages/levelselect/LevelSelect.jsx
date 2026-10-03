import { useNavigate } from "react-router-dom";
import "./LevelSelect.css";

function LevelSelect() {
  const navigate = useNavigate();

  const levels = [
    {
      id: "beginner",
      emoji: "🐣",
      title: "초보자",
      description: "한국수어를 처음 배우는 분",
      detail: "인사 · 숫자 · 가족 · 음식 · 감정",
    },
    {
      id: "intermediate",
      emoji: "🌱",
      title: "중급",
      description: "기본적인 수어 표현을 알고 있는 분",
      detail: "자기소개 · 일상 · 시간 · 질문과 대답",
    },
    {
      id: "advanced",
      emoji: "🔥",
      title: "고급",
      description: "자연스러운 수어 표현을 연습하는 분",
      detail: "상황별 대화 · 긴 문장 · 실전 회화",
    },
  ];

  return (
      <div className="level-page">

        <div className="level-container">

          <div className="auth-logo">
            🤟
          </div>

          <div className="level-header">

            <h1>
              어디서부터 시작할까요?
            </h1>

            <p>
              현재 나의 한국수어 수준에 맞는
              <br />
              학습 단계를 선택해주세요.
            </p>

          </div>

          <div className="level-list">

            {levels.map((level) => (

                <button
                    key={level.id}
                    className="level-select-card"
                    onClick={() =>
                        navigate(`/learn?level=${level.id}`)
                    }
                >

                  <div className="level-emoji">
                    {level.emoji}
                  </div>

                  <div className="level-info">

                    <h2>
                      {level.title}
                    </h2>

                    <p>
                      {level.description}
                    </p>

                    <small>
                      {level.detail}
                    </small>

                  </div>

                  <span className="level-arrow">
                →
              </span>

                </button>

            ))}

          </div>

        </div>

      </div>
  );
}

export default LevelSelect;