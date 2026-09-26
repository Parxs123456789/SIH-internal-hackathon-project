import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Smile, ArrowRight, HeartHandshake } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';

export default function AuthLandingPage() {
  const navigate = useNavigate();

  return (
    <AuthLayout heading="How would you like to sign in?">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', marginTop: '16px' }}>
        
        {/* Elder Card */}
        <div 
          onClick={() => navigate('/patient-login')}
          style={{
            backgroundColor: '#E8792E',
            border: '2px solid #000000',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            cursor: 'pointer',
            transition: 'transform 0.1s'
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'none'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
        >
          <div style={{ backgroundColor: '#fff', borderRadius: '50%', padding: '8px', border: '2px solid #000' }}>
            <Smile size={24} color="#000" />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#000' }}>Elder Login</h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(0,0,0,0.8)', fontWeight: 500 }}>Access reminders and routines</p>
          </div>
          <ArrowRight size={20} color="#000" />
        </div>

        {/* Caregiver Card */}
        <div 
          onClick={() => navigate('/caregiver-login')}
          style={{
            backgroundColor: '#1C2B6B',
            border: '2px solid #000000',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            cursor: 'pointer',
            transition: 'transform 0.1s'
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'none'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
        >
          <div style={{ backgroundColor: '#fff', borderRadius: '50%', padding: '8px', border: '2px solid #000' }}>
            <HeartHandshake size={24} color="#000" />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>Caregiver Login</h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>Manage care plans and goals</p>
          </div>
          <ArrowRight size={20} color="#fff" />
        </div>

      </div>
    </AuthLayout>
  );
}
