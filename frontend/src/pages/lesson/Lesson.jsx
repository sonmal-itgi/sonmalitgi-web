import { useState } from "react";
import { lessons, getLevelId } from "../../data/curriculum.js";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import "./Lesson.css";

function Lesson() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [searchParams] = useSearchParams();
    const unitId = Number(id);
    const lesson = lessons[unitId];
    const levelId = lesson?.levelId || getLevelId(searchParams.get("level"));
    const listPath = `/learn?level=${levelId}`;

    const [currentIndex, setCurrentIndex] = useState(0);

    if (!lesson) {
        return (
            <div className="lesson-page">
                <div className="lesson-container">
                    <h1>존재하지 않는 Unit입니다.</h1>

                    <button
                        className="next-button"
                        onClick={() => navigate(listPath)}
                    >
                        Unit 목록으로
                    </button>
                </div>
            </div>
        );
    }

    const current = lesson.expressions[currentIndex];

    const isLast =
        currentIndex === lesson.expressions.length - 1;

    const nextExpression = () => {
        if (!isLast) {
            setCurrentIndex(currentIndex + 1);
        } else {
            navigate(listPath);
        }
    };

    return (
        <div className="lesson-page">
            <div className="lesson-container">

                <button
                    className="lesson-back"
                    onClick={() => navigate(listPath)}
                >
                    ← Unit 목록
                </button>

                <div className="lesson-header">

                    <span>UNIT {unitId}</span>

                    <h1>{lesson.title}</h1>

                    <p>{lesson.description}</p>

                </div>

                <div className="lesson-progress">

                    <div className="lesson-progress-text">
                        표현 {currentIndex + 1} / {lesson.expressions.length}
                    </div>

                    <div className="progress-background">
                        <div
                            className="progress-fill"
                            style={{
                                width: `${
                                    ((currentIndex + 1) /
                                        lesson.expressions.length) *
                                    100
                                }%`,
                            }}
                        />
                    </div>

                </div>

                <div className="expression-card">

                    <div className="sign-video">

                        <div className="video-placeholder">

                            <div className="video-icon">
                                ▶
                            </div>

                            <p>수어 영상 영역</p>

                            <span>
                추후 실제 수어 영상을 연결합니다.
              </span>

                        </div>

                    </div>

                    <div className="expression-info">

                        <p className="expression-label">
                            학습 표현
                        </p>

                        <h2>{current.word}</h2>

                        <p className="expression-description">
                            {current.description}
                        </p>

                    </div>

                </div>

                <button
                    className="next-button"
                    onClick={nextExpression}
                >
                    {isLast ? "학습 완료" : "다음 표현"}
                </button>

            </div>
        </div>
    );
}

export default Lesson;