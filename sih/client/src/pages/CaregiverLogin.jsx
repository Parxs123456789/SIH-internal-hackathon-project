import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import AuthLayout from '../components/AuthLayout';

export default function CaregiverLogin() {
  const { t } = useTranslation();
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
    password: ''
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
        await api.registerCaregiver(loginEmail, loginPassword, {
          name: formData.name,
          age: formData.age,
          gender: formData.gender,
          contact: formData.contact
        });
        
        setError('Account created successfully. Please log in.');
        setIsSignup(false);
      } else {
        const res = await api.loginCaregiver(loginEmail, loginPassword);
        if (res?.success) {
          api.setToken(res.token);
          api.setCurrentUser(res.user);
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoCaregiver = () => {
    handleSubmit(null, { email: 'caregiver@cognicare.ner', password: 'password123' });
  };

  return (
    <AuthLayout heading={isSignup ? "Fill in the details to sign up" : "Sign in to Caregiver Portal"}>
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
            onClick={handleDemoCaregiver}
            type="button"
            className="auth-toggle-btn"
            style={{ color: '#0d9488', fontSize: '0.95rem' }}
          >
            Use Demo Caregiver Account
          </button>
        </div>
      )}
    </AuthLayout>
  );
}
