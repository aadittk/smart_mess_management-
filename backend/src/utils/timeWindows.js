/**
 * @file timeWindows.js
 * @description Utility for calculating and validating meal attendance time windows.
 */

/**
 * Parses "HH:MM" string into minutes from midnight.
 * @param {string} timeStr - Time in 24-hr format (e.g., "07:30")
 * @returns {number}
 */
function parseTimeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

/**
 * Returns the configured meal windows from environment or defaults.
 * @returns {Record<string, { start: string, end: string }>}
 */
function getMealWindowsConfig() {
  return {
    breakfast: {
      start: process.env.BREAKFAST_START || '07:00',
      end: process.env.BREAKFAST_END || '10:00',
    },
    lunch: {
      start: process.env.LUNCH_START || '12:00',
      end: process.env.LUNCH_END || '14:30',
    },
    snacks: {
      start: process.env.SNACKS_START || '16:30',
      end: process.env.SNACKS_END || '18:30',
    },
    dinner: {
      start: process.env.DINNER_START || '19:30',
      end: process.env.DINNER_END || '22:00',
    },
  };
}

/**
 * Validates whether a given time is within a specified meal window.
 * @param {string} mealType - 'breakfast' | 'lunch' | 'snacks' | 'dinner'
 * @param {Date|string} [targetTime] - Optional Date or "HH:MM" string (defaults to now)
 * @returns {{ valid: boolean, message?: string, window?: { start: string, end: string } }}
 */
function isWithinMealWindow(mealType, targetTime) {
  const windows = getMealWindowsConfig();
  const normalizedMeal = (mealType || '').toLowerCase().trim();

  if (!windows[normalizedMeal]) {
    return {
      valid: false,
      message: `Invalid meal type "${mealType}". Allowed values: breakfast, lunch, snacks, dinner.`,
    };
  }

  const { start, end } = windows[normalizedMeal];
  const startMinutes = parseTimeToMinutes(start);
  const endMinutes = parseTimeToMinutes(end);

  let currentMinutes;
  if (typeof targetTime === 'string') {
    currentMinutes = parseTimeToMinutes(targetTime);
  } else {
    const now = targetTime instanceof Date ? targetTime : new Date();
    currentMinutes = now.getHours() * 60 + now.getMinutes();
  }

  const withinWindow = currentMinutes >= startMinutes && currentMinutes <= endMinutes;

  if (!withinWindow) {
    return {
      valid: false,
      message: `Attendance for ${normalizedMeal} can only be marked between ${start} and ${end}.`,
      window: { start, end },
    };
  }

  return {
    valid: true,
    window: { start, end },
  };
}

/**
 * Detects which meal window is currently active, if any.
 * @param {Date} [now]
 * @returns {string|null}
 */
function getCurrentActiveMeal(now = new Date()) {
  const windows = getMealWindowsConfig();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (const [meal, { start, end }] of Object.entries(windows)) {
    const sMin = parseTimeToMinutes(start);
    const eMin = parseTimeToMinutes(end);
    if (currentMinutes >= sMin && currentMinutes <= eMin) {
      return meal;
    }
  }
  return null;
}

module.exports = {
  parseTimeToMinutes,
  getMealWindowsConfig,
  isWithinMealWindow,
  getCurrentActiveMeal,
};
