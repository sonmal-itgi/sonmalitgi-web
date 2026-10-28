import { Link, useNavigate } from "react-router-dom";
import { levels } from "../../data/curriculum.js";
import "./LevelSelect.css";

const introductions = [
  { id: 'beginner', subtitle: '첫걸음을 가볍게', description: '한국수어를 처음 만난다면, 작은 숫자 표현부터 시작해요.' },
  { id: 'intermediate', subtitle: '일상을 더 가깝게', description: '익숙한 인사부터 방향과 이동까지, 표현의 폭을 넓혀요.' },
  { id: 'advanced', subtitle: '대화를 더 자연스럽게', description: '하나의 표현을 넘어, 일상에서 나누는 문장을 익혀요.' },
];

export default function LevelSelect() {
  const navigate = useNavigate();
  return <main className="level-page"><div className="level-container">
    <Link to="/" className="level-home-link">← 홈으로</Link>
    <div className="level-header">
      <p className="page-eyebrow">FIND YOUR START</p>
      <h1>나의 속도로,<br /><span>첫 표현을 시작해요.</span></h1>
      <p>지금 나에게 맞는 단계를 골라보세요.<br />언제든 다른 단계로 돌아올 수 있어요.</p>
    </div>
    <div className="level-list">
      {introductions.map((intro, index) => {
        const level = levels[intro.id];
        return <button key={intro.id} className={`level-select-card level-select-${intro.id}`} onClick={() => navigate(`/learn?level=${intro.id}`)}>
          <div className="level-card-top"><span>LEVEL 0{index + 1}</span><img src={`/icons/levels/${intro.id}.svg`} alt="" /></div>
          <div className="level-info"><h2>{level.name}</h2><strong>{intro.subtitle}</strong><p>{intro.description}</p></div>
          <div className="level-topics">{level.units.map(unit => <span key={unit.id}>{unit.title}</span>)}</div>
          <div className="level-card-bottom"><span>{level.units.length}개 유닛 · {level.units.reduce((sum, unit) => sum + unit.count, 0)}개 표현</span><span className="level-arrow" aria-hidden="true">↗</span></div>
        </button>;
      })}
    </div>
    <p className="level-footnote"><span aria-hidden="true">✳</span> 잘하는 것보다, 한 번 더 표현해보는 마음으로.</p>
  </div></main>;
}
