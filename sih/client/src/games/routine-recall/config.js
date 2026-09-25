/**
 * ==============================================================================
 * Daily Routine Recall — Game Configuration
 * ==============================================================================
 * 
 * Customize the routine activities, their icons, labels, and correct step positions.
 * To change the daily routine or add steps:
 * 1. Modify or add entries in ROUTINE_ACTIVITIES.
 * 2. Set `correctStep` to the 1-based step index (1, 2, 3, etc.).
 * 3. Update STEPS_CONFIG if you want different step labels or alignments.
 */

export const ROUTINE_METADATA = {
  title: 'Daily routine Recall',
  titleEmoji: '🔔',
  totalSteps: 5,
};

/**
 * 5 Routine Activities (matching the exact sequence and tray layout):
 * 1. Step 1: "wake up" 🌅
 * 2. Step 2: "brush your teeth" 🪥
 * 3. Step 3: "bathing" 🚿
 * 4. Step 4: "eat food" 🍔
 * 5. Step 5: "medicine time" 💊
 *
 * `defaultTraySlot`:
 *  0 -> Top row, left
 *  1 -> Top row, right
 *  2 -> Middle row, center
 *  3 -> Bottom row, left
 *  4 -> Bottom row, right
 */
export const ROUTINE_ACTIVITIES = [
  {
    id: 'wake_up',
    label: 'wake up',
    icon: '🌅',
    correctStep: 1,
    defaultTraySlot: 0,
  },
  {
    id: 'bathing',
    label: 'bathing',
    icon: '🚿',
    correctStep: 3,
    defaultTraySlot: 1,
  },
  {
    id: 'brush_teeth',
    label: 'brush your teeth',
    icon: '🪥',
    correctStep: 2,
    defaultTraySlot: 2,
  },
  {
    id: 'eat_food',
    label: 'eat food',
    icon: '🍔',
    correctStep: 4,
    defaultTraySlot: 3,
  },
  {
    id: 'medicine_time',
    label: 'medicine time',
    icon: '💊',
    correctStep: 5,
    defaultTraySlot: 4,
  },
];

/**
 * Step definitions for the sequence diagram:
 * Staggered / zigzag layout:
 * - Step 1: top-left
 * - Step 2: middle-right
 * - Step 3: middle-left
 * - Step 4: lower-right
 * - Step 5: bottom-left
 */
export const STEPS_CONFIG = [
  { stepNumber: 1, label: 'step 1', align: 'left',  top: 0,   side: 'left' },
  { stepNumber: 2, label: 'step 2', align: 'right', top: 66,  side: 'right' },
  { stepNumber: 3, label: 'step 3', align: 'left',  top: 132, side: 'left' },
  { stepNumber: 4, label: 'step 4', align: 'right', top: 198, side: 'right' },
  { stepNumber: 5, label: 'step 5', align: 'left',  top: 264, side: 'left' },
];

/**
 * Validates the player's current sequence placements
 * @param {Object} placements - Map of { [stepNumber]: activityId }
 * @returns {{ isComplete: boolean, isAllCorrect: boolean, errors: number[] }}
 */
export function validateRoutineSequence(placements) {
  const stepNumbers = STEPS_CONFIG.map((s) => s.stepNumber);
  const isComplete = stepNumbers.every((num) => Boolean(placements[num]));

  if (!isComplete) {
    return { isComplete: false, isAllCorrect: false, errors: [] };
  }

  const errors = [];
  stepNumbers.forEach((stepNum) => {
    const activityId = placements[stepNum];
    const activity = ROUTINE_ACTIVITIES.find((a) => a.id === activityId);
    if (!activity || activity.correctStep !== stepNum) {
      errors.push(stepNum);
    }
  });

  return {
    isComplete: true,
    isAllCorrect: errors.length === 0,
    errors,
  };
}
