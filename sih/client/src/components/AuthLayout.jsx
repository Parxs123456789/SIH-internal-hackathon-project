import React from 'react';
import '../styles/auth-theme.css';

export default function AuthLayout({ children, heading }) {
  return (
    <div className="auth-page-container">
      <div className="auth-card">
        
        {/* SMRITI Logo Block */}
        <div className="auth-logo-box">
          <img src="/logo.png" alt="SMRITI - Elder Care & Support logo" className="auth-logo-icon" style={{ objectFit: 'contain' }} />
          <h2 className="auth-logo-text">SMRITI</h2>
        </div>

        {heading && <h1 className="auth-heading">{heading}</h1>}

        {children}

      </div>
    </div>
  );
}
