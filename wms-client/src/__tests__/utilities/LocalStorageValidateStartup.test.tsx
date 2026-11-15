import localStorageValidate from '../../utilities/LocalStorageValidate';
import setJWTToken from '../../utilities/SetJWTToken';
import store from '../../store';
import { logout } from '../../actions/UserActions';
import { jwtDecode } from 'jwt-decode';

// A token whose exp is now is expired. On /login an expired or broken token is just
// cleared: reloading /login again would only repeat the same page. (When the check runs:
// AppStartup.test.tsx.)

vi.mock('../../utilities/SetJWTToken');
vi.mock('jwt-decode', () => ({ jwtDecode: vi.fn() }));
vi.mock('../../store', () => ({ default: { dispatch: vi.fn() } }));
vi.mock('../../actions/UserActions', () => ({ logout: vi.fn(() => ({ type: 'LOGOUT' })) }));

const NOW_SECONDS = 1_763_000_000;

const setPath = (pathname: string) => {
  Object.defineProperty(window, 'location', {
    value: { href: '', pathname, assign: vi.fn(), search: '', hash: '' },
    configurable: true,
    writable: true,
  });
};

beforeEach(() => {
  vi.mocked(store.dispatch).mockReset();
  vi.mocked(logout).mockClear();
  vi.mocked(setJWTToken).mockReset();
  vi.mocked(window.localStorage.getItem).mockReset().mockReturnValue('token');
  vi.mocked(window.localStorage.removeItem).mockReset();
  vi.useFakeTimers();
  vi.setSystemTime(NOW_SECONDS * 1000); // exactly on a whole second
  setPath('/stock/2/2');
});

afterEach(() => {
  vi.useRealTimers();
});

describe('localStorageValidate', () => {
  test('a token whose exp is this very second is expired', () => {
    vi.mocked(jwtDecode).mockReturnValue({ exp: NOW_SECONDS, employeeId: 'E001' });

    localStorageValidate();

    expect(logout).toHaveBeenCalled();
    expect(setJWTToken).not.toHaveBeenCalled();
    expect(window.location.href).toBe('/login');
  });

  test('a token valid for one more second is used', () => {
    vi.mocked(jwtDecode).mockReturnValue({ exp: NOW_SECONDS + 1, employeeId: 'E001' });

    localStorageValidate();

    expect(logout).not.toHaveBeenCalled();
    expect(setJWTToken).toHaveBeenCalledWith('token');
  });

  test('on /login an expired token is cleared without reloading the page', () => {
    setPath('/login');
    vi.mocked(jwtDecode).mockReturnValue({ exp: NOW_SECONDS - 60, employeeId: 'E001' });

    localStorageValidate();

    expect(logout).toHaveBeenCalled();
    expect(window.location.href).toBe('');
  });

  test('on /login a broken token is cleared without reloading the page', () => {
    setPath('/login');
    vi.mocked(jwtDecode).mockImplementation(() => {
      throw new Error('bad token');
    });

    localStorageValidate();

    expect(window.localStorage.removeItem).toHaveBeenCalledWith('jwtToken');
    expect(window.location.href).toBe('');
  });
});
