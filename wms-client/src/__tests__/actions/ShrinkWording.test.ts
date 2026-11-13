import { Middleware, UnknownAction, applyMiddleware, createStore } from 'redux';
import { thunk } from 'redux-thunk';
import rootReducer from '../../reducers';
import API from '../../utilities/API';
import {
  batchCreateStockInfoesForShrink,
  getShrinkList,
  stockIdentifierWaitToShrinkIsFalse,
  stockIdentifierWaitToShrinkIsTrue,
} from '../../actions/StockActions';
import { GET_Errors, SHRINK_Errors, ShrinkStockRequest } from '../../types';

// The pages call this feature 減肥 (減肥清單, 取消減肥, 減肥回朔), so the actions' fallback
// messages for a failure without a body use the same word.

vi.mock('../../utilities/API', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
}));

// A real store that also records every action it receives.
const makeStore = () => {
  const actions: UnknownAction[] = [];
  const record: Middleware = () => (next) => (action) => {
    actions.push(action as UnknownAction);
    return next(action);
  };
  return { store: createStore(rootReducer, applyMiddleware(thunk, record)), actions };
};

const noAnswer = () => Object.assign(new Error('Network Error'), { code: 'ERR_NETWORK' });

describe('shrink action messages', () => {
  test.each([
    ['getShrinkList', () => getShrinkList(), GET_Errors, '無法取得減肥清單'],
    ['stockIdentifierWaitToShrinkIsTrue', () => stockIdentifierWaitToShrinkIsTrue(7), GET_Errors, '設定待減肥失敗'],
    ['stockIdentifierWaitToShrinkIsFalse', () => stockIdentifierWaitToShrinkIsFalse(7), GET_Errors, '取消待減肥失敗'],
    [
      'batchCreateStockInfoesForShrink',
      () => batchCreateStockInfoesForShrink({} as ShrinkStockRequest),
      SHRINK_Errors,
      '減肥入庫失敗',
    ],
  ] as const)('%s says 減肥 when the failure has no body', async (_name, action, type, message) => {
    for (const method of ['get', 'post', 'patch'] as const) {
      vi.mocked(API[method]).mockReset().mockRejectedValue(noAnswer());
    }
    const { store, actions } = makeStore();

    await store.dispatch(action()).catch(() => undefined);

    expect(actions).toContainEqual({ type, payload: { message } });
    expect(JSON.stringify(actions)).not.toMatch(/縮碼/);
  });
});
