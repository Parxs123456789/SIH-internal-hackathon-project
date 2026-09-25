import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { KeyRound, Delete, ArrowRight, UserCheck } from 'lucide-react';
import VoiceSpeaker from '../components/VoiceSpeaker';
import { api } from '../services/api';
import { ttsService } from '../services/ttsService';

export default function PatientLogin() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [caregiverEmail, setCaregiverEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);

  const handleSubmit = async (e, demoCreds = null) => {
    if (e) e.preventDefault();
    const loginEmail = demoCreds ? demoCreds.email : email;
    const loginPassword = demoCreds ? demoCreds.password : password;

    if (!loginEmail || !loginPassword) {
      setError('Please provide email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isSignup) {
        if (!caregiverEmail) {
          setError('Please provide your caregiver\'s email to link your account');
          setLoading(false);
          return;
        }
        await api.registerPatient(loginEmail, loginPassword, caregiverEmail);
        setError('Account created successfully. Please check your email or log in.');
        setIsSignup(false);
      } else {
        const res = await api.loginPatient(loginEmail, loginPassword);
        if (res?.success) {
          api.setToken(res.token);
          api.setCurrentUser(res.user);

          const welcomeVoice =
            i18n.language === 'as'
              ? `নমস্কাৰ ${res.user.name}, কগনিকেন্দ্ৰলৈ স্বাগতম!`
              : `Welcome back, ${res.user.name}!`;
          ttsService.speak(welcomeVoice, i18n.language || 'as');

          navigate('/games');
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
      if (!isSignup) ttsService.speak('লগিন ভুল হৈছে, অনুগ্ৰহ কৰি আকৌ চেষ্টা কৰক', i18n.language || 'as');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoPatient = () => {
    setEmail('elder@cognicare.ner');
    setPassword('password123');
    handleSubmit(null, { email: 'elder@cognicare.ner', password: 'password123' });
  };

  return (
    <div style={{ maxWidth: '520px', margin: '40px auto', padding: '0 16px' }}>
      <div
        className="card"
        style={{
          border: '3px solid #0284c7',
          borderRadius: '32px',
          padding: '36px 28px',
          textAlign: 'center',
          boxShadow: '0 12px 32px rgba(2, 132, 199, 0.12)',
        }}
      >
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            backgroundColor: '#e0f2fe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
          }}
        >
          <KeyRound size={36} color="#0284c7" />
        </div>

        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
          {isSignup ? 'Elder Sign Up' : t('auth.patientLoginTitle')}
        </h1>

        <p style={{ fontSize: '1.15rem', color: '#64748b', marginBottom: '24px' }}>
          {isSignup ? 'Create a new elder account' : t('auth.patientLoginSubtitle')}
        </p>

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
          <div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email (e.g. elder@cognicare.ner)"
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '16px',
                border: '2px solid #cbd5e1',
                fontSize: '1.2rem',
              }}
            />
          </div>

          <div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '16px',
                border: '2px solid #cbd5e1',
                fontSize: '1.2rem',
              }}
            />
          </div>

          {isSignup && (
            <div>
              <input
                type="email"
                required={isSignup}
                value={caregiverEmail}
                onChange={(e) => setCaregiverEmail(e.target.value)}
                placeholder="Caregiver's Email"
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '16px',
                  border: '2px solid #cbd5e1',
                  fontSize: '1.2rem',
                }}
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              width: '100%',
              minHeight: '68px',
              fontSize: '1.35rem',
            }}
          >
            <span>{loading ? 'Processing...' : (isSignup ? 'Sign Up' : 'Login')}</span>
            <ArrowRight size={24} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button 
            type="button" 
            onClick={() => { setIsSignup(!isSignup); setError(''); }}
            style={{ background: 'none', border: 'none', color: '#0284c7', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' }}
          >
            {isSignup ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
          </button>
        </div>

        {/* One-Tap Demo Helper */}
        <div style={{ borderTop: '2px solid #f1f5f9', paddingTop: '20px' }}>
          <p style={{ fontSize: '0.95rem', color: '#64748b', fontWeight: 600, marginBottom: '10px' }}>
            {t('auth.demoAccounts')}
          </p>
          <button
            onClick={handleDemoPatient}
            type="button"
            style={{
              backgroundColor: '#f0fdf4',
              border: '2px dashed #16a34a',
              borderRadius: '14px',
              padding: '12px 18px',
              color: '#15803d',
              fontWeight: 700,
              fontSize: '1rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
            }}
          >
            <UserCheck size={20} />
            <span>{t('auth.useDemoPatient')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
