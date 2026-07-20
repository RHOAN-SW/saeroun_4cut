import React, { useState, useEffect } from 'react';

export default function Step4QR({ qrData, onNewSession }) {
  const { qrCode, expiresAt } = qrData;
  const [timeLeft, setTimeLeft] = useState('10:00');

  useEffect(() => {
    if (!expiresAt) return;
    const expireTime = new Date(expiresAt).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const remaining = Math.max(0, expireTime - now);

      if (remaining <= 0) {
        setTimeLeft('00:00');
        clearInterval(interval);
        alert('다운로드 시간이 만료되었습니다.');
        return;
      }

      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      setTimeLeft(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#fff', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>QR코드를 스캔하세요</h2>
        <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.5 }}>
          스마트폰 카메라로 QR코드를 스캔하면<br />
          사진을 다운로드할 수 있습니다
        </p>
      </div>

      <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.1)', marginBottom: '32px' }}>
        <img src={qrCode} alt="QR Code" style={{ width: '200px', height: '200px' }} />
      </div>

      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#000' }}>
          {timeLeft}
        </div>
        <p style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>남은 다운로드 시간</p>
      </div>

      <button className="btn-black" style={{ width: '100%' }} onClick={onNewSession}>
        처음으로 돌아가기
      </button>
    </div>
  );
}
