import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import { thunk } from 'redux-thunk';
import rootReducer from '../../../../reducers';
import { GET_Order, GET_StockInfoes } from '../../../../types';
import NormalStockBoard from '../../../../components/BO/Stock/InStock/NormalStockBoard';
import AssembleStockBoard from '../../../../components/BO/Stock/InStock/AssembleStockBoard';
import CustomerReturnBoard from '../../../../components/BO/Stock/InStock/CustomerReturnBoard';
import StoreReturnBoard from '../../../../components/BO/Stock/InStock/StoreReturnBoard';
import StockHistoryBoard from '../../../../components/BO/Stock/StockHistory/StockHistoryBoard';
import QueryBoard from '../../../../components/BO/Stock/QueryStock/QueryBoard';
import QueryBoardDetail from '../../../../components/BO/Stock/QueryStock/QueryBoard_Detail';
import ModifyBoard from '../../../../components/BO/Stock/ModifyStock/ModifyBoard/ModifyBoard';
import ShrinkBoard from '../../../../components/BO/Stock/ModifyStock/ShrinkBoard/ShrinkBoard';
import QueryOutStockToStore from '../../../../components/BO/Stock/QueryStock/QueryOutStockToStore';
import InStockRollback from '../../../../components/BO/User/AdminPlatform/InStockRollback/InStockRollback';

// Every query page shares state.stockInfo.stockInfoes. A page must only react to results that
// arrive while it is mounted (dev's componentDidUpdate), never to whatever another page left in
// the slice before it mounted.

vi.mock('../../../../utilities/API', () => {
  const pending = () => new Promise(() => undefined);
  return { default: { get: vi.fn(pending), post: vi.fn(pending), put: vi.fn(pending), delete: vi.fn(pending) } };
});

const makeStore = () => createStore(rootReducer, applyMiddleware(thunk));
type Store = ReturnType<typeof makeStore>;

const renderPage = (Page: React.ComponentType, store: Store) =>
  render(
    <Provider store={store}>
      <Page />
    </Provider>
  );

// What an in-stock order query (GET_Order) leaves in the slice.
const orderPayload = {
  currentStatus: { P1: { 板卷: { quantity: '40.00', unit: '碼' } } },
  waitHandleStatus: { P1: { 板卷: { quantity: '40.00', unit: '碼' } } },
};

// What a product query (GET_StockInfoes) leaves in the slice.
const productQueryPayload = {
  information: { productNo: 'CF1001' },
  result: [],
  prevProduct: 'CF1000',
  nextProduct: 'CF1002',
  productList: [],
};

const activeStep = (container: HTMLElement) =>
  container.querySelector('.nav-link.active')?.textContent ?? '';

describe.each([
  ['進貨單入庫 (NormalStockBoard)', NormalStockBoard, '進貨單'],
  ['組裝單入庫 (AssembleStockBoard)', AssembleStockBoard, '組裝單'],
  ['退貨單入庫 (CustomerReturnBoard)', CustomerReturnBoard, '退貨單'],
  ['調撥單入庫 (StoreReturnBoard)', StoreReturnBoard, '調撥單'],
])('%s', (_name, Board, orderType) => {
  test('a fresh page does not say the order was not found', () => {
    renderPage(Board, makeStore());
    expect(screen.queryByText(`查無${orderType} 或 ${orderType}內沒有需要入庫的貨號`)).not.toBeInTheDocument();
  });

  test('an order another page left in the store is ignored', () => {
    const store = makeStore();
    store.dispatch({ type: GET_Order, payload: orderPayload });

    const { container } = renderPage(Board, store);

    expect(activeStep(container)).toContain('Step 1');
    expect(screen.queryByText(`查無${orderType} 或 ${orderType}內沒有需要入庫的貨號`)).not.toBeInTheDocument();
  });

  test('an order that arrives after mount still moves on to Step 2', () => {
    const store = makeStore();
    const { container } = renderPage(Board, store);

    act(() => {
      store.dispatch({ type: GET_Order, payload: orderPayload });
    });

    expect(activeStep(container)).toContain('Step 2');
  });
});

describe('歷史記錄查詢 (StockHistoryBoard)', () => {
  test('a product query left in the store does not crash the page', () => {
    const store = makeStore();
    store.dispatch({ type: GET_StockInfoes, payload: productQueryPayload });

    expect(() => renderPage(StockHistoryBoard, store)).not.toThrow();
    expect(screen.getByPlaceholderText('請輸入貨號進行搜尋...')).toBeInTheDocument();
  });

  test('a non-array result after mount is ignored instead of crashing', () => {
    const store = makeStore();
    renderPage(StockHistoryBoard, store);

    expect(() =>
      act(() => {
        store.dispatch({ type: GET_StockInfoes, payload: productQueryPayload });
      })
    ).not.toThrow();
  });
});

describe.each([
  ['庫存查詢 (QueryBoard)', QueryBoard],
  ['庫存查詢 (QueryBoardDetail)', QueryBoardDetail],
  ['庫存異動 (ModifyBoard)', ModifyBoard],
])('%s', (_name, Page) => {
  test('the product number from an earlier query is not pre-filled', () => {
    const store = makeStore();
    store.dispatch({ type: GET_StockInfoes, payload: productQueryPayload });

    const { container } = renderPage(Page, store);

    expect(container.querySelector<HTMLInputElement>('input[name=productNo]')!.value).toBe('');
  });

  test('a query result that arrives after mount is shown', () => {
    const store = makeStore();
    const { container } = renderPage(Page, store);

    act(() => {
      store.dispatch({ type: GET_StockInfoes, payload: productQueryPayload });
    });

    expect(container.querySelector<HTMLInputElement>('input[name=productNo]')!.value).toBe('CF1001');
  });
});

describe('減肥清單 (ShrinkBoard)', () => {
  const leftover = [{ id: 7, stockIdentifier: { id: 7, productNo: 'LEFTOVER-1', lotNo: 'L1', type: '板卷', quantity: 1, unit: '碼' } }];

  test('a list another page left in the store is not shown as the shrink list', () => {
    const store = makeStore();
    store.dispatch({ type: GET_StockInfoes, payload: leftover });

    renderPage(ShrinkBoard, store);

    expect(screen.queryByText('LEFTOVER-1')).not.toBeInTheDocument();
  });

  test('a shrink list that arrives after mount is shown', () => {
    const store = makeStore();
    renderPage(ShrinkBoard, store);

    act(() => {
      store.dispatch({ type: GET_StockInfoes, payload: leftover });
    });

    expect(screen.getByText('LEFTOVER-1')).toBeInTheDocument();
  });
});

describe('出庫單查詢 (QueryOutStockToStore)', () => {
  test('rows another page left in the store are not shown', () => {
    const store = makeStore();
    store.dispatch({ type: GET_StockInfoes, payload: [{ productNo: 'LEFTOVER-2', quantity: '1', unit: '碼' }] });

    renderPage(QueryOutStockToStore, store);

    expect(screen.queryByText('LEFTOVER-2')).not.toBeInTheDocument();
  });
});

describe('入庫回朔 (InStockRollback)', () => {
  test('a result another page left in the store is not shown', () => {
    const store = makeStore();
    store.dispatch({ type: GET_StockInfoes, payload: { 'LEFTOVER-3': [] } });

    renderPage(InStockRollback, store);

    expect(screen.queryByText('LEFTOVER-3')).not.toBeInTheDocument();
  });
});
