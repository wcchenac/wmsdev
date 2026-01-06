import setJWTToken from '../../utilities/SetJWTToken';
import API from '../../utilities/API';

// Mock the API module
jest.mock('../../utilities/API', () => ({
  defaults: {
    headers: {
      common: {}
    }
  }
}));

describe('SetJWTToken - setJWTToken function', () => {
  beforeEach(() => {
    // Clear Authorization header before each test
    delete API.defaults.headers.common['Authorization'];
  });

  describe('setting token', () => {
    test('sets Authorization header when valid token string provided', () => {
      const token = 'Bearer test-jwt-token-12345';
      setJWTToken(token);
      expect(API.defaults.headers.common['Authorization']).toBe(token);
    });

    test('sets Authorization header with plain token', () => {
      const token = 'plain-token-without-bearer';
      setJWTToken(token);
      expect(API.defaults.headers.common['Authorization']).toBe(token);
    });

    test('overwrites existing Authorization header', () => {
      API.defaults.headers.common['Authorization'] = 'old-token';
      const newToken = 'new-token';
      setJWTToken(newToken);
      expect(API.defaults.headers.common['Authorization']).toBe(newToken);
    });

    test('sets Authorization header with empty string', () => {
      setJWTToken('');
      // Empty string is falsy, so header should be deleted
      expect(API.defaults.headers.common['Authorization']).toBeUndefined();
    });
  });

  describe('removing token', () => {
    test('removes Authorization header when token is false', () => {
      API.defaults.headers.common['Authorization'] = 'existing-token';
      setJWTToken(false);
      expect(API.defaults.headers.common['Authorization']).toBeUndefined();
    });

    test('removes Authorization header when token is null', () => {
      API.defaults.headers.common['Authorization'] = 'existing-token';
      setJWTToken(null);
      expect(API.defaults.headers.common['Authorization']).toBeUndefined();
    });

    test('removes Authorization header when token is undefined', () => {
      API.defaults.headers.common['Authorization'] = 'existing-token';
      setJWTToken(undefined);
      expect(API.defaults.headers.common['Authorization']).toBeUndefined();
    });

    test('removes Authorization header when token is 0', () => {
      API.defaults.headers.common['Authorization'] = 'existing-token';
      setJWTToken(0);
      expect(API.defaults.headers.common['Authorization']).toBeUndefined();
    });
  });

  describe('idempotency', () => {
    test('setting same token multiple times results in same state', () => {
      const token = 'test-token';
      setJWTToken(token);
      setJWTToken(token);
      setJWTToken(token);
      expect(API.defaults.headers.common['Authorization']).toBe(token);
    });

    test('removing non-existent header does not throw', () => {
      expect(() => setJWTToken(false)).not.toThrow();
      expect(API.defaults.headers.common['Authorization']).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    test('handles token with special characters', () => {
      const token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ';
      setJWTToken(token);
      expect(API.defaults.headers.common['Authorization']).toBe(token);
    });

    test('handles very long token', () => {
      const token = 'Bearer ' + 'a'.repeat(1000);
      setJWTToken(token);
      expect(API.defaults.headers.common['Authorization']).toBe(token);
    });
  });
});
