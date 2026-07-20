import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { FRAME_OPTIONS } from '../utils/composer';

const Screen = styled.div`
  width: 100%;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.background};
  overflow: hidden;
`;

const Copy = styled.div`
  padding: clamp(4px, 1.2vh, 14px) 24px clamp(12px, 2vh, 22px);
  text-align: center;

  h1 { color: ${({ theme }) => theme.colors.text}; font-size: clamp(24px, 3.2vh, 32px); line-height: 1.3; }
  p { margin-top: 7px; color: ${({ theme }) => theme.colors.secondaryText}; font-size: 14px; }
`;

const FrameGrid = styled.div`
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(10px, 2vw, 18px);
  width: min(850px, 100%);
  margin: 0 auto;
  padding: 0 24px 16px;
`;

const FrameButton = styled(motion.button)`
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: clamp(10px, 1.6vh, 16px);
  border: 3px solid ${({ $selected, theme }) => $selected ? theme.colors.accent : 'transparent'};
  border-radius: 22px;
  background: #fff;
  box-shadow: ${({ $selected }) => $selected ? '0 10px 30px rgba(255,90,0,.16)' : '0 8px 22px rgba(0,0,0,.05)'};
  font: inherit;
  cursor: pointer;
  overflow: hidden;
`;

const MiniFrame = styled.div`
  position: relative;
  flex: 1;
  min-height: 0;
  aspect-ratio: 9 / 16;
  overflow: hidden;
  border-radius: 7px;
  background: ${({ $mode }) => $mode === 'mono' ? '#14171a' : '#fff'};
  box-shadow: 0 5px 16px rgba(0,0,0,.14);

  > img { width: 100%; height: 100%; object-fit: cover; }
`;

const MiniPhotos = styled.div`
  position: absolute;
  top: 4.1%;
  left: 6.1%;
  right: 6.1%;
  height: 71.6%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 2.3%;

  span { background: ${({ $mode }) => $mode === 'mono' ? '#59616a' : '#dfe4e8'}; }
`;

const MiniBrand = styled.span`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 9%;
  color: ${({ $mode }) => $mode === 'mono' ? '#fff' : '#191f28'};
  font-size: clamp(5px, 1.1vw, 11px);
  font-weight: 800;
  letter-spacing: .12em;
`;

const FrameLabel = styled.div`
  width: 100%;
  margin-top: clamp(8px, 1.3vh, 13px);
  text-align: left;

  strong { display: block; color: ${({ theme }) => theme.colors.text}; font-size: clamp(13px, 1.7vw, 16px); }
  span { display: block; margin-top: 3px; color: ${({ theme }) => theme.colors.secondaryText}; font-size: 11px; }
`;

const Footer = styled.div`
  flex: 0 0 auto;
  padding: 14px 24px calc(16px + env(safe-area-inset-bottom));
  background: #fff;
`;

const ContinueButton = styled.button`
  display: block;
  width: min(650px, 100%);
  min-height: 58px;
  margin: 0 auto;
  border: 0;
  border-radius: ${({ theme }) => theme.radius.button};
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  font: inherit;
  font-size: 17px;
  font-weight: 700;
  transition: transform 120ms ease;
  &:active { transform: scale(.98); }
`;

function FramePreview({ frame }) {
  if (frame.preview) {
    return <MiniFrame><img src={frame.preview} alt="" /></MiniFrame>;
  }

  return (
    <MiniFrame $mode={frame.id}>
      <MiniPhotos $mode={frame.id}>{[0, 1, 2, 3].map(i => <span key={i} />)}</MiniPhotos>
      <MiniBrand $mode={frame.id}>JR SELF STUDIO</MiniBrand>
    </MiniFrame>
  );
}

export default function StepFrameSelect({ selectedFrame, onSelect, onNext, onBack }) {
  return (
    <Screen>
      <div className="topbar frame-topbar">
        <button className="back-btn" onClick={onBack} aria-label="다시 촬영하기">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="title">프레임 선택</span>
        <div style={{ width: 32 }} />
      </div>

      <Copy>
        <h1>오늘의 프레임을 골라주세요</h1>
        <p>촬영한 사진에 선택한 프레임을 입혀 저장하고 인화해요.</p>
      </Copy>

      <FrameGrid>
        {FRAME_OPTIONS.map((frame, index) => (
          <FrameButton
            key={frame.id}
            type="button"
            $selected={selectedFrame === frame.id}
            onClick={() => onSelect(frame.id)}
            whileTap={{ scale: .975 }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * .05 }}
            aria-pressed={selectedFrame === frame.id}
          >
            <FramePreview frame={frame} />
            <FrameLabel>
              <strong>{frame.name}</strong>
              <span>{frame.description}</span>
            </FrameLabel>
          </FrameButton>
        ))}
      </FrameGrid>

      <Footer>
        <ContinueButton onClick={onNext}>이 프레임으로 촬영하기</ContinueButton>
      </Footer>
    </Screen>
  );
}
