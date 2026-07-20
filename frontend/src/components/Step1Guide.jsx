import React, { useState, useEffect } from 'react';

export default function Step1Guide({ onNext, onBack }) {
  const [phase, setPhase] = useState('guide'); // 'guide' | 'ready'

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
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '40px' }}>곧 촬영이 시작해요!</h2>
        
        {/* Simple 4-cut doodle SVG */}
        <svg width="120" height="120" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
          <rect x="10" y="10" width="35" height="35" rx="4" fill="#eee" />
          <rect x="55" y="10" width="35" height="35" rx="4" />
          <path d="M 65 25 Q 72.5 35 80 25" fill="none" stroke="black" strokeWidth="3" />
          <circle cx="68" cy="20" r="2" fill="black" stroke="none" />
          <circle cx="77" cy="20" r="2" fill="black" stroke="none" />
          
          <rect x="10" y="55" width="35" height="35" rx="4" />
          <path d="M 20 65 L 25 70 L 30 65 M 35 65 L 40 70 L 45 65 M 30 75 A 5 5 0 0 0 35 75" stroke="black" strokeWidth="3" fill="none" />
          
          <rect x="55" y="55" width="35" height="35" rx="4" fill="#eee" />
        </svg>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#f8f9fa' }}>
      <div className="topbar" style={{ background: 'transparent' }}>
        <button className="back-btn" onClick={onBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginTop: '20px', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', lineHeight: 1.4 }}>
            찍기 전에<br/>보고 갈까요?!
          </h1>
        </div>

        <div style={{ background: '#fff', borderRadius: '24px', padding: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', marginBottom: '40px' }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <li style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#f1f3f5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '20px' }}>⏱️</span>
              </div>
              <span style={{ fontSize: '15px', fontWeight: '500' }}>타이머 후 자동으로 촬영돼요.</span>
            </li>

            <li style={{ borderBottom: '1px solid #f1f3f5' }}></li>

            <li style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#f1f3f5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '20px' }}>📸</span>
              </div>
              <span style={{ fontSize: '15px', fontWeight: '500' }}>화면의 촬영 버튼을 누르면 남은 시간을 2초로 줄일 수 있어요.</span>
            </li>

            <li style={{ borderBottom: '1px solid #f1f3f5' }}></li>

            <li style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#f1f3f5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '20px' }}>🖼️</span>
              </div>
              <span style={{ fontSize: '15px', fontWeight: '500' }}>여러 장을 찍었다면 마음에 드는 4장을 고를 수 있어요.</span>
            </li>

            <li style={{ borderBottom: '1px solid #f1f3f5' }}></li>

            <li style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#f1f3f5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '20px' }}>🔙</span>
              </div>
              <span style={{ fontSize: '15px', fontWeight: '500' }}>뒤로가기로 촬영을 중단할 수 있어요.</span>
            </li>

            <li style={{ borderBottom: '1px solid #f1f3f5' }}></li>

            <li style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#f1f3f5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '20px' }}>📱</span>
              </div>
              <span style={{ fontSize: '15px', fontWeight: '500' }}>완성된 네컷은 사진 앱 또는 파일에 저장할 수 있어요.</span>
            </li>

          </ul>
        </div>
      </div>

      <div style={{ padding: '24px', background: '#f8f9fa' }}>
        <button 
          className="btn-black" 
          style={{ width: '100%', padding: '20px', borderRadius: '16px', fontSize: '18px', fontWeight: 'bold' }}
          onClick={() => setPhase('ready')}
        >
          촬영하기
        </button>
      </div>
    </div>
  );
}
