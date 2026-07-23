import React, { useEffect, useState } from 'react';

const settingsMatch = (first, second) => (
  first.timer === second.timer
  && first.shots === second.shots
  && first.mirror === second.mirror
  && first.filter === second.filter
  && first.showGuide === second.showGuide
);

export default function CameraSettings({ onClose, settings, onEdit, onSave, saveStatus }) {
  const timers = [4, 6, 8, 12];
  const shots = [4, 6, 8];
  const [draftSettings, setDraftSettings] = useState(settings);
  const hasChanges = !settingsMatch(draftSettings, settings);

  useEffect(() => {
    setDraftSettings(settings);
  }, [settings]);

  const updateSetting = (key, value) => {
    onEdit();
    setDraftSettings(current => ({ ...current, [key]: value }));
  };

  const handleSave = async () => {
    try {
      const savedSettings = await onSave(draftSettings);
      setDraftSettings(savedSettings);
    } catch {
      // The parent exposes the failure through saveStatus.
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', background: '#fff', position: 'absolute', zIndex: 100 }}>
      <div className="topbar">
        <button className="back-btn" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <span className="title">카메라 설정</span>
        <div style={{ width: 24 }}></div> {/* spacer */}
      </div>

      <div className="settings-container">
        {/* Timer */}
        <div className="setting-group">
          <div className="setting-title">타이머 설정</div>
          <div className="radio-group">
            {timers.map(t => (
              <div key={t} className="radio-label" onClick={() => updateSetting('timer', t)}>
                <div className={`radio-circle ${draftSettings.timer === t ? 'active' : ''}`}></div>
                <span>{t}초</span>
              </div>
            ))}
          </div>
        </div>

        {/* Shots */}
        <div className="setting-group">
          <div className="setting-title">사진 촬영 수</div>
          <div className="radio-group">
            {shots.map(s => (
              <div key={s} className="radio-label" onClick={() => updateSetting('shots', s)}>
                <div className={`radio-circle ${draftSettings.shots === s ? 'active' : ''}`}></div>
                <span>{s}장</span>
              </div>
            ))}
          </div>
          <p className="setting-help">6장 또는 8장을 촬영하면 결과 화면에서 원하는 4장을 고를 수 있어요.</p>
        </div>

        <div style={{ marginTop: '40px' }}>
          <div className="toggle-row">
            <span>거울모드</span>
            <div 
              className={`toggle-switch ${draftSettings.mirror ? 'active' : ''}`}
              onClick={() => updateSetting('mirror', !draftSettings.mirror)}
            ></div>
          </div>
          <div className="toggle-row">
            <span>기본보정</span>
            <div 
              className={`toggle-switch ${draftSettings.filter ? 'active' : ''}`}
              onClick={() => updateSetting('filter', !draftSettings.filter)}
            ></div>
          </div>
          <div className="toggle-row">
            <span>가이드 화면</span>
            <div 
              className={`toggle-switch ${draftSettings.showGuide !== false ? 'active' : ''}`}
              onClick={() => updateSetting('showGuide', draftSettings.showGuide === false)}
            ></div>
          </div>
        </div>

        <button
          type="button"
          className="btn-black settings-save-button"
          onClick={handleSave}
          disabled={!hasChanges || saveStatus === 'saving'}
        >
          {saveStatus === 'saving' ? '저장 중...' : '모든 카메라에 저장'}
        </button>

        <p role="status" style={{ marginTop: '24px', color: saveStatus === 'error' ? '#d92d20' : '#777', fontSize: '13px' }}>
          {saveStatus === 'saving' && '설정을 저장하는 중이에요.'}
          {saveStatus === 'saved' && '모든 카메라에 설정이 저장됐어요.'}
          {saveStatus === 'error' && '설정을 저장하지 못했어요. 잠시 후 다시 시도해주세요.'}
        </p>

      </div>
    </div>
  );
}
