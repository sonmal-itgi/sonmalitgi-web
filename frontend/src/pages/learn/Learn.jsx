import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./Learn.css";

const levelData = {
    beginner: {
        name: "초급",
        cefr: "A1",
        description: "한국수어의 기본 표현부터 차근차근 학습합니다.",
        units: [
            {
                id: 1,
                title: "숫자",
                description: "한국수어 숫자의 기본 표현을 학습합니다.",
                count: 10,
            },
            {
                id: 2,
                title: "모음 · 자음",
                description: "한국수어의 기본 문자 표현을 학습합니다.",
                count: 14,
            },
            {
                id: 3,
                title: "쉬운 단어",
                description: "일상에서 자주 사용하는 익숙한 단어를 학습합니다.",
                count: 10,
            },
        ],
    },

    intermediate: {
        name: "중급",
        cefr: "A2~B1",
        description: "기본 표현을 바탕으로 일상적인 의사소통을 학습합니다.",
        units: [
            {
                id: 4,
                title: "자기소개 · 가족",
                description: "자신과 가족을 소개하는 표현을 학습합니다.",
                count: 12,
            },
            {
                id: 5,
                title: "일상 회화",
                description: "일상생활에서 사용하는 간단한 대화를 학습합니다.",
                count: 15,
            },
        ],
    },

    advanced: {
        name: "고급",
        cefr: "B2",
        description: "실제 상황에서 자연스럽게 의사소통하는 표현을 학습합니다.",
        units: [
            {
                id: 6,
                title: "상황별 의사소통",
                description: "병원, 학교, 음식점 등 다양한 상황의 표현을 학습합니다.",
                count: 20,
            },
            {
                id: 7,
                title: "길찾기 · 경로 · 주소",
                description: "위치를 묻고 길을 설명하는 표현을 학습합니다.",
                count: 20,
            },
        ],
    },
};

function Learn() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const selectedLevel = searchParams.get("level") || "beginner";

    const level = levelData[selectedLevel] || levelData.beginner;

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