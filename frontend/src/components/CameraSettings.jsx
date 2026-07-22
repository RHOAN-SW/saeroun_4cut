import React from 'react';
import { motion } from 'framer-motion';

export default function CameraSettings({ onClose, settings, updateSetting, saveStatus }) {
  const timers = [4, 6, 8, 12];
  const shots = [4, 6, 8];

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
                <div className={`radio-circle ${settings.timer === t ? 'active' : ''}`}></div>
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
                <div className={`radio-circle ${settings.shots === s ? 'active' : ''}`}></div>
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
              className={`toggle-switch ${settings.mirror ? 'active' : ''}`}
              onClick={() => updateSetting('mirror', !settings.mirror)}
            ></div>
          </div>
          <div className="toggle-row">
            <span>기본보정</span>
            <div 
              className={`toggle-switch ${settings.filter ? 'active' : ''}`}
              onClick={() => updateSetting('filter', !settings.filter)}
            ></div>
          </div>
          <div className="toggle-row">
            <span>가이드 화면</span>
            <div 
              className={`toggle-switch ${settings.showGuide !== false ? 'active' : ''}`}
              onClick={() => updateSetting('showGuide', settings.showGuide === false ? true : false)}
            ></div>
          </div>
        </div>

        <p role="status" style={{ marginTop: '24px', color: saveStatus === 'error' ? '#d92d20' : '#777', fontSize: '13px' }}>
          {saveStatus === 'saving' && '설정을 저장하는 중이에요.'}
          {saveStatus === 'saved' && '설정이 저장됐어요.'}
          {saveStatus === 'error' && '설정을 저장하지 못했어요. 잠시 후 다시 시도해주세요.'}
        </p>

        <p className="privacy-note">사진은 이 iPad에서 합성되고, QR을 만들 때만 완성본 한 장이 Supabase에 10분 동안 저장됩니다.</p>
      </div>
    </div>
  );
}
