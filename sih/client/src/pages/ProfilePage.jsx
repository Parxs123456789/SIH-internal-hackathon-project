import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, ShieldCheck, Heart, Globe, LogOut, CheckCircle, Database } from 'lucide-react';
import { api } from '../services/api';

export default function ProfilePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const currentUser = api.getCurrentUser() || {
    name: 'John Sharma',
    role: 'patient',
    age: 72,
    patientId: 'patient-ner-01',
    preferredLanguage: 'en',
  };

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    i18n.changeLanguage(lang);
    localStorage.setItem('cognicare_lang', lang);
  };

  const handleLogout = () => {
    api.setToken(null);
    api.setCurrentUser(null);
    navigate('/');
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px 16px 80px' }}>
      {/* Header Profile Card */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1.5px solid #EADBCC',
          borderRadius: '32px',
          padding: '32px 24px',
          textAlign: 'center',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.04)',
          marginBottom: '24px',
        }}
      >
        <div
          style={{
            width: '84px',
            height: '84px',
            borderRadius: '50%',
            backgroundColor: '#FAF4EB',
            border: '3px solid #3F9C93',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '40px',
            margin: '0 auto 16px auto',
          }}
        >
          👴
        </div>

        <h1
          style={{
            fontFamily: "'Fredoka', sans-serif",
            fontSize: '1.85rem',
            fontWeight: 700,
            color: '#111111',
            margin: '0 0 4px 0',
          }}
        >
          {currentUser.name}
        </h1>
        <p style={{ color: '#666', fontSize: '0.95rem', margin: '0 0 16px 0' }}>
          Age: {currentUser.age || 72} • North Eastern Region Care Program
        </p>

        <span
          style={{
            backgroundColor: '#EBF7F5',
            color: '#236B64',
            border: '1.5px solid #3F9C93',
            padding: '6px 16px',
            borderRadius: '9999px',
            fontSize: '0.85rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <ShieldCheck size={16} />
          <span>Active Patient Account</span>
        </span>
      </div>

      {/* Settings & Info Section */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1.5px solid #EADBCC',
          borderRadius: '28px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.03)',
          marginBottom: '24px',
        }}
      >
        <h3
          style={{
            fontFamily: "'Fredoka', sans-serif",
            fontSize: '1.25rem',
            fontWeight: 700,
            color: '#111111',
            margin: 0,
          }}
        >
          ⚙️ Care Preferences
        </h3>

        {/* Language Selection */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Globe size={20} color="#3F9C93" />
            <span style={{ fontWeight: 600, color: '#333' }}>Spoken &amp; UI Language</span>
          </div>
          <select
            value={i18n.language}
            onChange={handleLanguageChange}
            style={{
              padding: '8px 14px',
              borderRadius: '12px',
              border: '1.5px solid #D6CAB9',
              backgroundColor: '#FAF4EB',
              fontWeight: 700,
              fontSize: '0.9rem',
              color: '#111111',
              cursor: 'pointer',
            }}
          >
            <option value="en">English</option>
            <option value="as">অসমীয়া (Assamese)</option>
          </select>
        </div>

        {/* Offline Storage Info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Database size={20} color="#3F9C93" />
            <div>
              <span style={{ fontWeight: 600, color: '#333', display: 'block' }}>Offline Data Sync</span>
              <span style={{ fontSize: '0.8rem', color: '#888' }}>IndexedDB + Background Service Worker</span>
            </div>
          </div>
          <span style={{ color: '#16A34A', fontWeight: 700, fontSize: '0.85rem' }}>✓ Active</span>
        </div>
      </div>

      {/* Logout / Switch Account */}
      <button
        onClick={handleLogout}
        style={{
          width: '100%',
          backgroundColor: '#FEE2E2',
          color: '#DC2626',
          border: '1.5px solid #FCA5A5',
          borderRadius: '18px',
          padding: '14px',
          fontSize: '1rem',
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'background-color 0.15s ease',
        }}
      >
        <LogOut size={18} />
        <span>Log Out / Switch Patient</span>
      </button>
    </div>
  );
}
