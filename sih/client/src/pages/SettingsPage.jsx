import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Volume2, Globe, Bell, RotateCcw, Shield, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './SettingsPage.css';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [highContrast, setHighContrast] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    i18n.changeLanguage(lang);
    localStorage.setItem('cognicare_lang', lang);
  };

  const handleResetProfileData = () => {
    const defaultData = {
      name: 'Saarth Jain',
      age: 63,
      gender: 'Male',
      contact: '8539594776',
      avatarUrl: '',
      streak: 4,
      weeklyGoal: {
        current: 12,
        target: 15,
      },
      todayGoal: {
        current: 2,
        target: 5,
      },
    };
    localStorage.setItem('smriti_user_profile', JSON.stringify(defaultData));
    setResetSuccess(true);
    setTimeout(() => {
      setResetSuccess(false);
      navigate('/profile');
    }, 1000);
  };

  return (
    <div className="smriti-settings-page">
      <div className="smriti-settings-container">
        {/* Top Header */}
        <div className="smriti-settings-header">
          <button
            type="button"
            className="smriti-settings-back-btn"
            onClick={() => navigate('/profile')}
            aria-label="Back to Profile"
          >
            <ArrowLeft size={22} />
          </button>
          <h1 className="smriti-settings-title">App Settings</h1>
          <div style={{ width: 46 }} />
        </div>

        {/* Section 1: Language & Voice */}
        <div className="smriti-settings-card">
          <h2 className="smriti-settings-card-title">
            <Globe size={18} />
            <span>Language & Audio</span>
          </h2>

          <div className="smriti-settings-row">
            <div className="smriti-settings-label">
              <span>Display Language</span>
              <span className="smriti-settings-desc">Interface text language</span>
            </div>
            <select
              className="smriti-settings-select"
              value={i18n.language || 'en'}
              onChange={handleLanguageChange}
            >
              <option value="en">English</option>
              <option value="as">অসমীয়া (Assamese)</option>
            </select>
          </div>

          <div className="smriti-settings-row">
            <div className="smriti-settings-label">
              <span>Voice Prompt Sound</span>
              <span className="smriti-settings-desc">Read out loud game tips</span>
            </div>
            <input
              type="checkbox"
              className="smriti-settings-toggle"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
            />
          </div>
        </div>

        {/* Section 2: Notifications & Reminders */}
        <div className="smriti-settings-card">
          <h2 className="smriti-settings-card-title">
            <Bell size={18} />
            <span>Reminders & Nudges</span>
          </h2>

          <div className="smriti-settings-row">
            <div className="smriti-settings-label">
              <span>Daily Routine Alerts</span>
              <span className="smriti-settings-desc">Timely medicine and activity chimes</span>
            </div>
            <input
              type="checkbox"
              className="smriti-settings-toggle"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
            />
          </div>

          <div className="smriti-settings-row">
            <div className="smriti-settings-label">
              <span>High Contrast Theme</span>
              <span className="smriti-settings-desc">Enhances text & outline borders</span>
            </div>
            <input
              type="checkbox"
              className="smriti-settings-toggle"
              checked={highContrast}
              onChange={(e) => setHighContrast(e.target.checked)}
            />
          </div>
        </div>

        {/* Section 3: Profile Reset */}
        <div className="smriti-settings-card">
          <h2 className="smriti-settings-card-title">
            <RotateCcw size={18} />
            <span>Profile Data</span>
          </h2>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#555' }}>
            Restore profile details back to the default screenshot baseline (Saarth Jain, 4 Days Streak, 12/15 Weekly Goal).
          </p>
          <button
            type="button"
            className="smriti-settings-action-btn"
            style={{
              backgroundColor: resetSuccess ? '#DCFCE7' : '#EFB84A',
              color: resetSuccess ? '#166534' : '#111111',
            }}
            onClick={handleResetProfileData}
          >
            {resetSuccess ? (
              <>
                <Check size={18} />
                <span>Restored! Redirecting...</span>
              </>
            ) : (
              <>
                <RotateCcw size={18} />
                <span>Reset Profile to Saarth Jain</span>
              </>
            )}
          </button>
        </div>

        {/* Footer info */}
        <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#777', padding: '12px' }}>
          <p style={{ margin: 0, fontWeight: 700 }}>CogniCare SMRITI v1.0.0 (NER Edition)</p>
          <p style={{ margin: '4px 0 0 0' }}>100% Offline-First Cognitive Support</p>
        </div>
      </div>
    </div>
  );
}
