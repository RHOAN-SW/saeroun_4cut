'use client';

import { useEffect, useState } from 'react';

type PhotoData = { id: string; expiresAt: string; imageUrl: string };

export default function DownloadPage() {
  const [photo, setPhoto] = useState<PhotoData | null>(null);
  const [message, setMessage] = useState('사진을 불러오는 중...');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) {
      setMessage('잘못된 다운로드 주소입니다.');
      return;
    }
    fetch(`/api/photo/${encodeURIComponent(id)}`, { cache: 'no-store' })
      .then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data?.error || '사진을 찾을 수 없습니다.');
        return data;
      })
      .then(data => { setPhoto(data); setMessage(''); })
      .catch(error => setMessage(error.message));
  }, []);

  const savePhoto = async () => {
    if (!photo || saving) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/download/${photo.id}`, { cache: 'no-store' });
      if (!response.ok) throw new Error('사진 저장에 실패했습니다.');
      const blob = await response.blob();
      const file = new File([blob], `jr-fourcut-${photo.id}.jpg`, { type: 'image/jpeg' });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'JR 셀프 스튜디오 네컷' });
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } catch (error) {
      if ((error as Error)?.name !== 'AbortError') setMessage((error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="download-page">
      <div className="download-brand">JR SELF STUDIO <span>●</span></div>
      {photo ? (
        <>
          <img className="download-photo" src={photo.imageUrl} alt="완성된 네컷 사진" />
          <button className="btn-black download-button" onClick={savePhoto} disabled={saving}>
            {saving ? '저장 준비 중...' : '사진 저장하기'}
          </button>
          <p className="download-help">iPhone에서는 공유 메뉴의 “이미지 저장”을 선택하세요.</p>
        </>
      ) : (
        <div className="download-message">{message}</div>
      )}
    </main>
  );
}
