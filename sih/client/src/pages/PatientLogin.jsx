import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { ttsService } from '../services/ttsService';
import AuthLayout from '../components/AuthLayout';

export default function PatientLogin() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    contact: '',
    email: '',
    password: '',
    caregiverEmail: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e, demoCreds = null) => {
    if (e) e.preventDefault();
    
    const loginEmail = demoCreds ? demoCreds.email : formData.email;
    const loginPassword = demoCreds ? demoCreds.password : formData.password;

    if (!loginEmail || !loginPassword) {
      setError('Please provide email and password');
      return;
    }

    if (isSignup && !agreeTerms) {
      setError('You must agree to the terms and conditions.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isSignup) {
        if (!formData.caregiverEmail) {
          setError("Please provide your caregiver's email to link your account");
          setLoading(false);
          return;
        }
        
        await api.registerPatient(loginEmail, loginPassword, formData.caregiverEmail, {
          name: formData.name,
          age: formData.age,
          gender: formData.gender,
          contact: formData.contact
        });
        
        setError('Account created successfully. Please log in.');
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
    handleSubmit(null, { email: 'elder@cognicare.ner', password: 'password123' });
  };

  return (
    <AuthLayout heading={isSignup ? "Fill in the details to sign up" : "Sign in to Elder Portal"}>
      {error && <div className="auth-error-msg">{error}</div>}

      <form className="auth-form" onSubmit={handleSubmit}>
        
        {isSignup && (
          <>
            <div className="auth-field-container">
              <label className="auth-field-label">Name:</label>
              <div className="auth-input-wrapper">
                <input type="text" name="name" className="auth-input" required={isSignup} value={formData.name} onChange={handleChange} />
              </div>
            </div>

            <div className="auth-field-container">
              <label className="auth-field-label">Age:</label>
              <div className="auth-input-wrapper">
                <input type="number" name="age" className="auth-input" required={isSignup} value={formData.age} onChange={handleChange} />
              </div>
            </div>

            <div className="auth-field-container">
              <label className="auth-field-label">Gender:</label>
              <div className="auth-input-wrapper">
                <select name="gender" className="auth-input" value={formData.gender} onChange={handleChange}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="auth-field-container">
              <label className="auth-field-label">Contact number:</label>
              <div className="auth-input-wrapper">
                <input type="tel" name="contact" className="auth-input" required={isSignup} value={formData.contact} onChange={handleChange} />
              </div>
            </div>
            
            <div className="auth-field-container">
              <label className="auth-field-label">Caregiver E-mail id:</label>
              <div className="auth-input-wrapper">
                <input type="email" name="caregiverEmail" className="auth-input" required={isSignup} value={formData.caregiverEmail} onChange={handleChange} />
              </div>
            </div>
          </>
        )}

        <div className="auth-field-container">
          <label className="auth-field-label">E-mail id:</label>
          <div className="auth-input-wrapper">
            <input type="email" name="email" className="auth-input" required value={formData.email} onChange={handleChange} />
          </div>
        </div>

        <div className="auth-field-container">
          <label className="auth-field-label">Password:</label>
          <div className="auth-input-wrapper">
            <input type="password" name="password" className="auth-input" required minLength={6} value={formData.password} onChange={handleChange} />
          </div>
        </div>

        {isSignup && (
          <div className="auth-checkbox-row">
            <input 
              type="checkbox" 
              id="terms" 
              className="auth-checkbox" 
              checked={agreeTerms} 
              onChange={(e) => setAgreeTerms(e.target.checked)} 
            />
            <label htmlFor="terms" className="auth-checkbox-label">
              I agree to the terms and<br/>conditions of the company
            </label>
          </div>
        )}

        <button type="submit" className="auth-submit-btn" disabled={loading || (isSignup && !agreeTerms)}>
          {loading ? 'PROCESSING...' : 'SUBMIT'}
        </button>
      </form>

      <div className="auth-toggle-text">
        <button type="button" className="auth-toggle-btn" onClick={() => { setIsSignup(!isSignup); setError(''); }}>
          {isSignup ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
        </button>
      </div>
      
      {!isSignup && (
        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <button
            onClick={handleDemoPatient}
            type="button"
            className="auth-toggle-btn"
            style={{ color: '#15803d', fontSize: '0.95rem' }}
          >
            Use Demo Elder Account
          </button>
        </div>
      )}
    </AuthLayout>
  );
}
