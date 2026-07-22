import React, { useState } from 'react';
import { motion } from 'framer-motion';

const SETTINGS_PIN = '1111';

export default function AdminPinPad({ onSuccess, onCancel }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handlePress = (char) => {
    if (char === '완료') {
      if (pin === SETTINGS_PIN) {
        onSuccess();
      } else {
        setError('비밀번호가 올바르지 않아요.');
        setPin('');
      }
    } else if (char === '삭제') {
      setError('');
      setPin(current => current.slice(0, -1));
    } else {
      if (pin.length < 4) {
        setError('');
        setPin(prev => prev + char);
      }
    }
  };

  const keys = [
    '1', '2', '3',
    '4', '5', '6',
    '7', '8', '9',
    '삭제', '0', '완료'
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-pin-title"
      style={{ position: 'absolute', inset: 0, background: '#fff', zIndex: 200, display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ padding: '20px' }}>
        <button onClick={onCancel} aria-label="비밀번호 입력 취소" style={{ background: 'none', border: 'none', padding: '10px', marginLeft: '-10px', cursor: 'pointer' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2 id="settings-pin-title" style={{ fontSize: '20px', fontWeight: '500', marginTop: '20px', marginBottom: '40px', color: '#111' }}>설정 비밀번호를 입력해주세요</h2>

        <div aria-label={`${pin.length}자리 입력됨`} style={{ display: 'flex', gap: '16px', marginBottom: error ? '16px' : '52px' }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{ 
              width: '50px', height: '70px', borderRadius: '12px', 
              background: '#f2f2f2', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px', color: '#333'
            }}>
              {pin.length > i ? '●' : ''}
            </div>
          ))}
        </div>

        <p role="alert" style={{ minHeight: '24px', marginBottom: '28px', color: '#d92d20', fontSize: '14px' }}>{error}</p>

        <div style={{ width: '100%', maxWidth: '320px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px 0' }}>
          {keys.map((k, idx) => (
            <button
              key={idx} 
              onClick={() => k && handlePress(k)}
              type="button"
              style={{ 
                height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 0, background: 'transparent',
                fontSize: k === '완료' || k === '삭제' ? '20px' : '36px',
                fontWeight: '300',
                color: '#111',
                cursor: k ? 'pointer' : 'default',
                userSelect: 'none'
              }}
            >
              {k}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
