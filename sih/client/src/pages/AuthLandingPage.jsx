import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Smile, ArrowRight, HeartHandshake } from 'lucide-react';
import './AuthLandingPage.css';

export default function AuthLandingPage() {
  const navigate = useNavigate();

  const handleElderLogin = () => {
    // TODO: Implement Supabase Auth (e.g. signInWithPassword / signUp) for Elder profile fetching
    navigate('/patient-login');
  };

  const handleCaregiverLogin = () => {
    // TODO: Implement Supabase Auth (e.g. signInWithPassword / signUp) for Caretaker profile fetching
    navigate('/caregiver-login');
  };

  return (
    <div className="auth-landing-container">
      {/* Header */}
      <div className="auth-header">
        <div className="auth-logo">
          <Heart size={32} color="#FFFFFF" />
        </div>
        <h1 className="auth-title">Welcome to Smriti</h1>
        <p className="auth-subtitle">
          A simple, caring space for elders and the people who support them.
        </p>
      </div>

      {/* Illustration Area */}
      <div className="auth-illustration">
        {/* Placeholder for illustration */}
        <HeartHandshake size={80} color="#E8C39E" />
      </div>

      {/* Role Selection */}
      <h2 className="auth-section-label">How would you like to sign in?</h2>
      
      <div className="auth-cards-container">
        {/* Elder Card */}
        <div className="auth-role-card elder" onClick={handleElderLogin}>
          <div className="auth-card-icon elder">
            <Smile size={24} />
          </div>
          <div className="auth-card-content">
            <h3 className="auth-card-title">Login as Elder</h3>
            <p className="auth-card-subtext">Access reminders, routines and your care circle</p>
          </div>
          <div className="auth-card-action elder">
            <ArrowRight size={16} />
          </div>
        </div>

        {/* Caregiver Card */}
        <div className="auth-role-card caregiver" onClick={handleCaregiverLogin}>
          <div className="auth-card-icon caregiver">
            <HeartHandshake size={24} />
          </div>
          <div className="auth-card-content">
            <h3 className="auth-card-title">Login as Caretaker</h3>
            <p className="auth-card-subtext">Manage care plans, goals, and stay connected</p>
          </div>
          <div className="auth-card-action caregiver">
            <ArrowRight size={16} />
          </div>
        </div>
      </div>
    </div>
  );
}
