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
    const expressionCount = level.units.reduce((sum, unit) => sum + unit.count, 0);
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

                <div className="learn-intro"><div className="learn-header">

                    <p className="learn-category">
                        MY LEARNING · {level.name}
                    </p>

                    <h1>
                        {level.name} 학습
                    </h1>

                    <p>
                        {level.description}
                    </p>

                </div>

                <div className="learn-overview"><span className="learn-overview-icon" aria-hidden="true"><img src={`/icons/levels/${selectedLevel}.svg`} alt="" /></span><div><strong>{level.units.length}<small>개 유닛</small><span> / </span>{expressionCount}<small>개 표현</small></strong><p>영상으로 익히고, 직접 표현하며 배워요.</p></div></div></div>
                <div className="learn-list-heading"><h2>나의 학습 유닛</h2><span>시청 50% + 평가 50%</span></div>
                {error && <div role="alert"><p className="auth-error">{error}</p><button onClick={reload}>다시 불러오기</button></div>}
                <div className="unit-list">

                    {level.units.map((unit) => {
                        const record = byUnit[unit.id];
                        const percent = progressPercent(record);
                        const detail = progressDetails(record);
                        return (

                        <article
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
                                <span>학습 표현 {unit.count}개</span><span>시청 {detail.watchedCount}/{unit.count}</span><span>평가 {detail.passedCount}/{unit.count}</span>
                            </p>

                            <div className="progress-background" role="progressbar" aria-label={`${unit.title} 시청과 평가 통합 진행률`} aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>

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

                        </article>

                    ); })}

                </div>
                <p className="learn-footnote">한 번의 시청, 한 번의 표현. 작은 배움이 차곡차곡 쌓여요.</p>
            </div>
        </div>
    );
}

export default Learn;