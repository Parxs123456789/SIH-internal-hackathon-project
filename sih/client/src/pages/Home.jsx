import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mic, Bell, ChevronRight, X, Sparkles, Check, Clock } from 'lucide-react';
import { GAMES_LIST } from '../config/navigationConfig';
import { api } from '../services/api';
import { ttsService } from '../services/ttsService';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const currentUser = api.getCurrentUser();
  const userName = currentUser?.name ? currentUser.name.split(' ')[0].toUpperCase() : 'JOHN';

  // Notification panel toggle
  const [showNotifications, setShowNotifications] = useState(false);

  // Voice assistant state
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceStatus, setVoiceStatus] = useState('');
  const recognitionRef = useRef(null);

  // Notifications stub list
  const notifications = [
    { id: 1, title: 'Morning Blood Pressure Medicine', time: '8:00 AM', status: 'Taken' },
    { id: 2, title: 'Daily Routine Sequence Check', time: '10:30 AM', status: 'Due now' },
    { id: 3, title: 'Afternoon Hydration Water Nudge', time: '1:00 PM', status: 'Upcoming' },
  ];

  // Initialize SpeechRecognition on mount if supported
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceStatus('Listening... Speak a command');
      };

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((res) => res[0].transcript)
          .join('')
          .toLowerCase();

        setVoiceTranscript(transcript);

        // Voice Command Routing Logic
        if (transcript.includes('memory')) {
          ttsService.speak('Opening Memory Match Game', 'en');
          setTimeout(() => navigate('/memory-match'), 800);
        } else if (transcript.includes('sequence recall') || transcript.includes('simon')) {
          ttsService.speak('Opening Sequence Recall Game', 'en');
          setTimeout(() => navigate('/sequence-recall'), 800);
        } else if (transcript.includes('puzzle') || transcript.includes('pattern')) {
          ttsService.speak('Opening Puzzle and Sequence', 'en');
          setTimeout(() => navigate('/pattern-sequence'), 800);
        } else if (transcript.includes('remember')) {
          ttsService.speak('Opening Remember and Match', 'en');
          setTimeout(() => navigate('/memory-game'), 800);
        } else if (transcript.includes('routine')) {
          ttsService.speak('Opening Daily Routine Recall', 'en');
          setTimeout(() => navigate('/routine'), 800);
        } else if (transcript.includes('call') || transcript.includes('dial') || transcript.includes('help')) {
          ttsService.speak('Opening Quick Dial', 'en');
          setTimeout(() => navigate('/quick-dial'), 800);
        } else if (transcript.includes('profile')) {
          ttsService.speak('Opening User Profile', 'en');
          setTimeout(() => navigate('/profile'), 800);
        }
      };

      recognition.onerror = (e) => {
        console.warn('Speech recognition error:', e.error);
        setIsListening(false);
        setVoiceStatus('Could not detect voice. Tap mic to retry.');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [navigate]);

  /**
   * Toggles the voice assistant listening state
   */
  const handleToggleVoice = () => {
    if (!recognitionRef.current) {
      // Fallback if browser doesn't support Web Speech API
      setVoiceStatus('Voice simulated: Say "play memory" or "open routine"');
      ttsService.speak(`Hello ${userName}, how can I help you today?`, 'en');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setVoiceStatus('');
    } else {
      setVoiceTranscript('');
      try {
        recognitionRef.current.start();
      } catch (e) {
        recognitionRef.current.stop();
        setTimeout(() => recognitionRef.current.start(), 200);
      }
    }
  };

  return (
    <div className="smriti-wrapper">
      <div className="smriti-container">
        {/* Top Header Row */}
        <header className="smriti-header">
          {/* Left: App Logo & SMRITI Title */}
          <div className="smriti-brand-group">
            <img src="/logo.png" alt="SMRITI - Elder Care & Support logo" style={{ height: '48px', width: 'auto', objectFit: 'contain' }} />
          </div>

          {/* Center: Dynamic Greeting */}
          <div className="smriti-greeting">
            HELLO {userName}!
          </div>

          {/* Right: Notification Button */}
          <button
            className="smriti-notif-group"
            onClick={() => setShowNotifications((prev) => !prev)}
            aria-label="Toggle notifications"
            aria-expanded={showNotifications}
          >
            <div className="smriti-notif-btn">
              <Bell size={20} strokeWidth={2.2} />
              <span className="smriti-notif-badge" />
            </div>
            <span className="smriti-notif-label">notification</span>
          </button>
        </header>

        {/* Notification Panel Dropdown */}
        {showNotifications && (
          <div className="smriti-notif-dropdown" role="dialog" aria-label="Notifications panel">
            <div className="smriti-notif-header">
              <span style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: '14px', color: '#111' }}>
                🔔 Notifications &amp; Reminders
              </span>
              <button
                onClick={() => setShowNotifications(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: '#777' }}
              >
                <X size={16} />
              </button>
            </div>
            {notifications.map((n) => (
              <div key={n.id} className="smriti-notif-item">
                <Clock size={16} color="#3F9C93" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 700, color: '#222' }}>{n.title}</div>
                  <div style={{ fontSize: '11px', color: '#666' }}>
                    {n.time} • <strong style={{ color: n.status === 'Taken' ? '#16A34A' : '#EA580C' }}>{n.status}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Central Voice Assistant Trigger */}
        <section className="smriti-voice-section">
          <button
            className={`smriti-voice-btn ${isListening ? 'listening' : ''}`}
            onClick={handleToggleVoice}
            aria-label="Voice Assistant. Tap to speak commands."
            title="Tap to speak"
          >
            <Mic size={38} color="#000000" strokeWidth={2.4} />
          </button>

          {/* Voice Feedback Text */}
          {voiceStatus && (
            <div className="smriti-voice-status">
              {voiceStatus}
            </div>
          )}

          {voiceTranscript && (
            <div className="smriti-voice-bubble">
              “{voiceTranscript}”
            </div>
          )}
        </section>

        {/* "Play Games" Section (GAMES ONLY - Routine Recall excluded) */}
        <section className="smriti-games-section">
          <h2 className="smriti-games-title">
            Play Games
          </h2>

          <div className="smriti-games-panel" role="region" aria-label="Games list">
            {GAMES_LIST.map((game) => (
              <Link
                key={game.id}
                to={game.path}
                className="smriti-game-card"
                aria-label={`Play ${game.label}`}
              >
                <div className="smriti-game-content">
                  <div
                    className="smriti-game-icon-badge"
                    style={{ backgroundColor: game.iconBg }}
                  >
                    <span>{game.icon}</span>
                  </div>
                  <span className="smriti-game-label">{game.label}</span>
                </div>
                <ChevronRight className="smriti-game-chevron" size={20} />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
