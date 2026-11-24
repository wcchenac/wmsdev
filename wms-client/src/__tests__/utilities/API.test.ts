import { AxiosError, AxiosHeaders, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'react-toastify';
import API, { SESSION_EXPIRED_MESSAGE, SESSION_EXPIRED_REDIRECT_DELAY_MS } from '../../utilities/API';
import { DuplicateRequestError, isDuplicateRequest } from '../../utilities/requestDedup';
import store from '../../store';
import { SET_Current_User } from '../../types';

// A 401 in the middle of a session means the JWT expired. The user is told why before the page
// moves to /login, instead of being reloaded there with no explanation.

vi.mock('react-toastify', () => ({ toast: { error: vi.fn() } }));

type RejectedHandler = (error: unknown) => Promise<never>;
const onRejected = (API.interceptors.response as unknown as {
  handlers: { rejected: RejectedHandler }[];
}).handlers[0].rejected;

const httpError = (status: number, url = '/api/stock/query') => {
  const config = { url, headers: new AxiosHeaders() } as InternalAxiosRequestConfig;
  return new AxiosError('failed', String(status), config, null, {
    status,
    statusText: '',
    headers: {},
    config,
    data: {},
  });
};

const getItem = vi.mocked(window.localStorage.getItem);
const removeItem = vi.mocked(window.localStorage.removeItem);

beforeEach(() => {
  vi.useFakeTimers();
  window.location.href = '';
  vi.mocked(toast.error).mockReset();
  API.defaults.headers.common.Authorization = 'Bearer old-token';
});

afterEach(() => {
  // Let a scheduled redirect run so the next test starts with none pending.
  vi.runAllTimers();
  vi.useRealTimers();
  delete API.defaults.headers.common.Authorization;
});

describe('API 401 handling', () => {
  test('with a stored token: clears it, shows the message, then goes to /login', async () => {
    getItem.mockReturnValue('Bearer old-token');
    const error = httpError(401);

    await expect(onRejected(error)).rejects.toBe(error);

    expect(removeItem).toHaveBeenCalledWith('jwtToken');
    expect(API.defaults.headers.common.Authorization).toBeUndefined();
    expect(toast.error).toHaveBeenCalledWith(SESSION_EXPIRED_MESSAGE, expect.objectContaining({ toastId: 'session-expired' }));
    expect(SESSION_EXPIRED_MESSAGE).toBe('登入已逾時，請重新登入');

    // The redirect waits so the message can be read.
    expect(window.location.href).toBe('');
    vi.advanceTimersByTime(SESSION_EXPIRED_REDIRECT_DELAY_MS);
    expect(window.location.href).toBe('/login');
  });

  test('clears Redux current user state on 401 so protected routes redirect immediately', async () => {
    store.dispatch({
      type: SET_Current_User,
      payload: { employeeId: 'E001', role: { authority: 'ROLE_Admin' } },
    });
    expect(store.getState().user.validToken).toBe(true);

    await expect(onRejected(httpError(401))).rejects.toBeInstanceOf(AxiosError);

    expect(store.getState().user.validToken).toBe(false);
    expect(store.getState().user.user).toEqual({});
  });

  test('several failing requests show one message and schedule one redirect', async () => {
    getItem.mockReturnValueOnce('Bearer old-token').mockReturnValue(null);

    await Promise.allSettled([onRejected(httpError(401)), onRejected(httpError(401)), onRejected(httpError(401))]);

    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(1);
  });

  test('without a stored token (e.g. signed out in another tab) the user is still told and sent to /login', async () => {
    // Pages leave every 401 to this handler, so it must not stay silent here.
    getItem.mockReturnValue(null);

    await expect(onRejected(httpError(401))).rejects.toBeInstanceOf(AxiosError);

    expect(API.defaults.headers.common.Authorization).toBeUndefined();
    expect(toast.error).toHaveBeenCalledWith(SESSION_EXPIRED_MESSAGE, expect.objectContaining({ toastId: 'session-expired' }));
    vi.advanceTimersByTime(SESSION_EXPIRED_REDIRECT_DELAY_MS);
    expect(window.location.href).toBe('/login');
  });

  test('several failing requests without a stored token also show one message and schedule one redirect', async () => {
    getItem.mockReturnValue(null);

    await Promise.allSettled([onRejected(httpError(401)), onRejected(httpError(401))]);

    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(1);
  });

  test('a 401 after the redirect has fired shows the message and redirects again', async () => {
    // The page normally reloads at /login; if it does not (the navigation was blocked or
    // cancelled), a later 401 must not be ignored.
    getItem.mockReturnValue('Bearer old-token');
    await onRejected(httpError(401)).catch(() => undefined);
    vi.advanceTimersByTime(SESSION_EXPIRED_REDIRECT_DELAY_MS);
    window.location.href = '';
    vi.mocked(toast.error).mockClear();

    await onRejected(httpError(401)).catch(() => undefined);

    expect(toast.error).toHaveBeenCalledWith(SESSION_EXPIRED_MESSAGE, expect.objectContaining({ toastId: 'session-expired' }));
    expect(vi.getTimerCount()).toBe(1);
    vi.advanceTimersByTime(SESSION_EXPIRED_REDIRECT_DELAY_MS);
    expect(window.location.href).toBe('/login');
  });

  test('a rejected login (wrong password) is left to the login form', async () => {
    getItem.mockReturnValue(null);

    await expect(onRejected(httpError(401, '/api/user/login'))).rejects.toBeInstanceOf(AxiosError);

    expect(toast.error).not.toHaveBeenCalled();
    vi.runAllTimers();
    expect(window.location.href).toBe('');
  });

  test('other errors are passed on without a redirect', async () => {
    getItem.mockReturnValue('Bearer old-token');

    await expect(onRejected(httpError(500))).rejects.toBeInstanceOf(AxiosError);

    expect(removeItem).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
    vi.runAllTimers();
    expect(window.location.href).toBe('');
  });
});

describe('API concurrent write deduplication', () => {
  const originalAdapter = API.defaults.adapter;

  afterEach(() => {
    API.defaults.adapter = originalAdapter;
  });

  test('blocks identical in-flight POST/PATCH/PUT/DELETE requests and releases after settlement', async () => {
    let resolveFirst!: (res: { status: number; data: unknown; statusText: string; headers: Record<string, string>; config: InternalAxiosRequestConfig }) => void;
    const adapter = vi.fn(
      (config: InternalAxiosRequestConfig) =>
        new Promise<{ status: number; data: unknown; statusText: string; headers: Record<string, string>; config: InternalAxiosRequestConfig }>(
          (resolve) => {
            resolveFirst = resolve;
          }
        )
    );
    API.defaults.adapter = adapter as unknown as typeof API.defaults.adapter;

    const first = API.post('/api/stock/inStocks', [{ productNo: 'CF1001', quantity: 10 }]);
    const duplicate = API.post('/api/stock/inStocks', [{ productNo: 'CF1001', quantity: 10 }]);

    await expect(duplicate).rejects.toBeInstanceOf(DuplicateRequestError);
    expect(adapter).toHaveBeenCalledTimes(1);

    resolveFirst({
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { headers: new AxiosHeaders() } as InternalAxiosRequestConfig,
      data: { ok: true },
    });
    await expect(first).resolves.toMatchObject({ status: 200 });

    // Once the first request settles, a subsequent identical submission is allowed again.
    const next = API.post('/api/stock/inStocks', [{ productNo: 'CF1001', quantity: 10 }]);
    expect(adapter).toHaveBeenCalledTimes(2);
    resolveFirst({
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { headers: new AxiosHeaders() } as InternalAxiosRequestConfig,
      data: { ok: true },
    });
    await expect(next).resolves.toMatchObject({ status: 200 });
  });

  test('allows concurrent writes with different payloads and concurrent GETs', async () => {
    const adapter = vi.fn(async (config: InternalAxiosRequestConfig) => ({
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
      data: {},
    }));
    API.defaults.adapter = adapter as unknown as typeof API.defaults.adapter;

    await Promise.all([
      API.patch('/api/stock/shipStock', { stockIdentifierId: 1, reason: '中壢' }),
      API.patch('/api/stock/shipStock', { stockIdentifierId: 2, reason: '中壢' }),
      API.get('/api/stock/queryStock/query/1/CF1001'),
      API.get('/api/stock/queryStock/query/1/CF1001'),
    ]);

    expect(adapter).toHaveBeenCalledTimes(4);
  });

  test('releases the lock if the in-flight write fails', async () => {
    const adapter = vi
      .fn()
      .mockRejectedValueOnce(httpError(500, '/api/user/delete'))
      .mockResolvedValueOnce({
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: new AxiosHeaders() } as InternalAxiosRequestConfig,
        data: {},
      });
    API.defaults.adapter = adapter as unknown as typeof API.defaults.adapter;

    await expect(API.delete('/api/user/adminManagement/user/delete?employeeId=E001')).rejects.toThrow();
    await expect(API.delete('/api/user/adminManagement/user/delete?employeeId=E001')).resolves.toMatchObject({
      status: 200,
    });
    expect(adapter).toHaveBeenCalledTimes(2);
    expect(isDuplicateRequest(new DuplicateRequestError())).toBe(true);
  });
});
