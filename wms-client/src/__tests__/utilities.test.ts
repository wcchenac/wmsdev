import { isEmpty } from '../utilities/IsEmpty';

describe('isEmpty Utility', () => {
  describe('returns true for empty values', () => {
    it('returns true for empty object', () => {
      expect(isEmpty({})).toBe(true);
    });

    it('returns true for empty array', () => {
      expect(isEmpty([])).toBe(true);
    });

    it('returns true for undefined (no enumerable properties)', () => {
      expect(isEmpty(undefined)).toBe(true);
    });

    it('returns true for null (no enumerable properties)', () => {
      expect(isEmpty(null)).toBe(true);
    });
  });

  describe('returns false for non-empty values', () => {
    it('returns false for object with properties', () => {
      expect(isEmpty({ key: 'value' })).toBe(false);
    });

    it('returns false for array with elements', () => {
      expect(isEmpty([1, 2, 3])).toBe(false);
    });

    it('returns false for object with multiple properties', () => {
      expect(isEmpty({ a: 1, b: 2, c: 3 })).toBe(false);
    });

    it('returns false for nested object', () => {
      expect(isEmpty({ nested: { value: 'test' } })).toBe(false);
    });
  });
});
