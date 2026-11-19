import './Dictionary.css';

export default function Dictionary() {
  return <main className="dictionary-page" aria-labelledby="dictionary-title">
    <header className="dictionary-heading">
      <p className="dictionary-eyebrow">손으로 찾는 단어</p>
      <h1 id="dictionary-title">수어 사전</h1>
      <p>수어로 표현하면, 어떤 단어인지 바로 알아보세요.</p>
    </header>
    <section className="dictionary-preview" aria-labelledby="dictionary-status">
      <div className="dictionary-camera-preview" aria-hidden="true">
        <svg viewBox="0 0 48 48" fill="none"><rect x="6" y="12" width="27" height="24" rx="5" /><path d="m33 20 9-5v18l-9-5" /></svg>
        <span>수어를 담을 공간</span>
      </div>
      <div className="dictionary-intro">
        <span className="dictionary-badge">준비 중</span>
        <h2 id="dictionary-status">손끝의 표현을<br />단어로 만나요</h2>
        <p>카메라 앞에서 수어를 하면 인식한 단어와 뜻을 보여주는 사전을 준비하고 있어요.</p>
        <p className="dictionary-note">카메라 인식 기능은 추후 제공됩니다.</p>
      </div>
    </section>
  </main>;
}
