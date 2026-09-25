/**
 * Navigation Configuration for SMRITI Dashboard
 *
 * Distinct categories:
 * - GAMES_LIST: games only (Memory Game, Sequence Recall, Puzzle & Sequence, Remember and Match)
 * - BOTTOM_NAV_ITEMS: global sections (Home, Routine, Quick Dial, Profile)
 *
 * Routine Recall is treated strictly as an independent daily routine feature, NOT a game.
 */

export const GAMES_LIST = [
  {
    id: 'memory_game',
    label: 'Memory game',
    icon: '🧠',
    path: '/memory-match',
    iconBg: '#E0F2FE',
    badgeColor: '#0284c7',
  },
  {
    id: 'sequence_recall',
    label: 'Sequence recall',
    icon: '🟩',
    path: '/sequence-recall',
    iconBg: '#DCFCE7',
    badgeColor: '#16a34a',
  },
  {
    id: 'puzzle_sequence',
    label: 'Puzzle & sequence',
    icon: '🧩',
    path: '/pattern-sequence',
    iconBg: '#FEF3C7',
    badgeColor: '#d97706',
  },
  {
    id: 'remember_match',
    label: 'Remember and match',
    icon: '💡',
    path: '/memory-game',
    iconBg: '#FFF7EE',
    badgeColor: '#ea580c',
  },
];

export const BOTTOM_NAV_ITEMS = [
  {
    id: 'home',
    label: 'home',
    icon: '🏠',
    path: '/',
  },
  {
    id: 'routine',
    label: 'routine',
    icon: '📅',
    path: '/routine',
  },
  {
    id: 'quick_dial',
    label: 'quick dial',
    icon: '📞',
    path: '/quick-dial',
  },
  {
    id: 'profile',
    label: 'profile',
    icon: '👤',
    path: '/profile',
  },
];
