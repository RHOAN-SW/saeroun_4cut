import React, { useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { compose, FILTER_OPTIONS, FRAME_OPTIONS } from '../utils/composer';

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
  padding: 6px 24px 12px;

  canvas {
    height: 100%;
    width: auto;
    aspect-ratio: 9 / 16;
    object-fit: contain;
    max-height: 500px;
    max-width: 100%;
    border: 1px solid #c8cdd2;
    background: #fff;
  }
`;

const Controls = styled.section`
  flex: 0 0 auto;
  border-top: 1px solid #e5e8eb;
  background: #fff;
`;

const Tabs = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-bottom: 1px solid #e5e8eb;
`;

const Tab = styled.button`
  position: relative;
  height: 48px;
  border: 0;
  background: transparent;
  color: ${({ $active, theme }) => $active ? theme.colors.text : theme.colors.secondaryText};
  font: inherit;
  font-size: 15px;
  font-weight: 700;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: -1px;
    height: 2px;
    background: ${({ $active }) => $active ? '#111' : 'transparent'};
  }
`;

const OptionPanel = styled.div`
  padding: 12px 20px 14px;
`;

const AllPill = styled.span`
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 13px;
  border-radius: 2px;
  background: #000;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
`;

const CircleRow = styled.div`
  display: flex;
  gap: 14px;
  margin-top: 12px;
  overflow-x: auto;
  padding: 2px 2px 5px;
`;

const CircleOption = styled.button`
  position: relative;
  flex: 0 0 50px;
  width: 50px;
  height: 50px;
  overflow: hidden;
  padding: 0;
  border: 2px solid ${({ $selected }) => $selected ? '#111' : '#b8bec5'};
  border-radius: 50%;
  background: ${({ $background }) => $background};
  outline: ${({ $selected }) => $selected ? '2px solid #111' : 'none'};
  outline-offset: 2px;
  transition: transform 120ms ease;

  &:active { transform: scale(.94); }
  img { width: 100%; height: 100%; object-fit: cover; }
`;

const Footer = styled.div`
  flex: 0 0 auto;
  padding: 8px 20px calc(16px + env(safe-area-inset-bottom));
`;

const NextButton = styled.button`
  width: 100%;
  min-height: 56px;
  border: 0;
  border-radius: 4px;
  background: #000;
  color: #fff;
  font: inherit;
  font-size: 16px;
  font-weight: 700;
  transition: transform 120ms ease;
  &:active { transform: scale(.985); }
`;

export default function StepFrameSelect({ photos, selectedFrame, selectedFilter, onSelect, onSelectFilter, onNext, onBack }) {
  const canvasRef = useRef(null);
  const [activeTab, setActiveTab] = useState('frame');

  useEffect(() => {
    if (canvasRef.current) compose(canvasRef.current, photos, selectedFrame, selectedFilter).catch(console.error);
  }, [photos, selectedFrame, selectedFilter]);

  const options = activeTab === 'frame' ? FRAME_OPTIONS : FILTER_OPTIONS;

  return (
    <Screen>
      <div className="topbar">
        <button className="back-btn" onClick={onBack} aria-label="사진 다시 선택하기">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="title">프레임 선택</span>
        <div style={{ width: 32 }} />
      </div>

      <PreviewArea><canvas ref={canvasRef} aria-label="프레임 미리보기" /></PreviewArea>

      <Controls>
        <Tabs>
          <Tab $active={activeTab === 'frame'} onClick={() => setActiveTab('frame')}>프레임</Tab>
          <Tab $active={activeTab === 'filter'} onClick={() => setActiveTab('filter')}>필터</Tab>
        </Tabs>
        <OptionPanel>
          <AllPill>전체</AllPill>
          <CircleRow>
            {options.map(option => {
              const selected = activeTab === 'frame' ? selectedFrame === option.id : selectedFilter === option.id;
              return (
                <CircleOption
                  key={option.id}
                  type="button"
                  $selected={selected}
                  $background={option.swatch || option.color || '#fff'}
                  onClick={() => activeTab === 'frame' ? onSelect(option.id) : onSelectFilter(option.id)}
                  aria-label={`${option.name} ${selected ? '선택됨' : '선택'}`}
                  aria-pressed={selected}
                >
                  {option.preview && <img src={option.preview} alt="" />}
                </CircleOption>
              );
            })}
          </CircleRow>
        </OptionPanel>
      </Controls>

      <Footer><NextButton onClick={onNext}>이대로 완성하기</NextButton></Footer>
    </Screen>
  );
}
