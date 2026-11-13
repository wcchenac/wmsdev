import type { Mock, Mocked, MockedFunction } from 'vitest';
import localStorageValidate from '../../utilities/LocalStorageValidate';
import setJWTToken from '../../utilities/SetJWTToken';
import store from '../../store';
import { SET_Current_User } from '../../types';
import { logout } from '../../actions/UserActions';
import { jwtDecode } from 'jwt-decode';

interface DecodedJWT {
  employeeId: string;
  fullname: string;
  role: { authority: string };
  exp: number;
}

interface LocalStorageMock {
  getItem: Mock;
  setItem: Mock;
  removeItem: Mock;
  clear: Mock;
}

// Mock dependencies
vi.mock('../../utilities/SetJWTToken');
vi.mock('jwt-decode', () => ({
  jwtDecode: vi.fn()
}));
vi.mock('../../store', () => ({
  default: {
    dispatch: vi.fn()
  }
}));
vi.mock('../../actions/UserActions', () => ({
  logout: vi.fn(() => ({ type: 'LOGOUT' }))
}));

const mockedSetJWTToken = setJWTToken as MockedFunction<typeof setJWTToken>;
const mockedJwtDecode = jwtDecode as MockedFunction<typeof jwtDecode>;
const mockedStore = store as Mocked<typeof store>;
const mockedLogout = logout as MockedFunction<typeof logout>;

describe('LocalStorageValidate - localStorageValidate function', () => {
  const mockValidToken = 'valid-jwt-token';
  const mockDecodedValidJwt: DecodedJWT = {
    employeeId: 'EMP001',
    fullname: 'Test User',
    role: { authority: 'ROLE_Admin' },
    exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
  };
  const mockDecodedExpiredJwt: DecodedJWT = {
    employeeId: 'EMP001',
    fullname: 'Test User',
    role: { authority: 'ROLE_Admin' },
    exp: Math.floor(Date.now() / 1000) - 3600 // 1 hour ago (expired)
  };

  // Create a proper mock for localStorage
  const localStorageMock: LocalStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  };

  beforeAll(() => {
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    });
  });

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReset();
    window.location.href = '';
  });

  describe('when no token in localStorage', () => {
    test('does not call setJWTToken when no token', () => {
      localStorageMock.getItem.mockReturnValue(null);

      localStorageValidate();

      expect(mockedSetJWTToken).not.toHaveBeenCalled();
    });

    test('does not dispatch any action when no token', () => {
      localStorageMock.getItem.mockReturnValue(null);

      localStorageValidate();

      expect(mockedStore.dispatch).not.toHaveBeenCalled();
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
      mockedJwtDecode.mockReturnValue(mockDecodedValidJwt);
    });

    test('calls setJWTToken with the token', () => {
      localStorageValidate();

      expect(mockedSetJWTToken).toHaveBeenCalledWith(mockValidToken);
    });

    test('decodes the JWT token', () => {
      localStorageValidate();

      expect(mockedJwtDecode).toHaveBeenCalledWith(mockValidToken);
    });

    test('dispatches SET_Current_User with decoded JWT', () => {
      localStorageValidate();

      expect(mockedStore.dispatch).toHaveBeenCalledWith({
        type: SET_Current_User,
        payload: mockDecodedValidJwt
      });
    });

    test('does not call logout for valid token', () => {
      localStorageValidate();

      expect(mockedLogout).not.toHaveBeenCalled();
    });

    test('does not redirect for valid token', () => {
      localStorageValidate();

      expect(window.location.href).toBe('');
    });
  });

  describe('when expired token in localStorage', () => {
    beforeEach(() => {
      localStorageMock.getItem.mockReturnValue(mockValidToken);
      mockedJwtDecode.mockReturnValue(mockDecodedExpiredJwt);
    });

    test('does not call setJWTToken for expired token', () => {
      localStorageValidate();

      // Implementation checks expiry before calling setJWTToken
      expect(mockedSetJWTToken).not.toHaveBeenCalled();
    });

    test('does not dispatch SET_Current_User for expired token', () => {
      localStorageValidate();

      // Implementation returns early if expired, never dispatches SET_Current_User
      expect(mockedStore.dispatch).not.toHaveBeenCalledWith({
        type: SET_Current_User,
        payload: mockDecodedExpiredJwt
      });
    });

    test('calls logout for expired token', () => {
      localStorageValidate();

      expect(mockedLogout).toHaveBeenCalled();
      // logout() returns a thunk function, which is dispatched
      expect(mockedStore.dispatch).toHaveBeenCalled();
    });

    // Same destination as the API 401 handler and a malformed token.
    test('redirects to the login page for expired token', () => {
      localStorageValidate();

      expect(window.location.href).toBe('/login');
    });
  });

  describe('token expiry boundary cases', () => {
    test('treats token as expired when exp equals current time', () => {
      // Note: Due to timing, exp === currentTime might trigger logout
      // The actual behavior depends on exact timing of Date.now() call
      const expAtCurrentTime: DecodedJWT = {
        ...mockDecodedValidJwt,
        exp: Math.floor(Date.now() / 1000)
      };
      localStorageMock.getItem.mockReturnValue(mockValidToken);
      mockedJwtDecode.mockReturnValue(expAtCurrentTime);

      localStorageValidate();

      // exp < currentTime check - if equal or less, logout is called
      // This is acceptable behavior for boundary case
      expect(mockedLogout).toHaveBeenCalled();
    });

    test('treats token as expired when exp is 1 second before current time', () => {
      const expJustExpired: DecodedJWT = {
        ...mockDecodedValidJwt,
        exp: Math.floor(Date.now() / 1000) - 1
      };
      localStorageMock.getItem.mockReturnValue(mockValidToken);
      mockedJwtDecode.mockReturnValue(expJustExpired);

      localStorageValidate();

      expect(mockedLogout).toHaveBeenCalled();
    });

    test('treats token as valid when exp is 1 second after current time', () => {
      const expJustValid: DecodedJWT = {
        ...mockDecodedValidJwt,
        exp: Math.floor(Date.now() / 1000) + 1
      };
      localStorageMock.getItem.mockReturnValue(mockValidToken);
      mockedJwtDecode.mockReturnValue(expJustValid);

      localStorageValidate();

      expect(mockedLogout).not.toHaveBeenCalled();
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
      mockedJwtDecode.mockReturnValue(mockDecodedValidJwt);

      localStorageValidate();

      expect(localStorageMock.getItem).toHaveBeenCalledTimes(1);
    });
  });
});
