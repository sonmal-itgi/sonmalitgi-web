import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/context.js';
import { MemberControls } from '../../components/Header.jsx';
import { levels } from '../../data/curriculum.js';
import './Home.css';

function Arrow({ diagonal = false }) {
  return <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    {diagonal ? <path d="M6 18 18 6M6 6h12v12" /> : <path d="M4 12h15m-6-6 6 6-6 6" />}
  </svg>;
}

function LearningStepIcon({ kind }) {
  return <svg aria-hidden="true" focusable="false" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    {kind === 'video' && <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m10 9 5 3-5 3Z" /></>}
    {kind === 'hand' && <><path d="M8 12V5a1.5 1.5 0 0 1 3 0v6M11 11V3.5a1.5 1.5 0 0 1 3 0V11M14 11V5a1.5 1.5 0 0 1 3 0v7" /><path d="M17 12V8a1.5 1.5 0 0 1 3 0v7a7 7 0 0 1-7 7h-1a6 6 0 0 1-4.8-2.4L3 14a1.5 1.5 0 0 1 2.2-2L8 15v-3" /></>}
    {kind === 'record' && <><rect x="5" y="4" width="14" height="17" rx="2" /><rect x="9" y="2" width="6" height="4" rx="1" /><path d="m9 12 2 2 4-4M9 17h6" /></>}
  </svg>;
}

const steps = [
  { number: '01', icon: 'video', title: '먼저, 눈으로 익혀요.', text: '유닛의 표현을 하나씩 살펴보며 한국수어와 친해져요.', tag: '영상 학습' },
  { number: '02', icon: 'hand', title: '이번엔, 직접 표현해요.', text: '배운 표현을 카메라 앞에서 연습하고, 표현별 평가를 진행해요.', tag: '표현 연습' },
  { number: '03', icon: 'record', title: '차곡차곡, 배움을 쌓아요.', text: '시청과 평가 기록을 함께 확인하고, 필요한 표현은 다시 돌아봐요.', tag: '학습 기록' },
];

export default function Home() {
  const { session, profile } = useAuth();
  const startPath = session ? '/level' : '/login';
  const unitCount = Object.values(levels).reduce((sum, level) => sum + level.units.length, 0);

  return <div className="home">
    <a className="home-skip" href="#home-content">본문으로 바로가기</a>
    <header className="home-header">
      <div className="home-header-inner">
        <Link className="home-logo" to="/" aria-label="손말잇기 홈"><img src="/sonmalitgi-icon.png" width="38" height="38" alt="" /><span>손말잇기</span></Link>
        <nav className="home-nav" aria-label="메인 메뉴"><a href="#learning-path">학습 단계</a><a href="#how-to-learn">학습 방법</a></nav>
        <div className="home-header-actions">
          {profile ? <MemberControls /> : session ? <Link className="home-header-start" to="/level">내 학습 <Arrow /></Link> : <>
            <Link className="home-login" to="/login">로그인</Link><Link className="home-header-start" to="/signup">함께 시작하기 <Arrow /></Link>
          </>}
        </div>
      </div>
    </header>

    <main id="home-content">
      <section className="home-hero home-container" aria-labelledby="home-title">
        <div className="home-hero-copy">
          <p className="home-eyebrow"><span className="home-dot" /> 마음을 잇는 한국수어 학습</p>
          <h1 id="home-title">손으로 배우고,<br /><span>서로를 잇다.</span></h1>
          <p className="home-hero-description">익숙하지 않은 표현이<br />누군가와 나누는 대화가 될 때까지.<br /><strong>손말잇기와 한 표현씩, 나의 속도로 배워요.</strong></p>
          <div className="home-hero-actions"><Link className="home-primary" to={startPath}>학습 시작하기 <Arrow /></Link><a className="home-text-link" href="#how-to-learn">어떻게 배우나요? <span aria-hidden="true">↘</span></a></div>
          <div className="home-hero-note"><span aria-hidden="true">✳</span> 오늘의 작은 배움이, 더 넓은 대화로.</div>
        </div>
        <div className="home-hero-art" aria-label="두 손이 이어지는 손말잇기 브랜드 일러스트">
          <div className="home-art-top"><span>SONMALITGI</span><span>함께 배우는 언어</span></div>
          <div className="home-art-orbit home-art-orbit-one" /><div className="home-art-orbit home-art-orbit-two" />
          <span className="home-art-word home-art-word-one">배우다</span><span className="home-art-word home-art-word-two">표현하다</span>
          <div className="home-art-hands"><img src="/sonmalitgi-icon.png" width="1280" height="1280" alt="" fetchPriority="high" /></div>
          <div className="home-art-caption"><span className="home-art-spark" aria-hidden="true">✳</span><p>말은 달라도,<br /><strong>마음은 닿을 수 있으니까.</strong></p></div>
          <div className="home-art-bottom"><span>너와 나 사이, 손말잇기</span><span aria-hidden="true">↗</span></div>
        </div>
      </section>

      <div className="home-principles home-container" aria-label="손말잇기의 학습 방향">
        <div><span>01 / YOUR PACE</span><p>서두르지 않아도 괜찮아요.<br /><strong>내 속도에 맞는 배움.</strong></p></div>
        <div><span>02 / YOUR EXPRESSION</span><p>눈으로 보고, 손으로 익히는<br /><strong>직접 표현하는 즐거움.</strong></p></div>
        <div><span>03 / YOUR JOURNEY</span><p>시청부터 평가까지 차곡차곡<br /><strong>눈에 보이는 나의 변화.</strong></p></div>
      </div>

      <section id="learning-path" className="home-curriculum home-container" aria-labelledby="curriculum-title">
        <div className="home-section-heading"><div><p className="home-eyebrow">LEARNING PATH</p><h2 id="curriculum-title">작은 표현에서,<br />더 넓은 대화로.</h2></div><p>처음 만나는 숫자부터 일상의 문장까지.<br />세 가지 단계, {unitCount}개의 유닛으로 배움을 이어가요.</p></div>
        <div className="home-level-grid">{Object.entries(levels).map(([id, level], index) => {
          const destination = `/learn?level=${id}`;
          return <Link key={id} className={`home-level home-level-${id}`} to={session ? destination : '/login'} state={session ? undefined : { from: destination }}>
            <div className="home-level-top"><span>LEVEL 0{index + 1}</span><img src={`/icons/levels/${id}.svg`} width="46" height="46" alt="" loading="lazy" /></div>
            <h3>{level.name}<span>{index === 0 ? '첫걸음을 가볍게' : index === 1 ? '일상을 더 가깝게' : '문장을 더 자연스럽게'}</span></h3>
            <p>{level.description}</p>
            <div className="home-level-bottom"><span>{level.units.length}개 유닛 · {level.units.reduce((sum, unit) => sum + unit.count, 0)}개 표현</span><span className="home-level-arrow"><Arrow diagonal /></span></div>
          </Link>;
        })}</div>
        <p className="home-content-note">학습 영상과 AI 평가 콘텐츠는 순차적으로 준비하고 있어요.</p>
      </section>

      <section id="how-to-learn" className="home-process" aria-labelledby="process-title"><div className="home-container home-process-inner">
        <div className="home-process-intro"><p className="home-eyebrow">A LITTLE, EVERY DAY</p><h2 id="process-title">보고, 표현하고,<br /><span>조금 더 가까워져요.</span></h2><p>영상을 모두 살펴본 뒤 직접 표현해보세요.<br />한 번 더 연습하는 만큼, 배움도 쌓이니까요.</p><Link className="home-process-link" to={startPath}>나의 배움 시작하기 <Arrow /></Link></div>
        <ol className="home-step-list">{steps.map((step) => <li key={step.number}><div className="home-step-marker"><span className="home-step-number">{step.number}</span><span className="home-step-icon"><LearningStepIcon kind={step.icon} /></span></div><div><span className="home-step-tag">{step.tag}</span><h3>{step.title}</h3><p>{step.text}</p></div></li>)}</ol>
      </div></section>

      <section className="home-closing home-container" aria-labelledby="closing-title"><div><p className="home-eyebrow">LET’S CONNECT</p><h2 id="closing-title">우리의 다음 대화는,<br /><span>손끝에서 시작될지도.</span></h2></div><div className="home-closing-action"><Link className="home-primary" to={session ? '/level' : '/signup'}>손말잇기와 시작하기 <Arrow /></Link><p>서로를 이해하는 새로운 방법을 만나보세요.</p></div></section>
    </main>

    <footer className="home-footer home-container"><div><Link className="home-logo" to="/" aria-label="손말잇기 홈"><img src="/sonmalitgi-icon.png" width="30" height="30" alt="" loading="lazy" /><span>손말잇기</span></Link><p>손으로 배우고, 서로를 잇다.</p></div><span>© {new Date().getFullYear()} SONMALITGI</span><a href="#home-content">처음으로 돌아가기 ↑</a></footer>
  </div>;
}
