import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { generateFrameThumbnail, generateDefaultFrame } from '../utils/composer';

const DEFAULT_FRAMES = [
  { id: 'no-frame', name: '기본 프레임', type: 'default', source: 'store' }
];

export default function FrameManagement({ onBack }) {
  const [frames, setFrames] = useState([]);
  const [activeTab, setActiveTab] = useState('owned'); // owned, hidden
  const [activeFilter, setActiveFilter] = useState('all'); // all, store, custom

  useEffect(() => {
    // Load default frames
    const defaults = DEFAULT_FRAMES.map(f => ({
      ...f,
      imageUrl: generateFrameThumbnail(f.id)
    }));
    
    // Fetch custom frames
    fetch('/api/frames')
      .then(res => res.json())
      .then(data => {
        setFrames([...defaults, ...data.map(d => ({ ...d, isCustom: true, source: 'custom' }))]);
      })
      .catch(err => {
        console.error('Failed to load frames', err);
        setFrames(defaults);
      });
  }, []);

  const handleSelect = (frame) => {
    // Here we could open an edit modal, but for now just console log
    console.log('Selected frame for management:', frame);
  };

  const filteredFrames = frames.filter(f => {
    if (activeFilter === 'store' && f.source !== 'store') return false;
    if (activeFilter === 'custom' && f.source !== 'custom') return false;
    // Assume hiding is not fully implemented on backend, we just show all in 'owned' for now
    if (activeTab === 'hidden') return false; // mockup
    return true;
  });

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#fff' }}>
      <div className="topbar">
        <button className="back-btn" onClick={onBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <span className="title">프레임 관리</span>
        <button className="right-action">편집</button>
      </div>

      <div className="tabs">
        <div className={`tab ${activeTab === 'owned' ? 'active' : ''}`} onClick={() => setActiveTab('owned')}>
          보유중인 프레임
        </div>
        <div className={`tab ${activeTab === 'hidden' ? 'active' : ''}`} onClick={() => setActiveTab('hidden')}>
          숨긴 프레임
        </div>
      </div>

      <div className="filters">
        <button className={`filter-pill ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>
          프레임 전체
        </button>
        <button className={`filter-pill ${activeFilter === 'store' ? 'active' : ''}`} onClick={() => setActiveFilter('store')}>
          스토어 프레임
        </button>
        <button className={`filter-pill ${activeFilter === 'custom' ? 'active' : ''}`} onClick={() => setActiveFilter('custom')}>
          나만의 프레임
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div className="frame-grid">
          {filteredFrames.map((frame, i) => (
            <motion.div
              key={frame.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="frame-card"
              onClick={() => handleSelect(frame)}
            >
              <img src={frame.imageUrl} alt={frame.name} />
              {/* Optional hide overlay placeholder */}
              {/* <div className="frame-overlay-hidden">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
                <span>숨김</span>
              </div> */}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="bottom-actions">
        <button className="btn-light">프레임 만들기</button>
        <button className="btn-black">스토어 가기</button>
      </div>
    </div>
  );
}
