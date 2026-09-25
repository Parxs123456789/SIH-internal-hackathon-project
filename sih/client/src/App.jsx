import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import ReminderAlertModal from './components/ReminderAlertModal';
import Home from './pages/Home';
import GamesHub from './pages/GamesHub';
import RemindersPage from './pages/RemindersPage';
import CaregiverDashboard from './pages/CaregiverDashboard';
import PatientLogin from './pages/PatientLogin';
import CaregiverLogin from './pages/CaregiverLogin';
import { syncManager } from './db/syncManager';
import { notificationService } from './services/notificationService';

import RememberAndMatchPage from './pages/RememberAndMatchPage';
import PatternAndSequencePage from './pages/PatternAndSequencePage';
import MemoryMatchPage from './pages/MemoryMatchPage';
import SequenceRecallPage from './pages/SequenceRecallPage';
import RoutineRecallGame from './pages/RoutineRecallGame';
import RoutineRecallPage from './pages/RoutineRecallPage';
import QuickDialPage from './pages/QuickDialPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import BottomNav from './components/BottomNav';

function AppContent({ isSimpleMode }) {
  const location = useLocation();
  const isProfileOrSettings = location.pathname === '/profile' || location.pathname === '/settings';

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: isProfileOrSettings ? '#FDF6EC' : undefined,
      }}
    >
      {/* Pop-up Reminder Alert Modal when an activity or medicine is due */}
      <ReminderAlertModal />

      {/* Main Content Area */}
      <main style={{ flex: 1, paddingBottom: isProfileOrSettings ? '0px' : '90px' }}>
        <Routes>
          <Route path="/" element={<Home isSimpleMode={isSimpleMode} />} />
          <Route path="/routine" element={<RoutineRecallPage />} />
          <Route path="/games" element={<GamesHub />} />
          <Route path="/games/memory-match" element={<MemoryMatchPage />} />
          <Route path="/games/routine-recall" element={<RoutineRecallGame />} />
          <Route path="/routine-recall" element={<RoutineRecallPage />} />
          <Route path="/daily-routine-recall" element={<RoutineRecallGame />} />
          <Route path="/memory-game" element={<RememberAndMatchPage />} />
          <Route path="/remember-match" element={<RememberAndMatchPage />} />
          <Route path="/pattern-sequence" element={<PatternAndSequencePage />} />
          <Route path="/puzzle-sequence" element={<PatternAndSequencePage />} />
          <Route path="/memory-match" element={<MemoryMatchPage />} />
          <Route path="/sequence-recall" element={<SequenceRecallPage />} />
          <Route path="/quick-dial" element={<QuickDialPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/reminders" element={<RemindersPage />} />
          <Route path="/dashboard" element={<CaregiverDashboard />} />
          <Route path="/patient-login" element={<PatientLogin />} />
          <Route path="/caregiver-login" element={<CaregiverLogin />} />
        </Routes>
      </main>

      {/* Global SMRITI Bottom Navigation Bar */}
      <BottomNav />

      {/* Regional footer - only show on desktop/dashboard views, not dedicated mobile pages */}
      {!isProfileOrSettings && (
        <footer
          style={{
            borderTop: '2px solid #e2e8f0',
            backgroundColor: '#ffffff',
            padding: '24px 20px',
            textAlign: 'center',
            fontSize: '0.95rem',
            color: '#64748b',
          }}
        >
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <p style={{ fontWeight: 700, color: '#334155' }}>
              CogniCare NER — AI-Adaptive Cognitive Platform for Dementia & MCI Elderly Care
            </p>
            <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>
              Built for North Eastern Region (Assam, Meghalaya, Manipur, Mizoram, Nagaland, Tripura, Arunachal Pradesh, Sikkim) • 100% Offline-First
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}

export default function App() {
  const [isSimpleMode, setIsSimpleMode] = useState(() => {
    return localStorage.getItem('cognicare_simple_mode') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('cognicare_simple_mode', isSimpleMode);
  }, [isSimpleMode]);

  useEffect(() => {
    // 1. Initialize background sync manager
    syncManager.init();

    // 2. Initialize offline reminder notifications scheduler
    notificationService.requestPermission();
    notificationService.startReminderScheduler();

    return () => {
      notificationService.stopReminderScheduler();
    };
  }, []);

  return (
    <BrowserRouter>
      <AppContent isSimpleMode={isSimpleMode} />
    </BrowserRouter>
  );
}
