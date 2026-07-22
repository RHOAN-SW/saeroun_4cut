import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function Step4QR({ qrData, onClose, onNewSession }) {
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

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="qr-popup-backdrop"
      role="dialog"
      aria-modal="true"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="qr-popup" onMouseDown={(event) => event.stopPropagation()}>
        <div className="qr-popup-header">
          <div>
            <span className="qr-eyebrow">QR 준비 완료</span>
            <h2>이제 스캔해서 저장해요</h2>
          </div>
        </div>

        <div className="qr-popup-card" aria-label="사진 다운로드 QR코드">
          <QRCodeSVG value={downloadUrl} size={232} level="M" marginSize={2} />
        </div>

        <p className="qr-popup-copy">스마트폰 카메라로 QR을 스캔하면 완성된 네컷 사진을 바로 저장할 수 있어요.</p>

        <div className="qr-popup-info">
          <strong>{timeLeft}</strong>
          <span>남은 다운로드 시간</span>
        </div>

        <div className="qr-popup-actions">
          <button className="btn-light" onClick={onClose}>완성 화면으로 돌아가기</button>
          <button className="btn-black" onClick={onNewSession}>새로 촬영하기</button>
        </div>
      </div>
    </div>
  );
}
