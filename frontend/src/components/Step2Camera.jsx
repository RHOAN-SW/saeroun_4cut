import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Step2Camera({ onNext, capturedPhotos, setCapturedPhotos, settings, onBack }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const mountedRef = useRef(true);
  
  const currentSlot = capturedPhotos.findIndex(p => p === null);
  const isAllCaptured = currentSlot === -1;

  useEffect(() => {
    mountedRef.current = true;
    let activeStream = null;
    let isMounted = true;
    navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 }, aspectRatio: { ideal: 4/3 } },
      audio: false
    })
    .then(mediaStream => {
      if (!isMounted) {
        mediaStream.getTracks().forEach(t => t.stop());
        return;
      }
      activeStream = mediaStream;
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(() => {});
      }
    })
    .catch(err => {
      console.error('Camera error', err);
      if (isMounted) setCameraError('카메라를 사용할 수 없어요. Safari 설정에서 카메라 권한을 허용해주세요.');
    });

    return () => {
      isMounted = false;
      mountedRef.current = false;
      if (activeStream) {
        activeStream.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const captureStateRef = useRef({ isCapturing, isAllCaptured });
  useEffect(() => {
    captureStateRef.current = { isCapturing, isAllCaptured };
  }, [isCapturing, isAllCaptured]);

  const timerRef = useRef(0);

  const captureOneShot = async () => {
    if (captureStateRef.current.isCapturing || captureStateRef.current.isAllCaptured) return;
    
    setIsCapturing(true);
    timerRef.current = settings.timer || 6;

    while (timerRef.current > 0 && mountedRef.current) {
      setCountdown(timerRef.current);
      await new Promise(r => setTimeout(r, 1000));
      timerRef.current--;
    }
    if (!mountedRef.current) return;
    
    setCountdown(null);
    setIsFlashing(true);
    
    setTimeout(() => setIsFlashing(false), 300);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const ctx = canvas.getContext('2d');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 960;

      ctx.save();
      if (settings.mirror) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      
      if (settings.filter) {
        ctx.filter = 'contrast(1.1) brightness(1.1)';
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.restore();

      const imageData = canvas.toDataURL('image/jpeg', 0.92);
      
      setCapturedPhotos(prev => {
        const next = [...prev];
        const slot = next.findIndex(p => p === null);
        if (slot !== -1) {
          next[slot] = imageData;
        }
        return next;
      });
    }

    // Small delay before allowing next capture to prevent overlapping state issues
    setTimeout(() => {
      setIsCapturing(false);
    }, 500);
  };

  useEffect(() => {
    if (stream && !isCapturing && !isAllCaptured) {
      const tid = setTimeout(() => {
        captureOneShot();
      }, 1500);
      return () => clearTimeout(tid);
    }
  }, [stream, isCapturing, isAllCaptured]);

  useEffect(() => {
    if (isAllCaptured) {
      const tid = setTimeout(() => {
        onNext();
      }, 1500);
      return () => clearTimeout(tid);
    }
  }, [isAllCaptured, onNext]);

  const handleRetake = (index) => {
    if (isCapturing) return;
    const newPhotos = [...capturedPhotos];
    newPhotos[index] = null;
    setCapturedPhotos(newPhotos);
  };

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000', display: 'flex', flexDirection: 'column' }}>
      
      {/* Topbar Absolute Overlay */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '20px', display: 'flex', justifyContent: 'flex-start', zIndex: 100 }}>
        <button 
          onClick={onBack} 
          disabled={isCapturing}
          style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '44px', height: '44px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
      </div>

      <AnimatePresence>
        {countdown !== null && (
          <motion.div
            key={countdown}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              top: '25px',
              color: '#fff',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textShadow: '0 2px 10px rgba(0,0,0,0.5)',
              pointerEvents: 'none',
              zIndex: 100,
            }}
          >
            <span style={{ fontSize: '18px', fontWeight: '500', marginBottom: '4px' }}>남은 시간</span>
            <span style={{ fontSize: '64px', fontWeight: 'bold', lineHeight: 1 }}>{countdown}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Camera Area */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        {cameraError && (
          <div className="camera-error" role="alert">
            <strong>카메라 권한이 필요해요</strong>
            <span>{cameraError}</span>
          </div>
        )}
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          style={{ 
            maxWidth: '100%', 
            maxHeight: '100%', 
            aspectRatio: '246 / 366',
            objectFit: 'cover', 
            transform: settings.mirror ? 'scaleX(-1)' : 'none',
            filter: settings.filter ? 'contrast(1.1) brightness(1.1)' : 'none'
          }}
        />

        {isFlashing && <div style={{ position: 'absolute', inset: 0, background: 'white', zIndex: 120 }}></div>}
        
        <button 
          className="capture-btn" 
          onClick={() => {
            if (isCapturing && timerRef.current > 2) {
              timerRef.current = 2;
              setCountdown(2);
            }
          }}
          disabled={isAllCaptured}
          aria-label="촬영 대기 시간을 2초로 줄이기"
          style={{ zIndex: 110, bottom: '140px' }} // Adjusted higher so it doesn't overlap thumbnails
        ></button>
      </div>

      {/* Thumbnails Overlay */}
      <div style={{ position: 'absolute', bottom: 30, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '12px', padding: '0 20px', zIndex: 100, overflowX: 'auto' }}>
        {capturedPhotos.map((photo, i) => (
          <div 
            key={i} 
            style={{
              width: '60px', height: '80px', flexShrink: 0,
              borderRadius: '8px', border: `2px solid ${i === currentSlot ? '#fff' : 'transparent'}`,
              overflow: 'hidden', position: 'relative', background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            {photo ? (
              <>
                <img src={photo} alt={`Shot ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div 
                  onClick={() => handleRetake(i)}
                  style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: 0 }}
                  onMouseEnter={(e) => { if(!isCapturing) e.currentTarget.style.opacity = 1; }}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
                >
                  재촬영
                </div>
              </>
            ) : (
              <span style={{ fontSize: '14px', color: '#fff', fontWeight: 'bold' }}>{i + 1}</span>
            )}
          </div>
        ))}
      </div>
      
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
