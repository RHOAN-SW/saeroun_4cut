import React, { useEffect, useMemo, useRef, useState } from 'react';
import { compose } from '../utils/composer';

const makeFileName = () => {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `jr-fourcut-${stamp}.jpg`;
};

const canvasToBlob = (canvas) => new Promise((resolve, reject) => {
  canvas.toBlob((blob) => {
    if (blob) resolve(blob);
    else reject(new Error('이미지를 만들 수 없습니다.'));
  }, 'image/jpeg', 0.95);
});

export default function Step3Preview({ photos, onRetake, onNewSession, onShowQr }) {
  const canvasRef = useRef(null);
  const availablePhotos = useMemo(() => photos.filter(Boolean), [photos]);
  const [selectedIndexes, setSelectedIndexes] = useState(() => availablePhotos.slice(0, 4).map((_, index) => index));
  const [isComposing, setIsComposing] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [notice, setNotice] = useState('');

  const selectedPhotos = useMemo(
    () => selectedIndexes.map(index => availablePhotos[index]).filter(Boolean),
    [availablePhotos, selectedIndexes]
  );

  useEffect(() => {
    let active = true;
    const runCompose = async () => {
      setIsComposing(true);
      if (canvasRef.current) await compose(canvasRef.current, selectedPhotos);
      if (active) setIsComposing(false);
    };
    runCompose().catch(() => active && setNotice('미리보기를 만들지 못했어요. 다시 촬영해주세요.'));
    return () => { active = false; };
  }, [selectedPhotos]);

  const togglePhoto = (index) => {
    setNotice('');
    setSelectedIndexes(current => {
      if (current.includes(index)) {
        if (current.length === 1) return current;
        return current.filter(item => item !== index);
      }
      if (current.length >= 4) {
        setNotice('네 장까지 선택할 수 있어요. 먼저 한 장을 해제해주세요.');
        return current;
      }
      return [...current, index];
    });
  };

  const downloadBlob = (blob, fileName) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = fileName;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleSave = async () => {
    if (!canvasRef.current || isComposing || selectedPhotos.length !== 4) return;
    setIsSaving(true);
    setNotice('');

    try {
      const blob = await canvasToBlob(canvasRef.current);
      const fileName = makeFileName();
      const file = new File([blob], fileName, { type: 'image/jpeg' });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'JR 셀프 스튜디오 네컷' });
        setNotice('공유 메뉴에서 “이미지 저장”을 선택하면 사진 앱에 저장돼요.');
      } else {
        downloadBlob(blob, fileName);
        setNotice('네컷 사진을 다운로드했어요.');
      }
    } catch (error) {
      if (error?.name !== 'AbortError') setNotice('저장하지 못했어요. 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateQr = async () => {
    if (!canvasRef.current || isComposing || isUploading || selectedPhotos.length !== 4) return;
    setIsUploading(true);
    setNotice('');

    try {
      const blob = await canvasToBlob(canvasRef.current);
      const formData = new FormData();
      formData.append('photo', blob, makeFileName());
      const response = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || '업로드 실패');
      onShowQr(data);
    } catch (error) {
      console.error(error);
      setNotice('QR을 만들지 못했어요. 인터넷 연결을 확인하고 다시 시도해주세요.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="result-screen">
      <div className="topbar">
        <button className="back-btn" onClick={onRetake} aria-label="다시 촬영하기">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <span className="title">네컷 완성</span>
        <div style={{ width: 24 }}></div>
      </div>

      <div className="result-content">
        <section className="result-preview" aria-label="완성된 네컷 미리보기">
          {isComposing && <div className="compose-status">합성 중...</div>}
          <canvas ref={canvasRef} className={isComposing ? 'is-hidden' : ''} />
        </section>

        {availablePhotos.length > 4 && (
          <section className="photo-picker">
            <div className="picker-heading">
              <strong>사진 4장 선택</strong>
              <span>{selectedPhotos.length}/4</span>
            </div>
            <div className="photo-picker-row">
              {availablePhotos.map((photo, index) => {
                const order = selectedIndexes.indexOf(index);
                const selected = order >= 0;
                return (
                  <button
                    key={index}
                    type="button"
                    className={`photo-choice ${selected ? 'selected' : ''}`}
                    onClick={() => togglePhoto(index)}
                    aria-label={`${index + 1}번째 사진 ${selected ? '선택 해제' : '선택'}`}
                  >
                    <img src={photo} alt="" />
                    {selected && <span>{order + 1}</span>}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        <div className="result-actions">
          <button className="btn-black" onClick={handleCreateQr} disabled={isComposing || isSaving || isUploading || selectedPhotos.length !== 4}>
            {isUploading ? 'QR 만드는 중...' : 'QR 다운로드 만들기'}
          </button>
          <button className="btn-light" onClick={handleSave} disabled={isComposing || isSaving || isUploading || selectedPhotos.length !== 4}>
            {isSaving ? '저장 준비 중...' : '이 iPad에 바로 저장'}
          </button>
          <button className="btn-light" onClick={onRetake} disabled={isSaving || isUploading}>다시 촬영하기</button>
          <button className="text-button" onClick={onNewSession} disabled={isSaving || isUploading}>처음으로</button>
          {notice && <p className="save-notice" role="status">{notice}</p>}
        </div>
      </div>
    </div>
  );
}
