/**
 * CogniCare SMRITI - Daily Login & 5-Minute Playtime Streak Service
 *
 * Rules:
 * 1. Streak cannot be manually edited by the user.
 * 2. User must log in on a given day AND spend at least 5 minutes (300 seconds)
 *    actively playing games / interacting with cognitive activities.
 * 3. Once 5 minutes of playtime is reached on a new day:
 *    - Streak automatically upgrades (+1 Day).
 *    - Updates profile in localStorage.
 *    - Fires 'smriti_streak_updated' event for real-time UI re-rendering.
 *    - Triggers confetti and celebratory notification if available.
 */

import confetti from 'canvas-confetti';

const STREAK_DATA_KEY = 'smriti_streak_tracker';
const PROFILE_DATA_KEY = 'smriti_user_profile';
export const DAILY_PLAYTIME_GOAL_SECONDS = 300; // 5 minutes

// Helper to get formatted local date (YYYY-MM-DD)
export function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Calculate difference in calendar days between two YYYY-MM-DD strings
export function getDaysDifference(prevDateStr, curDateStr) {
  if (!prevDateStr || !curDateStr) return 0;
  const d1 = new Date(prevDateStr + 'T00:00:00');
  const d2 = new Date(curDateStr + 'T00:00:00');
  const diffTime = d2.getTime() - d1.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

class StreakService {
  constructor() {
    this.timerInterval = null;
    this.isTracking = false;
    this.subscribers = new Set();
  }

  // Load tracker state from localStorage
  getTrackerState() {
    const today = getTodayDateString();
    try {
      const stored = localStorage.getItem(STREAK_DATA_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // If tracker is from an earlier day, start a new day record
        if (parsed.date !== today) {
          const daysDiff = getDaysDifference(parsed.date, today);
          const wasConsecutive = daysDiff === 1;

          return {
            date: today,
            playtimeSeconds: 0,
            goalMetToday: false,
            lastStreakCreditedDate: parsed.lastStreakCreditedDate || null,
            lastActiveDate: parsed.date,
            consecutiveEligible: wasConsecutive || parsed.lastStreakCreditedDate === parsed.date,
          };
        }
        return parsed;
      }
    } catch (err) {
      console.warn('Could not parse streak tracker state:', err);
    }

    // Default tracker state for new installation
    return {
      date: today,
      playtimeSeconds: 0,
      goalMetToday: false,
      lastStreakCreditedDate: null,
      lastActiveDate: today,
      consecutiveEligible: true,
    };
  }

  // Save tracker state
  saveTrackerState(state) {
    try {
      localStorage.setItem(STREAK_DATA_KEY, JSON.stringify(state));
      this.notifySubscribers(state);
    } catch (err) {
      console.warn('Could not save streak tracker state:', err);
    }
  }

  // Subscribe to tracker updates
  subscribe(callback) {
    this.subscribers.add(callback);
    callback(this.getTrackerState());
    return () => this.subscribers.delete(callback);
  }

  notifySubscribers(state) {
    this.subscribers.forEach((cb) => {
      try {
        cb(state);
      } catch (e) {
        console.error('Streak subscriber error:', e);
      }
    });
  }

  // Initialize service on app mount
  init() {
    const state = this.getTrackerState();
    this.saveTrackerState(state);

    // Start background activity ticker if not already running
    if (!this.timerInterval) {
      this.isTracking = true;
      this.timerInterval = setInterval(() => {
        // Only track playtime when document is visible/active
        if (typeof document !== 'undefined' && !document.hidden) {
          this.addPlaytime(1);
        }
      }, 1000);
    }
  }

  // Stop background timer
  stop() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.isTracking = false;
  }

  // Add playtime seconds (called each active second or after game completion)
  addPlaytime(seconds = 1) {
    const state = this.getTrackerState();
    const today = getTodayDateString();

    state.playtimeSeconds = (state.playtimeSeconds || 0) + seconds;

    // Check if 5-minute threshold (300 seconds) is reached and not yet awarded today
    if (state.playtimeSeconds >= DAILY_PLAYTIME_GOAL_SECONDS && !state.goalMetToday) {
      state.goalMetToday = true;
      state.lastStreakCreditedDate = today;
      this.awardStreakUpgrade();
    }

    this.saveTrackerState(state);
  }

  // Awards +1 to the user's daily streak
  awardStreakUpgrade() {
    try {
      const rawProfile = localStorage.getItem(PROFILE_DATA_KEY);
      let profile = rawProfile
        ? JSON.parse(rawProfile)
        : {
            name: 'Saarth Jain',
            age: 63,
            gender: 'Male',
            contact: '8539594776',
            avatarUrl: '',
            streak: 4,
            weeklyGoal: { current: 12, target: 15 },
            todayGoal: { current: 2, target: 5 },
          };

      const oldStreak = Number(profile.streak) || 0;
      const newStreak = oldStreak + 1;
      profile.streak = newStreak;

      // Also increment today's goal progress if applicable
      if (profile.todayGoal && typeof profile.todayGoal.current === 'number') {
        profile.todayGoal.current = Math.min(
          profile.todayGoal.target || 5,
          profile.todayGoal.current + 1
        );
      }

      localStorage.setItem(PROFILE_DATA_KEY, JSON.stringify(profile));

      // Celebration effect
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#EFB84A', '#236B64', '#10B981'],
        });
      } catch (e) {
        // Fallback if confetti is disabled
      }

      // Dispatch global event for reactive UI updates
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('smriti_streak_updated', {
            detail: {
              oldStreak,
              newStreak,
              message: `🔥 Streak Upgraded! You played for 5 minutes today! Current streak: ${newStreak} Days!`,
            },
          })
        );
      }
    } catch (err) {
      console.warn('Could not upgrade streak:', err);
    }
  }

  // Fast-forward / simulate playtime (useful for testing & demonstrations)
  simulatePlaytime(seconds = 60) {
    this.addPlaytime(seconds);
  }
}

export const streakService = new StreakService();
