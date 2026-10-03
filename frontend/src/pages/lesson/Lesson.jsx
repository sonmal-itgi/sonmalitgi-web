import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Lesson.css";

const lessonData = {
    1: {
        title: "숫자",
        description: "한국수어 숫자의 기본 표현을 학습합니다.",
        expressions: [
            {
                word: "1",
                description: "숫자 1을 나타내는 한국수어입니다.",
            },
            {
                word: "2",
                description: "숫자 2를 나타내는 한국수어입니다.",
            },
            {
                word: "3",
                description: "숫자 3을 나타내는 한국수어입니다.",
            },
            {
                word: "4",
                description: "숫자 4를 나타내는 한국수어입니다.",
            },
        ],
    },

    2: {
        title: "모음 · 자음",
        description: "한국수어의 기본 문자 표현을 학습합니다.",
        expressions: [
            {
                word: "ㄱ",
                description: "자음 ㄱ을 나타내는 한국수어입니다.",
            },
            {
                word: "ㄴ",
                description: "자음 ㄴ을 나타내는 한국수어입니다.",
            },
            {
                word: "ㅏ",
                description: "모음 ㅏ를 나타내는 한국수어입니다.",
            },
            {
                word: "ㅓ",
                description: "모음 ㅓ를 나타내는 한국수어입니다.",
            },
        ],
    },

    3: {
        title: "쉬운 단어",
        description: "일상에서 자주 사용하는 익숙한 단어를 학습합니다.",
        expressions: [
            {
                word: "안녕",
                description: "인사를 할 때 사용하는 한국수어입니다.",
            },
            {
                word: "엄마",
                description: "어머니를 나타내는 한국수어입니다.",
            },
            {
                word: "아빠",
                description: "아버지를 나타내는 한국수어입니다.",
            },
            {
                word: "친구",
                description: "친구를 나타내는 한국수어입니다.",
            },
        ],
    },
};

function Lesson() {
    const { id } = useParams();
    const navigate = useNavigate();

    const unitId = Number(id) || 1;

    const lesson = lessonData[unitId];

    const [currentIndex, setCurrentIndex] = useState(0);

    if (!lesson) {
        return (
            <div className="lesson-page">
                <div className="lesson-container">
                    <h1>존재하지 않는 Unit입니다.</h1>

                    <button
                        className="next-button"
                        onClick={() => navigate("/learn")}
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
            navigate("/learn");
        }
    };

    return (
        <div className="lesson-page">
            <div className="lesson-container">

                <button
                    className="lesson-back"
                    onClick={() => navigate("/learn")}
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