import { dayOfStart, dayOfEnd, setPreviousMonth } from '../../components/BO/Stock/Utilities/DateUtils';

describe('DateUtils', () => {
  describe('dayOfStart', () => {
    test('sets time to 00:00:00', () => {
      const date = new Date('2024-06-15T14:30:45.123');
      const result = dayOfStart(date);

      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
    });

    test('preserves the date portion', () => {
      const date = new Date('2024-06-15T14:30:45');
      const result = dayOfStart(date);

      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(5); // June (0-indexed)
      expect(result.getDate()).toBe(15);
    });

    test('returns the same date object (mutates in place)', () => {
      const date = new Date('2024-06-15T14:30:45');
      const result = dayOfStart(date);

      expect(result).toBe(date);
    });

    test('handles midnight correctly', () => {
      const date = new Date('2024-06-15T00:00:00');
      const result = dayOfStart(date);

      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
    });

    test('handles end of day correctly', () => {
      const date = new Date('2024-06-15T23:59:59');
      const result = dayOfStart(date);

      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
    });
  });

  describe('dayOfEnd', () => {
    test('sets time to 23:59:59', () => {
      const date = new Date('2024-06-15T14:30:45.123');
      const result = dayOfEnd(date);

      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
    });

    test('preserves the date portion', () => {
      const date = new Date('2024-06-15T00:00:00');
      const result = dayOfEnd(date);

      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(5); // June (0-indexed)
      expect(result.getDate()).toBe(15);
    });

    test('returns the same date object (mutates in place)', () => {
      const date = new Date('2024-06-15T14:30:45');
      const result = dayOfEnd(date);

      expect(result).toBe(date);
    });

    test('handles midnight correctly', () => {
      const date = new Date('2024-06-15T00:00:00');
      const result = dayOfEnd(date);

      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
    });
  });

  describe('setPreviousMonth', () => {
    test('subtracts specified months', () => {
      const date = new Date('2024-06-15T14:30:45');
      const result = setPreviousMonth(date, 3);

      expect(result.getMonth()).toBe(2); // March (0-indexed)
      expect(result.getFullYear()).toBe(2024);
    });

    test('resets time to start of day', () => {
      const date = new Date('2024-06-15T14:30:45');
      const result = setPreviousMonth(date, 1);

      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
    });

    test('handles year boundary (going to previous year)', () => {
      const date = new Date('2024-02-15T14:30:45');
      const result = setPreviousMonth(date, 3);

      expect(result.getMonth()).toBe(10); // November (0-indexed)
      expect(result.getFullYear()).toBe(2023);
    });

    test('handles going back multiple years', () => {
      const date = new Date('2024-06-15T14:30:45');
      const result = setPreviousMonth(date, 24);

      expect(result.getMonth()).toBe(5); // June (0-indexed)
      expect(result.getFullYear()).toBe(2022);
    });

    test('handles backward = 0 (same month)', () => {
      const date = new Date('2024-06-15T14:30:45');
      const result = setPreviousMonth(date, 0);

      expect(result.getMonth()).toBe(5); // June (0-indexed)
      expect(result.getFullYear()).toBe(2024);
    });

    test('handles backward = 1 (previous month)', () => {
      const date = new Date('2024-06-15T14:30:45');
      const result = setPreviousMonth(date, 1);

      expect(result.getMonth()).toBe(4); // May (0-indexed)
      expect(result.getFullYear()).toBe(2024);
    });

    test('returns the same date object (mutates in place)', () => {
      const date = new Date('2024-06-15T14:30:45');
      const result = setPreviousMonth(date, 1);

      expect(result).toBe(date);
    });

    test('preserves day of month when valid', () => {
      const date = new Date('2024-06-15T14:30:45');
      const result = setPreviousMonth(date, 1);

      expect(result.getDate()).toBe(15);
    });
  });
});
