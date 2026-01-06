import { isEmpty } from '../../utilities/IsEmpty';

describe('IsEmpty - isEmpty function', () => {
  describe('empty objects', () => {
    test('returns true for empty object literal', () => {
      expect(isEmpty({})).toBe(true);
    });

    test('returns true for Object.create(null)', () => {
      expect(isEmpty(Object.create(null))).toBe(true);
    });

    test('returns true for new Object()', () => {
      expect(isEmpty(new Object())).toBe(true);
    });
  });

  describe('non-empty objects', () => {
    test('returns false for object with single property', () => {
      expect(isEmpty({ a: 1 })).toBe(false);
    });

    test('returns false for object with multiple properties', () => {
      expect(isEmpty({ a: 1, b: 2, c: 3 })).toBe(false);
    });

    test('returns false for object with nested property', () => {
      expect(isEmpty({ nested: { value: 1 } })).toBe(false);
    });

    test('returns false for object with undefined value', () => {
      expect(isEmpty({ key: undefined })).toBe(false);
    });

    test('returns false for object with null value', () => {
      expect(isEmpty({ key: null })).toBe(false);
    });

    test('returns false for object with empty string value', () => {
      expect(isEmpty({ key: '' })).toBe(false);
    });

    test('returns false for object with zero value', () => {
      expect(isEmpty({ key: 0 })).toBe(false);
    });

    test('returns false for object with false value', () => {
      expect(isEmpty({ key: false })).toBe(false);
    });
  });

  describe('inherited properties', () => {
    test('returns true for object with only inherited properties', () => {
      const parent = { inherited: true };
      const child = Object.create(parent);
      expect(isEmpty(child)).toBe(true);
    });

    test('returns false for object with own properties overriding inherited', () => {
      const parent = { inherited: true };
      const child = Object.create(parent);
      child.own = 'value';
      expect(isEmpty(child)).toBe(false);
    });
  });

  describe('edge cases', () => {
    test('handles object with numeric keys', () => {
      expect(isEmpty({ 0: 'zero', 1: 'one' })).toBe(false);
    });

    test('handles object with symbol keys (may not iterate)', () => {
      const obj = {};
      obj[Symbol('test')] = 'value';
      // Symbol keys are not enumerated by for...in
      expect(isEmpty(obj)).toBe(true);
    });

    test('handles object with array property', () => {
      expect(isEmpty({ arr: [] })).toBe(false);
    });

    test('handles object with function property', () => {
      expect(isEmpty({ fn: () => {} })).toBe(false);
    });
  });

  describe('arrays (treated as objects)', () => {
    test('returns true for empty array', () => {
      expect(isEmpty([])).toBe(true);
    });

    test('returns false for non-empty array', () => {
      expect(isEmpty([1, 2, 3])).toBe(false);
    });

    test('returns false for array with single element', () => {
      expect(isEmpty([1])).toBe(false);
    });
  });
});
