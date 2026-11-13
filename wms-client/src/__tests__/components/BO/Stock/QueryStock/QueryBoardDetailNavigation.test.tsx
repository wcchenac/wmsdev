import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import QueryBoardDetail from '../../../../../components/BO/Stock/QueryStock/QueryBoard_Detail';

// /stock/2/2 shows the advanced product information (supplier, cost, ...), which only
// the full query (/api/stock/queryStock/query/1/...) returns. Navigating with
// 上一筆 / 下一筆 must use that same query, not the basic one (/query/2/...).

vi.mock('react-loading-overlay-ts', () => ({
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

const mockStore = configureMockStore([thunk]);

const renderDetail = () =>
  render(
    <Provider
      store={mockStore({
        stockInfo: {
          stockInfoes: {
            information: { productNo: 'CF1001' },
            result: [],
            prevProduct: 'CF1000',
            nextProduct: 'CF1002',
            productList: [],
          },
        },
      })}
    >
      <QueryBoardDetail />
    </Provider>
  );

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
