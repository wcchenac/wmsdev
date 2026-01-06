import {
  checkWaitHandleStatusCompletion,
  checkWaitHandleProductStatus
} from '../../components/BO/Stock/Utilities/ValidateQueryOrderResponse';

describe('ValidateQueryOrderResponse', () => {
  describe('checkWaitHandleStatusCompletion', () => {
    describe('returns true (order complete)', () => {
      test('returns true when all quantities are 0', () => {
        const status = {
          'PROD001': {
            roll: { quantity: '0' },
            board: { quantity: '0' },
            hardware: { quantity: '0' }
          }
        };
        expect(checkWaitHandleStatusCompletion(status)).toBe(true);
      });

      test('returns true when all quantities are 0.0', () => {
        const status = {
          'PROD001': {
            roll: { quantity: '0.0' },
            board: { quantity: '0.00' }
          }
        };
        expect(checkWaitHandleStatusCompletion(status)).toBe(true);
      });

      test('returns true for empty status object', () => {
        expect(checkWaitHandleStatusCompletion({})).toBe(true);
      });

      test('returns true when multiple products all have zero quantities', () => {
        const status = {
          'PROD001': { roll: { quantity: '0' } },
          'PROD002': { board: { quantity: '0.0' } },
          'PROD003': { hardware: { quantity: '0.00' } }
        };
        expect(checkWaitHandleStatusCompletion(status)).toBe(true);
      });
    });

    describe('returns false (order incomplete)', () => {
      test('returns false when any quantity is non-zero', () => {
        const status = {
          'PROD001': {
            roll: { quantity: '5' },
            board: { quantity: '0' }
          }
        };
        expect(checkWaitHandleStatusCompletion(status)).toBe(false);
      });

      test('returns false when quantity is decimal non-zero', () => {
        const status = {
          'PROD001': {
            roll: { quantity: '0.5' }
          }
        };
        expect(checkWaitHandleStatusCompletion(status)).toBe(false);
      });

      test('returns false when one product has non-zero among zeros', () => {
        const status = {
          'PROD001': { roll: { quantity: '0' } },
          'PROD002': { board: { quantity: '10' } },
          'PROD003': { hardware: { quantity: '0' } }
        };
        expect(checkWaitHandleStatusCompletion(status)).toBe(false);
      });

      test('returns false for large quantities', () => {
        const status = {
          'PROD001': {
            roll: { quantity: '1000.5' }
          }
        };
        expect(checkWaitHandleStatusCompletion(status)).toBe(false);
      });

      test('returns false for small non-zero quantities', () => {
        const status = {
          'PROD001': {
            roll: { quantity: '0.01' }
          }
        };
        expect(checkWaitHandleStatusCompletion(status)).toBe(false);
      });
    });

    describe('edge cases', () => {
      test('handles single product with single type', () => {
        const status = {
          'PROD001': { roll: { quantity: '0' } }
        };
        expect(checkWaitHandleStatusCompletion(status)).toBe(true);
      });

      test('handles negative quantity as non-zero', () => {
        const status = {
          'PROD001': { roll: { quantity: '-5' } }
        };
        expect(checkWaitHandleStatusCompletion(status)).toBe(false);
      });
    });
  });

  describe('checkWaitHandleProductStatus', () => {
    describe('returns true (has remaining stock)', () => {
      test('returns true when any quantity is non-zero', () => {
        const status = {
          roll: { quantity: '5' },
          board: { quantity: '0' }
        };
        expect(checkWaitHandleProductStatus(status)).toBe(true);
      });

      test('returns true when all quantities are non-zero', () => {
        const status = {
          roll: { quantity: '5' },
          board: { quantity: '10' },
          hardware: { quantity: '3' }
        };
        expect(checkWaitHandleProductStatus(status)).toBe(true);
      });

      test('returns true for decimal non-zero quantities', () => {
        const status = {
          roll: { quantity: '0.5' }
        };
        expect(checkWaitHandleProductStatus(status)).toBe(true);
      });

      test('returns true for large quantities', () => {
        const status = {
          roll: { quantity: '1000.5' }
        };
        expect(checkWaitHandleProductStatus(status)).toBe(true);
      });
    });

    describe('returns false (no remaining stock)', () => {
      test('returns false when all quantities are zero', () => {
        const status = {
          roll: { quantity: '0' },
          board: { quantity: '0.0' }
        };
        expect(checkWaitHandleProductStatus(status)).toBe(false);
      });

      test('returns false for empty status object', () => {
        expect(checkWaitHandleProductStatus({})).toBe(false);
      });

      test('returns false when single type has zero quantity', () => {
        const status = {
          roll: { quantity: '0' }
        };
        expect(checkWaitHandleProductStatus(status)).toBe(false);
      });
    });

    describe('edge cases', () => {
      test('handles single type with non-zero quantity', () => {
        const status = {
          roll: { quantity: '10' }
        };
        expect(checkWaitHandleProductStatus(status)).toBe(true);
      });

      test('handles negative quantity as non-zero', () => {
        const status = {
          roll: { quantity: '-5' }
        };
        expect(checkWaitHandleProductStatus(status)).toBe(true);
      });

      test('handles very small non-zero quantity', () => {
        const status = {
          roll: { quantity: '0.001' }
        };
        expect(checkWaitHandleProductStatus(status)).toBe(true);
      });
    });
  });
});
