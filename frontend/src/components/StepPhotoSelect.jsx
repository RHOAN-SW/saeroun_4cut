import React, { useMemo, useState } from 'react';
import styled from '@emotion/styled';

const Screen = styled.div`
  width: 100%;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #fff;
`;

const PreviewArea = styled.div`
  flex: 1;
  min-height: 0;
  display: grid;
  place-items: center;
  padding: 4px 24px 10px;
`;

const PreviewSheet = styled.div`
  height: 100%;
  max-height: 470px;
  aspect-ratio: 9 / 16;
  padding: 8% 6% 24%;
  border: 1px solid #ccd0d4;
  background: #fff;
`;

const PreviewGrid = styled.div`
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 3px;

  div { overflow: hidden; background: #d5d5d5; }
  img { width: 100%; height: 100%; object-fit: cover; }
`;

const Picker = styled.section`
  flex: 0 0 auto;
  padding: 8px 20px 10px;
`;

const PickerHeading = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
  font-weight: 700;

  span { color: ${({ theme }) => theme.colors.secondaryText}; }
`;

const PhotoRow = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 2px 1px 4px;
`;

const PhotoButton = styled.button`
  position: relative;
  flex: 0 0 clamp(68px, 12vw, 92px);
  height: clamp(92px, 16vw, 124px);
  overflow: hidden;
  padding: 0;
  border: 3px solid ${({ $selected }) => $selected ? '#111' : 'transparent'};
  border-radius: 2px;
  background: #e5e5e5;
  transition: transform 120ms ease, border-color 120ms ease;

  &:active { transform: scale(.97); }
  img { width: 100%; height: 100%; object-fit: cover; }
  span {
    position: absolute;
    top: 5px;
    left: 5px;
    display: grid;
    place-items: center;
    width: 23px;
    height: 23px;
    border-radius: 50%;
    background: #111;
    color: #fff;
    font-size: 11px;
    font-weight: 800;
  }
`;

const Footer = styled.div`
  flex: 0 0 auto;
  padding: 8px 20px calc(16px + env(safe-area-inset-bottom));
`;

const NextButton = styled.button`
  width: 100%;
  min-height: 58px;
  border: 0;
  border-radius: 4px;
  background: #000;
  color: #fff;
  font: inherit;
  font-size: 16px;
  font-weight: 700;
  transition: transform 120ms ease, opacity 120ms ease;
  &:active:not(:disabled) { transform: scale(.985); }
  &:disabled { background: #b8b8b8; color: #f1f1f1; opacity: 1; }
`;

export default function StepPhotoSelect({ photos, initialPhotos = [], onNext, onBack }) {
  const available = useMemo(() => photos.filter(Boolean), [photos]);
  const [selectedIndexes, setSelectedIndexes] = useState(() => (
    initialPhotos.map(photo => available.indexOf(photo)).filter(index => index >= 0).slice(0, 4)
  ));
  const selectedPhotos = selectedIndexes.map(index => available[index]).filter(Boolean);

  const toggle = index => {
    setSelectedIndexes(current => {
      if (current.includes(index)) return current.filter(value => value !== index);
      if (current.length >= 4) return current;
      return [...current, index];
    });
  };

  return (
    <Screen>
      <div className="topbar">
        <button className="back-btn" onClick={onBack} aria-label="다시 촬영하기">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="title">사진 4장 선택</span>
        <div style={{ width: 32 }} />
      </div>

      <PreviewArea>
        <PreviewSheet aria-label="선택한 네 장 미리보기">
          <PreviewGrid>
            {[0, 1, 2, 3].map(index => (
              <div key={index}>{selectedPhotos[index] && <img src={selectedPhotos[index]} alt="" />}</div>
            ))}
          </PreviewGrid>
        </PreviewSheet>
      </PreviewArea>

      <Picker>
        <PickerHeading>
          <strong>사진 선택 ({selectedPhotos.length}/4)</strong>
          <span>선택한 순서대로 배치돼요</span>
        </PickerHeading>
        <PhotoRow>
          {available.map((photo, index) => {
            const order = selectedIndexes.indexOf(index);
            return (
              <PhotoButton
                key={index}
                type="button"
                $selected={order >= 0}
                onClick={() => toggle(index)}
                aria-label={`${index + 1}번째 사진 ${order >= 0 ? '선택 해제' : '선택'}`}
              >
                <img src={photo} alt="" />
                {order >= 0 && <span>{order + 1}</span>}
              </PhotoButton>
            );
          })}
        </PhotoRow>
      </Picker>

      <Footer>
        <NextButton disabled={selectedPhotos.length !== 4} onClick={() => onNext(selectedPhotos)}>다음</NextButton>
      </Footer>
    </Screen>
  );
}
