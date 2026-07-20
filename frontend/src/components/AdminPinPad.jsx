import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminPinPad({ onSuccess, onCancel }) {
  const [pin, setPin] = useState('');

  const handlePress = (char) => {
    if (char === '완료') {
      if (pin === '6569') {
        onSuccess();
      } else {
        alert('암호가 틀렸습니다.');
        setPin('');
      }
    } else {
      if (pin.length < 4) {
        setPin(prev => prev + char);
      }
    }
  };

  const keys = [
    '1', '2', '3',
    '4', '5', '6',
    '7', '8', '9',
    '', '0', '완료'
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      style={{ position: 'absolute', inset: 0, background: '#fff', zIndex: 200, display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ padding: '20px' }}>
        <button onClick={onCancel} style={{ background: 'none', border: 'none', padding: '10px', marginLeft: '-10px', cursor: 'pointer' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '500', marginTop: '20px', marginBottom: '40px', color: '#111' }}>비밀번호를 입력해주세요</h2>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '100px' }}>
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

        <div style={{ width: '100%', maxWidth: '320px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px 0' }}>
          {keys.map((k, idx) => (
            <div 
              key={idx} 
              onClick={() => k && handlePress(k)}
              style={{ 
                height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: k === '완료' ? '20px' : '36px',
                fontWeight: '300',
                color: '#111',
                cursor: k ? 'pointer' : 'default',
                userSelect: 'none'
              }}
            >
              {k}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
