import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { compose } from '../utils/composer';

const ActionCard = styled.div`
  width: min(720px, 100%);
  margin: 22px auto 0;
  padding: 20px;
  border-radius: ${({ theme }) => theme.radius.card};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
`;

const PrintHeading = styled.div`
  margin-bottom: 16px;

  strong {
    display: block;
    color: ${({ theme }) => theme.colors.text};
    font-size: 20px;
    line-height: 1.35;
  }

  span {
    display: block;
    margin-top: 6px;
    color: ${({ theme }) => theme.colors.secondaryText};
    font-size: 13px;
    line-height: 1.5;
  }
`;

const ActionStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  width: 100%;
  min-height: 58px;
  padding: 16px 18px;
  border: 0;
  border-radius: ${({ theme }) => theme.radius.button};
  background: ${({ $tone, theme }) => (
    $tone === 'print' ? theme.colors.accent
      : $tone === 'dark' ? theme.colors.primary
        : theme.colors.soft
  )};
  color: ${({ $tone, theme }) => ($tone === 'soft' ? theme.colors.text : '#fff')};
  font: inherit;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 120ms ease, filter 120ms ease, opacity 120ms ease;
  -webkit-user-select: none;
  user-select: none;

  &:active:not(:disabled) {
    transform: scale(0.975);
    filter: brightness(0.94);
  }

  &:focus-visible {
    outline: 3px solid rgba(255, 90, 0, 0.24);
    outline-offset: 2px;
  }

  &:disabled {
    cursor: default;
    opacity: 0.42;
  }
`;

const PrintIcon = () => (
  <svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M7 8V3h10v5M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2M7 14h10v7H7v-7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

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

export default function Step3Preview({ photos, frameId, onRetake, onNewSession, onShowQr }) {
  const canvasRef = useRef(null);
  const availablePhotos = useMemo(() => photos.filter(Boolean), [photos]);
  const [selectedIndexes, setSelectedIndexes] = useState(() => availablePhotos.slice(0, 4).map((_, index) => index));
  const [isComposing, setIsComposing] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [notice, setNotice] = useState('');

  const selectedPhotos = useMemo(
    () => selectedIndexes.map(index => availablePhotos[index]).filter(Boolean),
    [availablePhotos, selectedIndexes]
  );

  useEffect(() => {
    let active = true;
    const runCompose = async () => {
      setIsComposing(true);
      if (canvasRef.current) await compose(canvasRef.current, selectedPhotos, frameId);
      if (active) setIsComposing(false);
    };
    runCompose().catch(() => active && setNotice('미리보기를 만들지 못했어요. 다시 촬영해주세요.'));
    return () => { active = false; };
  }, [selectedPhotos, frameId]);

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
      setNotice(error?.message || 'QR을 만들지 못했어요. 인터넷 연결을 확인하고 다시 시도해주세요.');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePrint = () => {
    if (!canvasRef.current || isComposing || isPrinting || selectedPhotos.length !== 4) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      setNotice('인쇄 화면을 열 수 없어요. Safari의 팝업 차단을 확인해주세요.');
      return;
    }

    setIsPrinting(true);
    setNotice('AirPrint 창에서 Canon SELPHY CP1500을 선택해주세요.');

    const imageUrl = canvasRef.current.toDataURL('image/jpeg', 0.98);
    printWindow.document.open();
    printWindow.document.write(`<!doctype html>
      <html lang="ko">
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>JR 네컷 인쇄</title>
          <style>
            @page { size: 4in 6in; margin: 0; }
            * { box-sizing: border-box; }
            html, body { width: 4in; height: 6in; margin: 0; background: #fff; }
            body { display: grid; place-items: center; overflow: hidden; }
            img { display: block; width: 3.375in; height: 6in; object-fit: contain; }
            .fallback { display: none; }
            @media screen {
              html, body { width: 100%; min-height: 100%; height: auto; background: #f2f4f6; }
              body { padding: 24px; }
              img { width: min(420px, 88vw); height: auto; box-shadow: 0 12px 36px rgba(0,0,0,.14); }
              .fallback { position: fixed; right: 20px; bottom: 20px; display: block; border: 0; border-radius: 16px; padding: 15px 20px; background: #ff5a00; color: #fff; font: 700 16px -apple-system, sans-serif; }
            }
          </style>
        </head>
        <body>
          <img src="${imageUrl}" alt="완성된 네컷 사진">
          <button class="fallback" onclick="window.print()">인쇄 창 다시 열기</button>
          <script>
            const photo = document.querySelector('img');
            const openPrint = () => setTimeout(() => { window.focus(); window.print(); }, 180);
            photo.complete ? openPrint() : photo.addEventListener('load', openPrint, { once: true });
          <\/script>
        </body>
      </html>`);
    printWindow.document.close();

    window.setTimeout(() => setIsPrinting(false), 900);
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

        <div className="result-controls">
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

        <ActionCard>
          <PrintHeading>
            <strong>바로 인화할까요?</strong>
            <span>CP1500과 같은 Wi-Fi에 연결한 뒤 AirPrint에서 프린터를 선택해주세요.</span>
          </PrintHeading>
          <ActionStack>
          <ActionButton $tone="print" onClick={handlePrint} disabled={isComposing || isSaving || isUploading || isPrinting || selectedPhotos.length !== 4}>
            <PrintIcon />
            {isPrinting ? '인쇄 화면 여는 중...' : 'CP1500으로 출력'}
          </ActionButton>
          <ActionButton $tone="dark" onClick={handleCreateQr} disabled={isComposing || isSaving || isUploading || isPrinting || selectedPhotos.length !== 4}>
            {isUploading ? 'QR 만드는 중...' : 'QR 다운로드 만들기'}
          </ActionButton>
          <ActionButton $tone="soft" onClick={handleSave} disabled={isComposing || isSaving || isUploading || isPrinting || selectedPhotos.length !== 4}>
            {isSaving ? '저장 준비 중...' : '이 iPad에 바로 저장'}
          </ActionButton>
          <ActionButton $tone="soft" onClick={onRetake} disabled={isSaving || isUploading || isPrinting}>다시 촬영하기</ActionButton>
          <button className="text-button" onClick={onNewSession} disabled={isSaving || isUploading || isPrinting}>처음으로</button>
          {notice && <p className="save-notice" role="status">{notice}</p>}
          </ActionStack>
        </ActionCard>
        </div>
      </div>
    </div>
  );
}
