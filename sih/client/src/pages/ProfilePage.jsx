import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Menu, Settings, X, Edit3, Check, RotateCcw, Lock, Clock, LogOut } from 'lucide-react';
import { streakService, DAILY_PLAYTIME_GOAL_SECONDS } from '../services/streakService';
import { api } from '../services/api';
import './ProfilePage.css';

/**
 * Default initial profile state matching the screenshot exactly:
 * - Saarth Jain
 * - Age: 63
 * - Gender: Male
 * - Contact: 8539594776
 * - Streak: 4 Days
 * - Weekly Goal: 12/15
 * - Today's Goal: 2/5
 */
const DEFAULT_USER_DATA = {
  name: 'Saarth Jain',
  age: 63,
  gender: 'Male',
  contact: '8539594776',
  avatarUrl: '', // Fallback to default silhouette icon
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

// Formats seconds into MM:SS display
function formatPlaytime(totalSeconds = 0) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export default function ProfilePage() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (e) {
      console.error('Logout failed:', e);
    }
    navigate('/auth');
  };

  // ---------------------------------------------------------------------------
  // Single configurable user-data object/state
  // Drives all dynamic values across the Profile page
  // ---------------------------------------------------------------------------
  const [userData, setUserData] = useState(() => {
    try {
      const stored = localStorage.getItem('smriti_user_profile');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (err) {
      console.warn('Could not load profile from localStorage:', err);
    }
    return DEFAULT_USER_DATA;
  });

  // Daily playtime tracker state for streak upgrade requirement
  const [playtimeTracker, setPlaytimeTracker] = useState(() => streakService.getTrackerState());

  // Listen to streakService state & automatic streak upgrade events
  useEffect(() => {
    // 1. Subscribe to real-time playtime ticking
    const unsubscribe = streakService.subscribe((state) => {
      setPlaytimeTracker(state);
    });

    // 2. Listen to custom event fired when 5-min playtime goal is met and streak upgrades
    const handleStreakUpgraded = (e) => {
      try {
        const rawProfile = localStorage.getItem('smriti_user_profile');
        if (rawProfile) {
          const freshProfile = JSON.parse(rawProfile);
          setUserData(freshProfile);
        }
      } catch (err) {
        console.warn('Error reading updated profile:', err);
      }
    };

    window.addEventListener('smriti_streak_updated', handleStreakUpgraded);

    return () => {
      unsubscribe();
      window.removeEventListener('smriti_streak_updated', handleStreakUpgraded);
    };
  }, []);

  // Persist user-data state changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('smriti_user_profile', JSON.stringify(userData));
    } catch (err) {
      console.warn('Could not save profile to localStorage:', err);
    }
  }, [userData]);

  // Drawer / Side menu state (triggered by top-left hamburger button)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Edit modal state (for dynamic configurability)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState(userData);

  // Keep form data in sync when edit modal opens
  const handleOpenEdit = () => {
    setFormData({
      ...userData,
      // Streak is read-only and preserved from current state
      streak: userData.streak,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    // Enforce: Streak is strictly non-editable and cannot be overridden by form input
    const updated = {
      ...formData,
      streak: userData.streak, // Retain true automatic streak
    };
    setUserData(updated);
    setIsEditModalOpen(false);
  };

  const handleResetToDefault = () => {
    setUserData(DEFAULT_USER_DATA);
    setFormData(DEFAULT_USER_DATA);
    setIsEditModalOpen(false);
  };

  // Close drawer on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsDrawerOpen(false);
        setIsEditModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute progress bar percentage widths
  const weeklyPercent = userData.weeklyGoal?.target > 0
    ? Math.min(100, Math.max(0, Math.round((userData.weeklyGoal.current / userData.weeklyGoal.target) * 100)))
    : 0;

  const todayPercent = userData.todayGoal?.target > 0
    ? Math.min(100, Math.max(0, Math.round((userData.todayGoal.current / userData.todayGoal.target) * 100)))
    : 0;

  return (
    <div className="smriti-profile-page">
      <div className="smriti-profile-container">
        
        <header className="smriti-profile-top-row" style={{ justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="smriti-profile-square-btn"
            onClick={handleLogout}
            aria-label="Log Out"
            title="Log Out"
          >
            <LogOut size={24} strokeWidth={2.4} color="#ef4444" />
          </button>
        </header>

        {/* ==================================================================
            AVATAR: Large circle with black outline and fallback silhouette
            ================================================================== */}
        <section className="smriti-profile-avatar-wrap">
          <div className="smriti-profile-avatar-circle" title="User Avatar">
            {userData.avatarUrl ? (
              <img
                src={userData.avatarUrl}
                alt={userData.name}
                className="smriti-profile-avatar-img"
              />
            ) : (
              <div className="smriti-profile-avatar-silhouette">
                {/* Person-silhouette icon matching the screenshot */}
                <svg
                  viewBox="0 0 100 100"
                  width="78"
                  height="78"
                  fill="#111111"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="50" cy="35" r="19" />
                  <path d="M22 84 C22 65, 34 58, 50 58 C66 58, 78 65, 78 84 Z" />
                </svg>
              </div>
            )}
          </div>
        </section>

        {/* ==================================================================
            NAME PILL: Warm golden-yellow pill (#EFB84A) with bold black name
            ================================================================== */}
        <div className="smriti-profile-name-pill">
          <span className="smriti-profile-name-text">{userData.name}</span>
        </div>

        {/* ==================================================================
            INFO PILLS STACK: Taupe/gray pills (#C7C2B8)
            - Age: X
            - Gender: X
            - Contact: X
            ================================================================== */}
        <div className="smriti-profile-info-stack">
          <div className="smriti-profile-info-pill">
            <span className="smriti-profile-info-text">Age: {userData.age}</span>
          </div>

          <div className="smriti-profile-info-pill">
            <span className="smriti-profile-info-text">Gender: {userData.gender}</span>
          </div>

          <div className="smriti-profile-info-pill">
            <span className="smriti-profile-info-text">Contact: {userData.contact}</span>
          </div>
        </div>

        {/* ==================================================================
            STREAK ROW: Flame icon + X Days & daily playtime status
            ================================================================== */}
        <div className="smriti-profile-streak-row">
          <div className="smriti-profile-streak-main">
            <span className="smriti-profile-streak-icon" role="img" aria-label="streak flame">
              🔥
            </span>
            <span className="smriti-profile-streak-text">{userData.streak} Days</span>
          </div>

          {/* Daily 5-min playtime goal badge */}
          <div className="smriti-profile-streak-badge">
            {playtimeTracker.goalMetToday ? (
              <span className="smriti-streak-achieved-tag">
                ✅ Streak Upgraded (+1 Day)
              </span>
            ) : (
              <span
                className="smriti-streak-progress-tag"
                title="Play for 5 mins today to increase your streak!"
              >
                ⏱️ {formatPlaytime(playtimeTracker.playtimeSeconds)} / 5:00
              </span>
            )}
          </div>
        </div>

        {/* ==================================================================
            GOAL SECTIONS:
            - Weekly Goal: X/Y with proportional progress bar
            - Today's Goal: X/Y with proportional progress bar
            ================================================================== */}
        <div className="smriti-profile-goals-container">
          {/* Weekly Goal */}
          <div className="smriti-profile-goal-block">
            <div className="smriti-profile-goal-label">
              Weekly Goal: {userData.weeklyGoal.current}/{userData.weeklyGoal.target}
            </div>
            <div
              className="smriti-profile-progress-track"
              role="progressbar"
              aria-valuenow={userData.weeklyGoal.current}
              aria-valuemin={0}
              aria-valuemax={userData.weeklyGoal.target}
            >
              <div
                className="smriti-profile-progress-fill"
                style={{ width: `${weeklyPercent}%` }}
              />
            </div>
          </div>

          {/* Today's Goal */}
          <div className="smriti-profile-goal-block">
            <div className="smriti-profile-goal-label">
              Today's Goal: {userData.todayGoal.current}/{userData.todayGoal.target}
            </div>
            <div
              className="smriti-profile-progress-track"
              role="progressbar"
              aria-valuenow={userData.todayGoal.current}
              aria-valuemin={0}
              aria-valuemax={userData.todayGoal.target}
            >
              <div
                className="smriti-profile-progress-fill"
                style={{ width: `${todayPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action Button: Edit / Configure dynamic values */}
        <button
          type="button"
          className="smriti-profile-config-action"
          onClick={handleOpenEdit}
        >
          <Edit3 size={16} />
          <span>Edit Profile &amp; Goals</span>
        </button>

      </div>

      {/* ==================================================================
          SLIDE-OVER NAVIGATION DRAWER (triggered by hamburger icon)
          ================================================================== */}
      {isDrawerOpen && (
        <div
          className="smriti-drawer-backdrop"
          onClick={() => setIsDrawerOpen(false)}
        >
          <div
            className="smriti-drawer-panel"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation Menu"
          >
            {/* Drawer Header */}
            <div className="smriti-drawer-header">
              <div className="smriti-drawer-title-wrap">
                <img src="/logo.png" alt="SMRITI Logo" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                <h2 className="smriti-drawer-title">SMRITI Menu</h2>
              </div>
              <button
                type="button"
                className="smriti-drawer-close-btn"
                onClick={() => setIsDrawerOpen(false)}
                aria-label="Close Menu"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            {/* Quick Profile Summary in Drawer */}
            <div className="smriti-drawer-user-card">
              <div className="smriti-drawer-user-avatar">
                {userData.avatarUrl ? (
                  <img
                    src={userData.avatarUrl}
                    alt={userData.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span style={{ fontSize: '1.3rem' }}>👤</span>
                )}
              </div>
              <div className="smriti-drawer-user-info">
                <span className="smriti-drawer-user-name">{userData.name}</span>
                <span className="smriti-drawer-user-sub">🔥 {userData.streak} Days Active</span>
              </div>
            </div>

            {/* Navigation links */}
            <nav className="smriti-drawer-nav-list">
              <Link
                to="/"
                className="smriti-drawer-nav-item"
                onClick={() => setIsDrawerOpen(false)}
              >
                <span className="smriti-drawer-item-icon">🏠</span>
                <span>Home</span>
              </Link>

              <Link
                to="/routine"
                className="smriti-drawer-nav-item"
                onClick={() => setIsDrawerOpen(false)}
              >
                <span className="smriti-drawer-item-icon">📅</span>
                <span>Routine Recall</span>
              </Link>

              <Link
                to="/quick-dial"
                className="smriti-drawer-nav-item"
                onClick={() => setIsDrawerOpen(false)}
              >
                <span className="smriti-drawer-item-icon">📞</span>
                <span>Quick Dial</span>
              </Link>

              <Link
                to="/profile"
                className="smriti-drawer-nav-item active"
                onClick={() => setIsDrawerOpen(false)}
              >
                <span className="smriti-drawer-item-icon">👤</span>
                <span>Profile</span>
              </Link>

              <Link
                to="/games"
                className="smriti-drawer-nav-item"
                onClick={() => setIsDrawerOpen(false)}
              >
                <span className="smriti-drawer-item-icon">🎮</span>
                <span>Cognitive Games</span>
              </Link>

              <Link
                to="/reminders"
                className="smriti-drawer-nav-item"
                onClick={() => setIsDrawerOpen(false)}
              >
                <span className="smriti-drawer-item-icon">⏰</span>
                <span>Reminders</span>
              </Link>

              <Link
                to="/dashboard"
                className="smriti-drawer-nav-item"
                onClick={() => setIsDrawerOpen(false)}
              >
                <span className="smriti-drawer-item-icon">🩺</span>
                <span>Caregiver Portal</span>
              </Link>

              <Link
                to="/settings"
                className="smriti-drawer-nav-item"
                onClick={() => setIsDrawerOpen(false)}
              >
                <span className="smriti-drawer-item-icon">⚙️</span>
                <span>Settings</span>
              </Link>
            </nav>

            <div className="smriti-drawer-footer">
              CogniCare SMRITI • Offline-First
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================
          EDIT PROFILE MODAL (Configurability / Dynamic Values)
          STREAK IS EXCLUDED FROM MANUAL EDITING
          ================================================================== */}
      {isEditModalOpen && (
        <div
          className="smriti-modal-backdrop"
          onClick={() => setIsEditModalOpen(false)}
        >
          <div
            className="smriti-modal-dialog"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Edit Profile Details"
          >
            <div className="smriti-modal-header">
              <h3 className="smriti-modal-title">Configure Profile</h3>
              <button
                type="button"
                className="smriti-drawer-close-btn"
                onClick={() => setIsEditModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="smriti-modal-form">
              <div className="smriti-form-field">
                <label className="smriti-form-label">Full Name</label>
                <input
                  type="text"
                  className="smriti-form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="smriti-form-row">
                <div className="smriti-form-field" style={{ flex: 1 }}>
                  <label className="smriti-form-label">Age</label>
                  <input
                    type="number"
                    className="smriti-form-input"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                    min="1"
                    max="120"
                    required
                  />
                </div>

                <div className="smriti-form-field" style={{ flex: 1 }}>
                  <label className="smriti-form-label">Gender</label>
                  <select
                    className="smriti-form-input"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="smriti-form-field">
                <label className="smriti-form-label">Contact Number</label>
                <input
                  type="text"
                  className="smriti-form-input"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  required
                />
              </div>

              <div className="smriti-form-field">
                <label className="smriti-form-label">Avatar Photo URL (Optional)</label>
                <input
                  type="url"
                  className="smriti-form-input"
                  placeholder="Leave empty for silhouette icon"
                  value={formData.avatarUrl || ''}
                  onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                />
              </div>

              {/* NON-EDITABLE LOCKED STREAK FIELD */}
              <div className="smriti-form-field smriti-streak-locked-field">
                <div className="smriti-streak-locked-header">
                  <label className="smriti-form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🔥 Daily Streak</span>
                  </label>
                  <span className="smriti-streak-lock-badge">
                    <Lock size={12} /> Non-editable
                  </span>
                </div>

                <div className="smriti-streak-locked-box">
                  <div className="smriti-streak-locked-value">
                    <span>{userData.streak} Days</span>
                  </div>
                  <p className="smriti-streak-locked-desc">
                    Streaks cannot be manually edited. Your streak upgrades automatically upon logging in and playing for at least 5 minutes each day.
                  </p>

                  <div className="smriti-streak-min-progress">
                    <div className="smriti-streak-min-label">
                      <span>Today's active playtime:</span>
                      <strong>
                        {formatPlaytime(playtimeTracker.playtimeSeconds)} / 5:00
                        {playtimeTracker.goalMetToday ? ' (Earned ✅)' : ''}
                      </strong>
                    </div>

                    <div className="smriti-profile-progress-track" style={{ height: '8px' }}>
                      <div
                        className="smriti-profile-progress-fill"
                        style={{
                          width: `${Math.min(100, Math.round(((playtimeTracker.playtimeSeconds || 0) / DAILY_PLAYTIME_GOAL_SECONDS) * 100))}%`,
                        }}
                      />
                    </div>

                    {!playtimeTracker.goalMetToday && (
                      <button
                        type="button"
                        className="smriti-streak-simulate-btn"
                        onClick={() => streakService.simulatePlaytime(60)}
                        title="Add 1 minute of playtime to test streak upgrade"
                      >
                        ⚡ +1 Min Test Playtime
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="smriti-form-row">
                <div className="smriti-form-field" style={{ flex: 1 }}>
                  <label className="smriti-form-label">Weekly Done</label>
                  <input
                    type="number"
                    className="smriti-form-input"
                    value={formData.weeklyGoal?.current ?? 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        weeklyGoal: { ...formData.weeklyGoal, current: Number(e.target.value) },
                      })
                    }
                    min="0"
                  />
                </div>
                <div className="smriti-form-field" style={{ flex: 1 }}>
                  <label className="smriti-form-label">Weekly Target</label>
                  <input
                    type="number"
                    className="smriti-form-input"
                    value={formData.weeklyGoal?.target ?? 15}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        weeklyGoal: { ...formData.weeklyGoal, target: Number(e.target.value) },
                      })
                    }
                    min="1"
                  />
                </div>
              </div>

              <div className="smriti-form-row">
                <div className="smriti-form-field" style={{ flex: 1 }}>
                  <label className="smriti-form-label">Today Done</label>
                  <input
                    type="number"
                    className="smriti-form-input"
                    value={formData.todayGoal?.current ?? 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        todayGoal: { ...formData.todayGoal, current: Number(e.target.value) },
                      })
                    }
                    min="0"
                  />
                </div>
                <div className="smriti-form-field" style={{ flex: 1 }}>
                  <label className="smriti-form-label">Today Target</label>
                  <input
                    type="number"
                    className="smriti-form-input"
                    value={formData.todayGoal?.target ?? 5}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        todayGoal: { ...formData.todayGoal, target: Number(e.target.value) },
                      })
                    }
                    min="1"
                  />
                </div>
              </div>

              <div className="smriti-modal-actions">
                <button
                  type="button"
                  className="smriti-modal-btn smriti-modal-btn-secondary"
                  onClick={handleResetToDefault}
                  title="Reset to default screenshot values"
                >
                  <RotateCcw size={16} />
                  <span>Reset Default</span>
                </button>
                <button
                  type="submit"
                  className="smriti-modal-btn smriti-modal-btn-primary"
                >
                  <Check size={16} />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
