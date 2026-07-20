import React from 'react';

export default function Header({ currentStep }) {
  return (
    <header className="header">
      <div className="logo">
        <span className="logo-icon">📸</span>
        <span>네컷사진 부스</span>
      </div>
      <div className="step-indicator">
        {[1, 2, 3, 4].map((step, i) => (
          <React.Fragment key={step}>
            <div
              className={`step-dot ${currentStep === step ? 'active' : ''} ${
                currentStep > step ? 'completed' : ''
              }`}
              data-step={step}
            ></div>
            {i < 3 && (
              <div
                className={`step-line ${currentStep > step ? 'completed' : ''}`}
              ></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </header>
  );
}
