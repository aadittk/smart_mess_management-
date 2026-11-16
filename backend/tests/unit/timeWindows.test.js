/**
 * @file timeWindows.test.js
 * @description Unit tests for meal window time validation utilities.
 */
const {
  parseTimeToMinutes,
  isWithinMealWindow,
  getCurrentActiveMeal,
  getMealWindowsConfig,
} = require('../../src/utils/timeWindows');

describe('timeWindows Utility Unit Tests', () => {
  describe('parseTimeToMinutes', () => {
    test('TC-UTIL-01: correctly parses standard HH:MM times', () => {
      expect(parseTimeToMinutes('00:00')).toBe(0);
      expect(parseTimeToMinutes('07:30')).toBe(7 * 60 + 30);
      expect(parseTimeToMinutes('12:00')).toBe(12 * 60);
      expect(parseTimeToMinutes('23:59')).toBe(23 * 60 + 59);
    });

    test('TC-UTIL-02: handles invalid or empty inputs gracefully', () => {
      expect(parseTimeToMinutes('')).toBe(0);
      expect(parseTimeToMinutes(null)).toBe(0);
      expect(parseTimeToMinutes(undefined)).toBe(0);
      expect(parseTimeToMinutes(123)).toBe(0);
    });
  });

  describe('getMealWindowsConfig', () => {
    test('TC-UTIL-03: returns default window configuration for all 4 meals', () => {
      const config = getMealWindowsConfig();
      expect(config).toHaveProperty('breakfast');
      expect(config).toHaveProperty('lunch');
      expect(config).toHaveProperty('snacks');
      expect(config).toHaveProperty('dinner');

      expect(config.breakfast).toEqual({ start: '07:00', end: '10:00' });
      expect(config.lunch).toEqual({ start: '12:00', end: '14:30' });
      expect(config.snacks).toEqual({ start: '16:30', end: '18:30' });
      expect(config.dinner).toEqual({ start: '19:30', end: '22:00' });
    });
  });

  describe('isWithinMealWindow', () => {
    test('TC-UTIL-04: rejects unrecognized meal type', () => {
      const res = isWithinMealWindow('midnight_snack', '00:30');
      expect(res.valid).toBe(false);
      expect(res.message).toMatch(/Invalid meal type/);
    });

    test('TC-UTIL-05: validates boundary conditions for Breakfast (07:00 - 10:00)', () => {
      // Boundary Value Analysis (BVA)
      expect(isWithinMealWindow('breakfast', '06:59').valid).toBe(false);
      expect(isWithinMealWindow('breakfast', '07:00').valid).toBe(true);
      expect(isWithinMealWindow('breakfast', '08:30').valid).toBe(true);
      expect(isWithinMealWindow('breakfast', '10:00').valid).toBe(true);
      expect(isWithinMealWindow('breakfast', '10:01').valid).toBe(false);
    });

    test('TC-UTIL-06: validates Lunch window (12:00 - 14:30)', () => {
      expect(isWithinMealWindow('lunch', '11:59').valid).toBe(false);
      expect(isWithinMealWindow('lunch', '12:00').valid).toBe(true);
      expect(isWithinMealWindow('lunch', '13:15').valid).toBe(true);
      expect(isWithinMealWindow('lunch', '14:30').valid).toBe(true);
      expect(isWithinMealWindow('lunch', '14:31').valid).toBe(false);
    });

    test('TC-UTIL-07: validates Snacks window (16:30 - 18:30)', () => {
      expect(isWithinMealWindow('snacks', '16:29').valid).toBe(false);
      expect(isWithinMealWindow('snacks', '17:00').valid).toBe(true);
      expect(isWithinMealWindow('snacks', '18:30').valid).toBe(true);
      expect(isWithinMealWindow('snacks', '18:31').valid).toBe(false);
    });

    test('TC-UTIL-08: validates Dinner window (19:30 - 22:00)', () => {
      expect(isWithinMealWindow('dinner', '19:29').valid).toBe(false);
      expect(isWithinMealWindow('dinner', '20:15').valid).toBe(true);
      expect(isWithinMealWindow('dinner', '22:00').valid).toBe(true);
      expect(isWithinMealWindow('dinner', '22:01').valid).toBe(false);
    });

    test('TC-UTIL-09: works when passing Date object', () => {
      const dateLunch = new Date(2024, 8, 15, 13, 0); // 13:00
      expect(isWithinMealWindow('lunch', dateLunch).valid).toBe(true);
      expect(isWithinMealWindow('breakfast', dateLunch).valid).toBe(false);
    });
  });

  describe('getCurrentActiveMeal', () => {
    test('TC-UTIL-10: identifies active meal from given Date', () => {
      expect(getCurrentActiveMeal(new Date(2024, 8, 15, 8, 30))).toBe('breakfast');
      expect(getCurrentActiveMeal(new Date(2024, 8, 15, 12, 45))).toBe('lunch');
      expect(getCurrentActiveMeal(new Date(2024, 8, 15, 17, 15))).toBe('snacks');
      expect(getCurrentActiveMeal(new Date(2024, 8, 15, 20, 30))).toBe('dinner');
      expect(getCurrentActiveMeal(new Date(2024, 8, 15, 23, 30))).toBeNull();
    });
  });
});
