import { dayOfStart, dayOfEnd, setPreviousMonth, formatLocalDateTime } from '../../components/BO/Stock/Utilities/DateUtils';

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

    test('returns a new Date without mutating the input date', () => {
      const date = new Date('2024-06-15T14:30:45');
      const originalTime = date.getTime();
      const result = dayOfStart(date);

      expect(result).not.toBe(date);
      expect(date.getTime()).toBe(originalTime);
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

    test('returns a new Date without mutating the input date', () => {
      const date = new Date('2024-06-15T14:30:45');
      const originalTime = date.getTime();
      const result = dayOfEnd(date);

      expect(result).not.toBe(date);
      expect(date.getTime()).toBe(originalTime);
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

    test('returns a new Date without mutating the input date', () => {
      const date = new Date('2024-06-15T14:30:45');
      const originalTime = date.getTime();
      const result = setPreviousMonth(date, 1);

      expect(result).not.toBe(date);
      expect(date.getTime()).toBe(originalTime);
    });

    test('preserves day of month when valid', () => {
      const date = new Date('2024-06-15T14:30:45');
      const result = setPreviousMonth(date, 1);

      expect(result.getDate()).toBe(15);
    });

    test('clamps month-end day instead of overflowing into the next month', () => {
      const leapMarchEnd = new Date('2024-03-31T14:30:45');
      const febLeapResult = setPreviousMonth(leapMarchEnd, 1);
      expect(febLeapResult.getFullYear()).toBe(2024);
      expect(febLeapResult.getMonth()).toBe(1);
      expect(febLeapResult.getDate()).toBe(29);

      const nonLeapFebResult = setPreviousMonth(leapMarchEnd, 13);
      expect(nonLeapFebResult.getFullYear()).toBe(2023);
      expect(nonLeapFebResult.getMonth()).toBe(1);
      expect(nonLeapFebResult.getDate()).toBe(28);
    });
  });

  describe('formatLocalDateTime', () => {
    test('formats local YYYY-MM-DDTHH:mm:ss without shifting to UTC (C-7)', () => {
      const localStart = dayOfStart(new Date(2026, 10, 18, 9, 5, 3));
      const localEnd = dayOfEnd(new Date(2026, 10, 18, 9, 5, 3));

      expect(formatLocalDateTime(localStart)).toBe('2026-11-18T00:00:00');
      expect(formatLocalDateTime(localEnd)).toBe('2026-11-18T23:59:59');
    });

    test('zero-pads single-digit months, days, hours, minutes, and seconds', () => {
      const localDate = new Date(2026, 0, 5, 4, 7, 9);
      expect(formatLocalDateTime(localDate)).toBe('2026-01-05T04:07:09');
    });
  });
});
