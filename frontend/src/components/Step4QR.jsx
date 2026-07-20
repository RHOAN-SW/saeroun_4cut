import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function Step4QR({ qrData, onNewSession }) {
  const { downloadUrl, expiresAt } = qrData;
  const [timeLeft, setTimeLeft] = useState('10:00');

  useEffect(() => {
    if (!expiresAt) return undefined;
    const expireTime = new Date(expiresAt).getTime();
    const update = () => {
      const remaining = Math.max(0, expireTime - Date.now());
      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      setTimeLeft(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  return (
    <div className="qr-screen">
      <div className="qr-copy">
        <span className="qr-eyebrow">READY TO SAVE</span>
        <h2>QR코드를 스캔하세요</h2>
        <p>스마트폰 카메라로 스캔하면<br />완성된 네컷을 저장할 수 있어요.</p>
      </div>

      <div className="qr-card" aria-label="사진 다운로드 QR코드">
        <QRCodeSVG value={downloadUrl} size={224} level="M" marginSize={2} />
      </div>

      <div className="qr-timer">
        <strong>{timeLeft}</strong>
        <span>남은 다운로드 시간</span>
      </div>

      <button className="btn-black qr-home-button" onClick={onNewSession}>새로 촬영하기</button>
    </div>
  );
}
