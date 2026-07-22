'use client';

import React, { useEffect, useState } from 'react';
import { ThemeProvider } from '@emotion/react';
import { motion, AnimatePresence } from 'framer-motion';
import Home from './components/Home';
import AdminPinPad from './components/AdminPinPad';
import CameraSettings from './components/CameraSettings';
import Step1Guide from './components/Step1Guide';
import StepPhotoSelect from './components/StepPhotoSelect';
import StepFrameSelect from './components/StepFrameSelect';
import Step2Camera from './components/Step2Camera';
import Step3Preview from './components/Step3Preview';
import Step4QR from './components/Step4QR';
import { tossTheme } from './styles/tossTheme';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 }
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4
};

export default function App() {
  const [step, setStep] = useState(0); // 0: Home, 1: Guide, 2: Camera, 3: Photos, 4: Frame, 5: Preview
  const [showSettingsPin, setShowSettingsPin] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsPin, setSettingsPin] = useState('');
  const [settingsSaveStatus, setSettingsSaveStatus] = useState('idle');
  const [selectedFrame, setSelectedFrame] = useState('frame0001');
  const [selectedFilter, setSelectedFilter] = useState('original');
  
  // Camera Settings State
  const [settings, setSettings] = useState({
    timer: 6,
    shots: 6,
    mirror: true,
    filter: false,
    showGuide: true
  });

  const [capturedPhotos, setCapturedPhotos] = useState(Array(settings.shots).fill(null));
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [qrData, setQrData] = useState(null);

  useEffect(() => {
    const preventDrag = (event) => event.preventDefault();
    document.addEventListener('dragstart', preventDrag);

    // Remove legacy app-shell caches so an iPad home-screen install always receives the latest flow.
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => registration.unregister());
      }).catch(() => {});
    }
    if ('caches' in window) {
      caches.keys().then(keys => Promise.all(
        keys.filter(key => key.startsWith('jr-fourcut-')).map(key => caches.delete(key))
      )).catch(() => {});
    }

    let active = true;
    fetch('/api/camera-settings', { cache: 'no-store' })
      .then(response => {
        if (!response.ok) throw new Error('설정을 불러오지 못했습니다.');
        return response.json();
      })
      .then(savedSettings => {
        if (!active) return;
        setSettings(savedSettings);
        setCapturedPhotos(Array(savedSettings.shots).fill(null));
      })
      .catch(() => {});

    return () => {
      active = false;
      document.removeEventListener('dragstart', preventDrag);
    };
  }, []);

  const updateSetting = (key, value) => {
    const next = { ...settings, [key]: value };
    setSettings(next);

    if (key === 'shots') {
      setCapturedPhotos(Array(value).fill(null));
      setSelectedPhotos([]);
    }

    setSettingsSaveStatus('saving');
    fetch('/api/camera-settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-settings-pin': settingsPin,
      },
      body: JSON.stringify(next),
    })
      .then(response => {
        if (!response.ok) throw new Error('설정을 저장하지 못했습니다.');
        setSettingsSaveStatus('saved');
      })
      .catch(() => setSettingsSaveStatus('error'));
  };

  const resetAll = () => {
    setCapturedPhotos(Array(settings.shots).fill(null));
    setSelectedPhotos([]);
    setQrData(null);
    setStep(0);
  };

  return (
    <ThemeProvider theme={tossTheme}>
      <div id="app">
      {/* Modals outside main AnimatePresence */}
        <AnimatePresence>
          {showSettingsPin && (
            <AdminPinPad
              onCancel={() => setShowSettingsPin(false)}
              onSuccess={pin => {
                setSettingsPin(pin);
                setSettingsSaveStatus('idle');
                setShowSettingsPin(false);
                setShowSettings(true);
              }}
            />
          )}
        </AnimatePresence>

        {showSettings && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 50 }}>
            <CameraSettings 
              onClose={() => setShowSettings(false)}
              settings={settings}
              updateSetting={updateSetting}
              saveStatus={settingsSaveStatus}
            />
          </div>
        )}

      <main className="main-content" style={{ position: 'relative', overflowX: 'hidden', flex: 1, display: 'flex' }}>
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step0"
              initial="initial" animate="in" exit="out"
              variants={pageVariants} transition={pageTransition}
              className="step-section active"
            >
              <Home 
                onStart={() => setStep(settings.showGuide !== false ? 1 : 2)}
                onOpenSettings={() => setShowSettingsPin(true)}
              />
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step1"
              initial="initial" animate="in" exit="out"
              variants={pageVariants} transition={pageTransition}
              className="step-section active"
            >
              <Step1Guide 
                onNext={() => setStep(2)}
                onBack={() => setStep(0)}
              />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial="initial" animate="in" exit="out"
              variants={pageVariants} transition={pageTransition}
              className="step-section active"
            >
              <Step2Camera
                capturedPhotos={capturedPhotos}
                setCapturedPhotos={setCapturedPhotos}
                onNext={() => setStep(3)}
                settings={settings}
                onBack={() => setStep(0)}
              />
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial="initial" animate="in" exit="out"
              variants={pageVariants} transition={pageTransition}
              className="step-section active"
            >
              <StepPhotoSelect
                photos={capturedPhotos}
                initialPhotos={selectedPhotos}
                onNext={(photos) => {
                  setSelectedPhotos(photos);
                  setStep(4);
                }}
                onBack={() => {
                  setCapturedPhotos(Array(settings.shots).fill(null));
                  setSelectedPhotos([]);
                  setStep(2);
                }}
              />
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial="initial" animate="in" exit="out"
              variants={pageVariants} transition={pageTransition}
              className="step-section active"
            >
              <StepFrameSelect
                photos={selectedPhotos}
                selectedFrame={selectedFrame}
                selectedFilter={selectedFilter}
                onSelect={setSelectedFrame}
                onSelectFilter={setSelectedFilter}
                onNext={() => setStep(5)}
                onBack={() => setStep(3)}
              />
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              key="step5"
              initial="initial" animate="in" exit="out"
              variants={pageVariants} transition={pageTransition}
              className="step-section active"
            >
              <Step3Preview 
                photos={selectedPhotos}
                frameId={selectedFrame}
                filterId={selectedFilter}
                onRetake={() => {
                  setCapturedPhotos(Array(settings.shots).fill(null));
                  setSelectedPhotos([]);
                  setStep(2);
                }}
                onShowQr={(data) => {
                  setQrData(data);
                }}
                onNewSession={resetAll}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {qrData && (
        <Step4QR
          qrData={qrData}
          onClose={() => setQrData(null)}
          onNewSession={resetAll}
        />
      )}
      </div>
    </ThemeProvider>
  );
}
