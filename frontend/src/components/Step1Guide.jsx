import React, { useEffect, useState } from 'react';

const GUIDE_ITEMS = [
  '타이머 후 자동으로 촬영돼요.',
  '화면의 촬영 버튼을 누르면 남은 시간을 2초로 줄일 수 있어요.',
  '여러 장을 찍었다면 마음에 드는 4장을 고를 수 있어요.',
  '뒤로가기로 촬영을 중단할 수 있어요.',
  '완성된 네컷은 QR로 받거나 이 iPad에 바로 저장할 수 있어요.',
];

export default function Step1Guide({ onNext, onBack }) {
  const [phase, setPhase] = useState('guide');

  useEffect(() => {
    if (phase === 'ready') {
      const timer = setTimeout(() => {
        onNext();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [phase, onNext]);

  if (phase === 'ready') {
    return (
      <div className="guide-ready">
        <h2>곧 촬영이 시작해요!</h2>

        <svg className="guide-ready-mark" width="120" height="120" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
          <rect x="10" y="10" width="35" height="35" />
          <rect x="55" y="10" width="35" height="35" />
          <rect x="10" y="55" width="35" height="35" />
          <rect x="55" y="55" width="35" height="35" />
        </svg>
      </div>
    );
  }

  return (
    <div className="guide-screen">
      <div className="topbar">
        <button className="back-btn" onClick={onBack} aria-label="처음 화면으로 돌아가기">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      </div>

      <div className="guide-content">
        <header className="guide-heading">
          <h1>찍기 전에<br />보고 갈까요?</h1>
        </header>

        <ol className="guide-list">
          {GUIDE_ITEMS.map((item, index) => (
            <li key={item}>
              <span className="guide-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="guide-footer">
        <button className="btn-black" onClick={() => setPhase('ready')}>
          촬영하기
        </button>
      </div>
    </div>
  );
}
