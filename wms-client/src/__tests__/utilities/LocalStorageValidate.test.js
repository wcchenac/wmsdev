import localStorageValidate from '../../utilities/LocalStorageValidate';
import setJWTToken from '../../utilities/SetJWTToken';
import store from '../../store';
import { SET_Current_User } from '../../actions/types';
import { logout } from '../../actions/UserActions';
import jwt_decode from 'jwt-decode';

// Mock dependencies
jest.mock('../../utilities/SetJWTToken');
jest.mock('jwt-decode');
jest.mock('../../store', () => ({
  dispatch: jest.fn()
}));
jest.mock('../../actions/UserActions', () => ({
  logout: jest.fn(() => ({ type: 'LOGOUT' }))
}));

describe('LocalStorageValidate - localStorageValidate function', () => {
  const mockValidToken = 'valid-jwt-token';
  const mockDecodedValidJwt = {
    employeeId: 'EMP001',
    fullname: 'Test User',
    role: { authority: 'ROLE_Admin' },
    exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
  };
  const mockDecodedExpiredJwt = {
    employeeId: 'EMP001',
    fullname: 'Test User',
    role: { authority: 'ROLE_Admin' },
    exp: Math.floor(Date.now() / 1000) - 3600 // 1 hour ago (expired)
  };

  // Create a proper mock for localStorage
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
  };

  beforeAll(() => {
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReset();
    window.location.href = '';
  });

  describe('when no token in localStorage', () => {
    test('does not call setJWTToken when no token', () => {
      localStorageMock.getItem.mockReturnValue(null);

      localStorageValidate();

      expect(setJWTToken).not.toHaveBeenCalled();
    });

    test('does not dispatch any action when no token', () => {
      localStorageMock.getItem.mockReturnValue(null);

      localStorageValidate();

      expect(store.dispatch).not.toHaveBeenCalled();
    });

    test('does not redirect when no token', () => {
      localStorageMock.getItem.mockReturnValue(null);

      localStorageValidate();

      expect(window.location.href).toBe('');
    });
  });

  describe('when valid token in localStorage', () => {
    beforeEach(() => {
      localStorageMock.getItem.mockReturnValue(mockValidToken);
      jwt_decode.mockReturnValue(mockDecodedValidJwt);
    });

    test('calls setJWTToken with the token', () => {
      localStorageValidate();

      expect(setJWTToken).toHaveBeenCalledWith(mockValidToken);
    });

    test('decodes the JWT token', () => {
      localStorageValidate();

      expect(jwt_decode).toHaveBeenCalledWith(mockValidToken);
    });

    test('dispatches SET_Current_User with decoded JWT', () => {
      localStorageValidate();

      expect(store.dispatch).toHaveBeenCalledWith({
        type: SET_Current_User,
        payload: mockDecodedValidJwt
      });
    });

    test('does not call logout for valid token', () => {
      localStorageValidate();

      expect(logout).not.toHaveBeenCalled();
    });

    test('does not redirect for valid token', () => {
      localStorageValidate();

      expect(window.location.href).toBe('');
    });
  });

  describe('when expired token in localStorage', () => {
    beforeEach(() => {
      localStorageMock.getItem.mockReturnValue(mockValidToken);
      jwt_decode.mockReturnValue(mockDecodedExpiredJwt);
    });

    test('calls setJWTToken with the token first', () => {
      localStorageValidate();

      expect(setJWTToken).toHaveBeenCalledWith(mockValidToken);
    });

    test('dispatches SET_Current_User before checking expiry', () => {
      localStorageValidate();

      expect(store.dispatch).toHaveBeenCalledWith({
        type: SET_Current_User,
        payload: mockDecodedExpiredJwt
      });
    });

    test('calls logout for expired token', () => {
      localStorageValidate();

      expect(logout).toHaveBeenCalled();
      expect(store.dispatch).toHaveBeenCalledWith({ type: 'LOGOUT' });
    });

    test('redirects to root for expired token', () => {
      localStorageValidate();

      expect(window.location.href).toBe('/');
    });
  });

  describe('token expiry boundary cases', () => {
    test('treats token as expired when exp equals current time', () => {
      // Note: Due to timing, exp === currentTime might trigger logout
      // The actual behavior depends on exact timing of Date.now() call
      const expAtCurrentTime = {
        ...mockDecodedValidJwt,
        exp: Math.floor(Date.now() / 1000)
      };
      localStorageMock.getItem.mockReturnValue(mockValidToken);
      jwt_decode.mockReturnValue(expAtCurrentTime);

      localStorageValidate();

      // exp < currentTime check - if equal or less, logout is called
      // This is acceptable behavior for boundary case
      expect(logout).toHaveBeenCalled();
    });

    test('treats token as expired when exp is 1 second before current time', () => {
      const expJustExpired = {
        ...mockDecodedValidJwt,
        exp: Math.floor(Date.now() / 1000) - 1
      };
      localStorageMock.getItem.mockReturnValue(mockValidToken);
      jwt_decode.mockReturnValue(expJustExpired);

      localStorageValidate();

      expect(logout).toHaveBeenCalled();
    });

    test('treats token as valid when exp is 1 second after current time', () => {
      const expJustValid = {
        ...mockDecodedValidJwt,
        exp: Math.floor(Date.now() / 1000) + 1
      };
      localStorageMock.getItem.mockReturnValue(mockValidToken);
      jwt_decode.mockReturnValue(expJustValid);

      localStorageValidate();

      expect(logout).not.toHaveBeenCalled();
    });
  });

  describe('localStorage access', () => {
    test('reads jwtToken key from localStorage', () => {
      localStorageMock.getItem.mockReturnValue(null);

      localStorageValidate();

      expect(localStorageMock.getItem).toHaveBeenCalledWith('jwtToken');
    });

    test('only reads from localStorage once', () => {
      localStorageMock.getItem.mockReturnValue(mockValidToken);
      jwt_decode.mockReturnValue(mockDecodedValidJwt);

      localStorageValidate();

      expect(localStorageMock.getItem).toHaveBeenCalledTimes(1);
    });
  });
});
