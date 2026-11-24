import { AxiosError, AxiosHeaders, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'react-toastify';
import API, { SESSION_EXPIRED_MESSAGE, SESSION_EXPIRED_REDIRECT_DELAY_MS } from '../../utilities/API';
import store from '../../store';
import { SET_Current_User } from '../../types';
import {
  DuplicateRequestError,
  buildWriteRequestKey,
  isDuplicateRequest,
} from '../../utilities/requestDedup';

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

describe('API 401 handling', () => {
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

  test('blocks identical in-flight POST/PATCH/PUT/DELETE/request calls and releases after settlement', async () => {
    const resolvers: Array<() => void> = [];
    const adapter = vi.fn(
      (config: InternalAxiosRequestConfig) =>
        new Promise<{ status: number; data: unknown; statusText: string; headers: Record<string, string>; config: InternalAxiosRequestConfig }>(
          (resolve) => {
            resolvers.push(() =>
              resolve({ status: 200, statusText: 'OK', headers: {}, config, data: { ok: true } })
            );
          }
        )
    );
    API.defaults.adapter = adapter as unknown as typeof API.defaults.adapter;

    const first = API.post('/api/stock/inStocks', [{ productNo: 'CF1001', quantity: 10 }]);
    try {
      const duplicate = API.post('/api/stock/inStocks', [{ productNo: 'CF1001', quantity: 10 }]);
      await expect(duplicate).rejects.toBeInstanceOf(DuplicateRequestError);
      expect(adapter).toHaveBeenCalledTimes(1);
    } finally {
      resolvers.shift()?.();
      await expect(first).resolves.toMatchObject({ status: 200 });
    }

    // Exercise PUT, 2-arg API.request(url, config), callable API(config), and postForm.
    const putReq = API.put('/api/stock/item', { id: 1 });
    try {
      await expect(API.put('/api/stock/item', { id: 1 })).rejects.toBeInstanceOf(DuplicateRequestError);
      expect(adapter).toHaveBeenCalledTimes(2);
    } finally {
      resolvers.shift()?.();
      await expect(putReq).resolves.toMatchObject({ status: 200 });
    }

    const reqTwoArg = (
      API.request as unknown as (u: string, c: Record<string, unknown>) => Promise<unknown>
    )('/api/stock/item', { method: 'patch', data: { id: 2 } });
    try {
      await expect(API({ method: 'patch', url: '/api/stock/item', data: { id: 2 } })).rejects.toBeInstanceOf(
        DuplicateRequestError
      );
      expect(adapter).toHaveBeenCalledTimes(3);
    } finally {
      resolvers.shift()?.();
      await expect(reqTwoArg).resolves.toMatchObject({ status: 200 });
    }

    const fd1 = new FormData();
    fd1.append('files', new File(['a'], 'in.xlsx', { type: 'application/vnd.ms-excel', lastModified: 100 }));
    const fdDup = new FormData();
    fdDup.append('files', new File(['a'], 'in.xlsx', { type: 'application/vnd.ms-excel', lastModified: 100 }));
    const formReq = API.postForm('api/file/import/inStockFile', fd1);
    try {
      await expect(API.post('/api/file/import/inStockFile', fdDup)).rejects.toBeInstanceOf(
        DuplicateRequestError
      );
      expect(adapter).toHaveBeenCalledTimes(4);
    } finally {
      resolvers.shift()?.();
      await expect(formReq).resolves.toMatchObject({ status: 200 });
    }
  });

  test('allows concurrent writes with different payloads, blobs, and concurrent GETs', async () => {
    const adapter = vi.fn(async (config: InternalAxiosRequestConfig) => ({
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
      data: {},
    }));
    API.defaults.adapter = adapter as unknown as typeof API.defaults.adapter;

    const fdA = new FormData();
    fdA.append('blob', new Blob(['short']));
    const fdB = new FormData();
    fdB.append('blob', new Blob(['longer-payload']));

    await Promise.all([
      API.patch('/api/stock/shipStock', { stockIdentifierId: 1, reason: '中壢' }),
      API.patch('/api/stock/shipStock', { stockIdentifierId: 2, reason: '中壢' }),
      API.post('/api/file/import/inStockFile', fdA),
      API.post('/api/file/import/inStockFile', fdB),
      API.get('/api/stock/queryStock/query/1/CF1001'),
      API.get('/api/stock/queryStock/query/1/CF1001'),
    ]);

    expect(adapter).toHaveBeenCalledTimes(6);
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
  });
});

describe('requestDedup helpers', () => {
  test('normalizes URL slashes, query parameters, object key order, DAG references, and special types', () => {
    expect(
      buildWriteRequestKey({ method: 'post', baseURL: 'http://localhost:8080/', url: 'api/stock/test?b=2&a=1', data: { b: 2, a: 1 } })
    ).toBe(
      buildWriteRequestKey({ method: 'POST', baseURL: 'http://localhost:8080', url: '/api/stock/test?a=1&b=2', data: { a: 1, b: 2 } })
    );

    const shared = { x: 1 };
    expect(
      buildWriteRequestKey({ method: 'patch', url: '/api/test', data: { p: shared, q: shared } })
    ).toBe(
      buildWriteRequestKey({ method: 'patch', url: '/api/test', data: { p: { x: 1 }, q: { x: 1 } } })
    );

    // BigInt, invalid Date, protocol-relative URL never throw
    expect(
      buildWriteRequestKey({ method: 'post', url: '//cdn.example/api', data: { id: 10n, d: new Date(Number.NaN) } })
    ).toContain('BigInt(10)');

    // GET returns null; defaultMethod overrides when omitted
    expect(buildWriteRequestKey({ url: '/api/test' })).toBeNull();
    expect(buildWriteRequestKey({ url: '/api/test' }, 'post')).toContain('POST /api/test');

    expect(isDuplicateRequest(new DuplicateRequestError())).toBe(true);
    expect(isDuplicateRequest({ isDuplicateRequest: true })).toBe(true);
    expect(isDuplicateRequest(new Error('other'))).toBe(false);
    expect(isDuplicateRequest(null)).toBe(false);
  });
});
