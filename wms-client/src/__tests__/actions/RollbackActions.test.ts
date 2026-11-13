import { applyMiddleware, createStore } from 'redux';
import { thunk } from 'redux-thunk';
import rootReducer from '../../reducers';
import API from '../../utilities/API';
import { getInStockRollbackList, getShrinkRollbackList, inStockRollback, shrinkRollback } from '../../actions/StockActions';
import * as rollbackRequest from '../../utilities/rollbackRequest';
import {
  ROLLBACK_DONE_NOT_REFRESHED_MESSAGE,
  ROLLBACK_REJECTED_MESSAGE,
  ROLLBACK_REJECTED_NOT_REFRESHED_MESSAGE,
  ROLLBACK_UNCONFIRMED_MESSAGE,
  ROLLBACK_UNCONFIRMED_NOT_REFRESHED_MESSAGE,
  RollbackError,
} from '../../utilities/rollbackRequest';

// Rollbacks are all-or-nothing on the backend: when one id is gone or the roll was never
// shrunk, it answers 400 with no body and changes nothing. The list on screen is then stale,
// so the action queries it again whether the rollback went through or not, and tells the page
// what happened.

vi.mock('../../utilities/API', () => ({
  default: { get: vi.fn(), patch: vi.fn() },
}));

const httpError = (status: number) =>
  Object.assign(new Error(`Request failed with status code ${status}`), { response: { status, data: '' } });
const networkError = () => Object.assign(new Error('timeout of 30000ms exceeded'), { code: 'ECONNABORTED' });

const freshList = { CF1001: [{ id: 9 }] };

const makeStore = () => createStore(rootReducer, applyMiddleware(thunk));

const cases = [
  [
    '入庫回朔 (inStockRollback)',
    () => inStockRollback([1, 2], 'normal', 'IN001'),
    '/api/stock/queryStock/inStockRollback?orderType=normal&orderNo=IN001',
  ],
  [
    '減肥回朔 (shrinkRollback)',
    () => shrinkRollback(7, 'CF1001'),
    '/api/stock/queryStock/shrinkRollback/CF1001',
  ],
] as const;

describe.each(cases)('%s', (_name, rollback, listUrl) => {
  beforeEach(() => {
    vi.mocked(API.patch).mockReset().mockResolvedValue({ status: 200, data: '' });
    vi.mocked(API.get).mockReset().mockResolvedValue({ status: 200, data: freshList });
  });

  const run = (store = makeStore()) => store.dispatch(rollback());

  test('a successful rollback queries the list again and returns it', async () => {
    const store = makeStore();

    await expect(run(store)).resolves.toMatchObject({ status: 200 });

    expect(API.get).toHaveBeenCalledWith(listUrl);
    expect(store.getState().stockInfo.stockInfoes).toEqual(freshList);
  });

  test('a rejected rollback (400) still queries the list again and says nothing changed', async () => {
    vi.mocked(API.patch).mockRejectedValue(httpError(400));
    const store = makeStore();

    const error = await run(store).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(RollbackError);
    expect((error as RollbackError).message).toBe(ROLLBACK_REJECTED_MESSAGE);
    expect(API.get).toHaveBeenCalledWith(listUrl);
    expect(store.getState().stockInfo.stockInfoes).toEqual(freshList);
  });

  test('a rejected rollback whose list query also fails says so', async () => {
    vi.mocked(API.patch).mockRejectedValue(httpError(400));
    vi.mocked(API.get).mockRejectedValue(httpError(500));

    const error = await run().catch((e: unknown) => e);

    expect(error).toBeInstanceOf(RollbackError);
    expect((error as RollbackError).message).toBe(ROLLBACK_REJECTED_NOT_REFRESHED_MESSAGE);
  });

  test.each([
    ['a server error (500)', 500],
    ['a gateway timeout (504)', 504],
    ['a 403', 403],
  ])('%s is not reported as 「沒有任何變更」', async (_name, status) => {
    // Only the backend's all-or-nothing 400 means nothing changed.
    vi.mocked(API.patch).mockRejectedValue(httpError(status));

    const error = await run().catch((e: unknown) => e);

    expect((error as RollbackError).message).toBe(ROLLBACK_UNCONFIRMED_MESSAGE);
    expect(API.get).toHaveBeenCalledWith(listUrl);
  });

  test('a 500 whose list query also fails asks to query again', async () => {
    vi.mocked(API.patch).mockRejectedValue(httpError(500));
    vi.mocked(API.get).mockRejectedValue(httpError(500));

    const error = await run().catch((e: unknown) => e);

    expect((error as RollbackError).message).toBe(ROLLBACK_UNCONFIRMED_NOT_REFRESHED_MESSAGE);
  });

  test('a rollback with no answer (timeout) does not claim nothing changed', async () => {
    vi.mocked(API.patch).mockRejectedValue(networkError());

    const error = await run().catch((e: unknown) => e);

    expect((error as RollbackError).message).toBe(ROLLBACK_UNCONFIRMED_MESSAGE);
    expect(API.get).toHaveBeenCalledWith(listUrl);
  });

  test('a rollback with no answer whose list query also fails asks to query again', async () => {
    vi.mocked(API.patch).mockRejectedValue(networkError());
    vi.mocked(API.get).mockRejectedValue(networkError());

    const error = await run().catch((e: unknown) => e);

    expect((error as RollbackError).message).toBe(ROLLBACK_UNCONFIRMED_NOT_REFRESHED_MESSAGE);
  });

  test('a successful rollback whose list query fails says the rollback went through', async () => {
    vi.mocked(API.get).mockRejectedValue(httpError(500));

    const error = await run().catch((e: unknown) => e);

    expect((error as RollbackError).message).toBe(ROLLBACK_DONE_NOT_REFRESHED_MESSAGE);
  });

  test('a 401 is passed on as is for the session-expired handling, without a list query', async () => {
    const expired = httpError(401);
    vi.mocked(API.patch).mockRejectedValue(expired);

    await expect(run()).rejects.toBe(expired);
    expect(API.get).not.toHaveBeenCalled();
  });
});

// The pages are called 入庫回朔 and 減肥回朔, so their messages say 回朔 too.
describe('rollback wording', () => {
  test('the 「cannot confirm」 messages do not blame the connection (they also cover 5xx)', () => {
    expect(ROLLBACK_UNCONFIRMED_MESSAGE).not.toMatch(/連線/);
    expect(ROLLBACK_UNCONFIRMED_NOT_REFRESHED_MESSAGE).not.toMatch(/連線/);
  });

  test('every rollback message says 回朔', () => {
    const messages = Object.entries(rollbackRequest)
      .filter(([name]) => name.endsWith('_MESSAGE'))
      .map(([, value]) => value as string);

    expect(messages).toHaveLength(5);
    for (const message of messages) {
      expect(message).toMatch(/回朔/);
      expect(message).not.toMatch(/回滾/);
    }
  });

  test.each([
    ['inStockRollback', () => inStockRollback([1], 'normal', 'IN001'), '入庫回朔失敗'],
    ['shrinkRollback', () => shrinkRollback(7, 'CF1001'), '縮碼回朔失敗'],
    ['getInStockRollbackList', () => getInStockRollbackList('normal', 'IN001'), '無法取得入庫回朔列表'],
    ['getShrinkRollbackList', () => getShrinkRollbackList('CF1001'), '無法取得縮碼回朔列表'],
  ] as const)('%s stores its message when the failure has no body', async (_name, action, message) => {
    vi.mocked(API.patch).mockReset().mockRejectedValue(networkError());
    vi.mocked(API.get).mockReset().mockRejectedValue(networkError());
    const store = makeStore();

    await store.dispatch(action()).catch(() => undefined);

    expect(store.getState().errors.errors).toEqual({ message });
  });
});
