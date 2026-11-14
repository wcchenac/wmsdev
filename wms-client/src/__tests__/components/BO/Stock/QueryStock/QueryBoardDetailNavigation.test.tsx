import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import { thunk } from 'redux-thunk';
import rootReducer from '../../../../../reducers';
import { GET_StockInfoes } from '../../../../../types';
import QueryBoardDetail from '../../../../../components/BO/Stock/QueryStock/QueryBoard_Detail';

// /stock/2/2 shows the advanced product information (supplier, cost, ...), which only
// the full query (/api/stock/queryStock/query/1/...) returns. Navigating with
// 上一筆 / 下一筆 must use that same query, not the basic one (/query/2/...).

vi.mock('@achmadk/react-loading-overlay', () => ({
  default: function MockLoadingOverlay({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>;
  },
}));

const mockGetStockInfoes = vi.fn();
const mockGetStockInfoesBasic = vi.fn();
vi.mock('../../../../../actions/StockActions', () => ({
  getStockInfoes: (productNo: string) => () => mockGetStockInfoes(productNo),
  getStockInfoesBasic: (productNo: string) => () => mockGetStockInfoesBasic(productNo),
}));

// The page only shows a query result that arrives while it is mounted, so the result
// for CF1001 is dispatched after the first render.
const renderDetail = () => {
  const store = createStore(rootReducer, applyMiddleware(thunk));
  render(
    <Provider store={store}>
      <QueryBoardDetail />
    </Provider>
  );
  act(() => {
    store.dispatch({
      type: GET_StockInfoes,
      payload: {
        information: { productNo: 'CF1001' },
        result: [],
        prevProduct: 'CF1000',
        nextProduct: 'CF1002',
        productList: [],
      },
    });
  });
};

describe('QueryBoardDetail prev/next navigation', () => {
  beforeEach(() => {
    mockGetStockInfoes.mockReset().mockResolvedValue({ status: 200 });
    mockGetStockInfoesBasic.mockReset().mockResolvedValue({ status: 200 });
  });

  test.each([
    ['下一筆', 'CF1002'],
    ['上一筆', 'CF1000'],
  ])('%s queries %s with the full (detail) query', async (label, productNo) => {
    renderDetail();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: new RegExp(label) }));
    });

    expect(mockGetStockInfoes).toHaveBeenCalledWith(productNo);
    expect(mockGetStockInfoesBasic).not.toHaveBeenCalled();
  });
});
