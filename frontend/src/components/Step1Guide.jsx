import React, { useEffect, useState } from 'react';

const GUIDE_ITEMS = [
  { id: 'timer', text: '6초 타이머 후 바로 촬영돼요.' },
  { id: 'shutter', text: '촬영하기를 누르면 바로 시작돼요.' },
  { id: 'select', text: '6장 촬영 후 마음에 드는 4장을 골라요.' },
  { id: 'frame', text: '프레임과 필터는 촬영이 끝난 뒤 선택해요.' },
  { id: 'cancel', text: '뒤로가기로 촬영을 중단할 수 있어요.' },
  { id: 'qr', text: 'QR로 사진과 영상을 바로 받아가요.' },
];

const ICONS = {
  timer: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="13" r="7" />
      <path d="M12 10V7" />
      <path d="M16 3L16.5 4" />
      <path d="M4.5 5L5 4" />
      <path d="M12 2.5V4" />
    </svg>
  ),
  shutter: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="7" width="18" height="14" rx="2" />
      <path d="M8 7L10 3H14L16 7" />
      <circle cx="12" cy="14" r="3" />
    </svg>
  ),
  select: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="7" width="14" height="12" rx="2" />
      <path d="M8 11H8.01" />
      <path d="M12 11H12.01" />
      <path d="M16 11H16.01" />
    </svg>
  ),
  frame: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M8 8L16 8" />
      <path d="M8 12L16 12" />
      <path d="M8 16L16 16" />
    </svg>
  ),
  cancel: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M15 9L9 15" />
      <path d="M9 9L15 15" />
    </svg>
  ),
  qr: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="6" height="6" rx="1" />
      <rect x="15" y="3" width="6" height="6" rx="1" />
      <rect x="3" y="15" width="6" height="6" rx="1" />
      <path d="M15 15H18V18H21" />
      <path d="M18 15V18" />
    </svg>
  ),
};

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

        <div className="guide-card">
          <ol className="guide-list">
            {GUIDE_ITEMS.map(({ id, text }) => (
              <li key={id}>
                <div className="guide-item-icon">{ICONS[id]}</div>
                <div className="guide-item-copy">{text}</div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="guide-footer">
        <button className="btn-black" onClick={() => setPhase('ready')}>
          촬영하기
        </button>
      </div>
    </div>
  );
}
