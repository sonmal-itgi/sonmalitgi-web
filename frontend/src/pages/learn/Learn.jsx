import { levels, getLevelId } from "../../data/curriculum.js";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./Learn.css";
import { useLearningProgress } from "../../hooks/useLearningProgress.js";
import { progressPercent, progressDetails } from "../../lib/progress.js";

function Learn() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const selectedLevel = getLevelId(searchParams.get("level"));

    const level = levels[selectedLevel];
    const { records, loading, error, reload } = useLearningProgress();
    const byUnit = Object.fromEntries(records.map((record) => [record.unit_id, record]));

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

                {error && <div role="alert"><p className="auth-error">{error}</p><button onClick={reload}>다시 불러오기</button></div>}
                <div className="unit-list">

                    {level.units.map((unit) => {
                        const record = byUnit[unit.id];
                        const percent = progressPercent(record);
                        const detail = progressDetails(record);
                        return (

                        <div
                            className="unit-card"
                            key={unit.id}
                        >

                            <div className="unit-top">

                <span className="unit-number">
                  UNIT {unit.id}
                </span>

                                <span className="unit-progress">
                  {loading ? "…" : error ? "—" : `${percent}%`}
                </span>

                            </div>

                            <h2>
                                {unit.title}
                            </h2>

                            <p className="unit-description">
                                {unit.description}
                            </p>

                            <p className="expression-count">
                                학습 표현 {unit.count}개 · 시청 {detail.watchedCount}/{unit.count} · 평가 {detail.passedCount}/{unit.count}
                            </p>

                            <div className="progress-background">

                                <div
                                    className="progress-fill"
                                    style={{ width: `${percent}%` }}
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
                                {record?.completed_at ? "다시 학습" : record ? "이어서 학습" : "학습 시작"}
                            </button>

                        </div>

                    ); })}

                </div>

            </div>
        </div>
    );
}

export default Learn;