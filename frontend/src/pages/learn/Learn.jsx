import { levels, getLevelId } from "../../data/curriculum.js";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./Learn.css";

function Learn() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const selectedLevel = getLevelId(searchParams.get("level"));

    const level = levels[selectedLevel];

    return (
        <div className="learn-page">
            <div className="learn-container">

                <button
                    className="learn-back"
                    onClick={() => navigate("/level")}
                >
                    ← 단계 선택
                </button>

                <div className="learn-header">

                    <p className="learn-category">
                        {level.name} · {level.cefr}
                    </p>

                    <h1>
                        {level.name} 학습
                    </h1>

                    <p>
                        {level.description}
                    </p>

                </div>

                <div className="unit-list">

                    {level.units.map((unit) => (

                        <div
                            className="unit-card"
                            key={unit.id}
                        >

                            <div className="unit-top">

                <span className="unit-number">
                  UNIT {unit.id}
                </span>

                                <span className="unit-progress">
                  0%
                </span>

                            </div>

                            <h2>
                                {unit.title}
                            </h2>

                            <p className="unit-description">
                                {unit.description}
                            </p>

                            <p className="expression-count">
                                학습 표현 {unit.count}개
                            </p>

                            <div className="progress-background">

                                <div
                                    className="progress-fill"
                                    style={{ width: "0%" }}
                                />

                            </div>

                            <button
                                className="unit-button"
                                onClick={() =>
                                    navigate(
                                        `/lesson/${unit.id}?level=${selectedLevel}`
                                    )
                                }
                            >
                                학습 시작
                            </button>

                        </div>

                    ))}

                </div>

            </div>
        </div>
    );
}

export default Learn;