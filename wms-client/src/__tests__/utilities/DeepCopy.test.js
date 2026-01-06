import { copy } from '../../utilities/DeepCopy';

describe('DeepCopy - copy function', () => {
  describe('falsy input handling', () => {
    test('returns null for null input', () => {
      expect(copy(null)).toBe(null);
    });

    test('returns undefined for undefined input', () => {
      expect(copy(undefined)).toBe(undefined);
    });

    test('returns 0 for 0 input', () => {
      expect(copy(0)).toBe(0);
    });

    test('returns empty string for empty string input', () => {
      expect(copy('')).toBe('');
    });

    test('returns false for false input', () => {
      expect(copy(false)).toBe(false);
    });
  });

  describe('primitive value handling', () => {
    // Note: The copy function converts primitives to objects due to for...in loop
    // This documents the actual behavior of the function
    test('converts number to empty object (due to for...in on primitive)', () => {
      // The function iterates with for...in on primitive, resulting in empty object
      expect(copy(42)).toEqual({});
    });

    test('converts string to object with indexed characters', () => {
      // Strings are iterable, so for...in creates object with indices
      const result = copy('hello');
      expect(result).toEqual({ '0': 'h', '1': 'e', '2': 'l', '3': 'l', '4': 'o' });
    });

    test('converts boolean to empty object', () => {
      expect(copy(true)).toEqual({});
    });
  });

  describe('object deep copying', () => {
    test('deep copies simple object', () => {
      const original = { a: 1, b: 2 };
      const copied = copy(original);

      expect(copied).toEqual(original);
      expect(copied).not.toBe(original);
    });

    test('deep copies nested object', () => {
      const original = { a: 1, b: { c: 2, d: { e: 3 } } };
      const copied = copy(original);

      expect(copied).toEqual(original);
      expect(copied).not.toBe(original);
      expect(copied.b).not.toBe(original.b);
      expect(copied.b.d).not.toBe(original.b.d);
    });

    test('modifications to copy do not affect original', () => {
      const original = { a: { b: 1 } };
      const copied = copy(original);

      copied.a.b = 999;

      expect(original.a.b).toBe(1);
      expect(copied.a.b).toBe(999);
    });

    test('deep copies object with mixed value types', () => {
      const original = {
        num: 1,
        str: 'hello',
        bool: true,
        nested: { value: 'nested' }
      };
      const copied = copy(original);

      expect(copied).toEqual(original);
      expect(copied.nested).not.toBe(original.nested);
    });
  });

  describe('array deep copying', () => {
    test('deep copies simple array', () => {
      const original = [1, 2, 3];
      const copied = copy(original);

      expect(copied).toEqual(original);
      expect(copied).not.toBe(original);
    });

    test('deep copies nested array', () => {
      const original = [1, [2, 3], [[4, 5]]];
      const copied = copy(original);

      expect(copied).toEqual(original);
      expect(copied[1]).not.toBe(original[1]);
      expect(copied[2][0]).not.toBe(original[2][0]);
    });

    test('deep copies array with objects', () => {
      const original = [{ a: 1 }, { b: 2 }];
      const copied = copy(original);

      expect(copied).toEqual(original);
      expect(copied[0]).not.toBe(original[0]);
      expect(copied[1]).not.toBe(original[1]);
    });

    test('modifications to copied array do not affect original', () => {
      const original = [1, [2, 3], { a: 4 }];
      const copied = copy(original);

      copied[1][0] = 999;
      copied[2].a = 888;

      expect(original[1][0]).toBe(2);
      expect(original[2].a).toBe(4);
    });
  });

  describe('empty structures', () => {
    test('deep copies empty object', () => {
      const original = {};
      const copied = copy(original);

      expect(copied).toEqual({});
      expect(copied).not.toBe(original);
    });

    test('deep copies empty array', () => {
      const original = [];
      const copied = copy(original);

      expect(copied).toEqual([]);
      expect(copied).not.toBe(original);
    });
  });

  describe('complex nested structures', () => {
    test('deep copies complex nested structure', () => {
      const original = {
        users: [
          { id: 1, name: 'Alice', roles: ['admin', 'user'] },
          { id: 2, name: 'Bob', roles: ['user'] }
        ],
        settings: {
          theme: 'dark',
          notifications: {
            email: true,
            sms: false
          }
        }
      };
      const copied = copy(original);

      expect(copied).toEqual(original);
      expect(copied.users).not.toBe(original.users);
      expect(copied.users[0]).not.toBe(original.users[0]);
      expect(copied.users[0].roles).not.toBe(original.users[0].roles);
      expect(copied.settings.notifications).not.toBe(original.settings.notifications);
    });
  });
});
