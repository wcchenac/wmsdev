import React, { ChangeEvent, FormEvent } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import QueryBoard from '../../../../../components/BO/Stock/QueryStock/QueryBoard';
import QueryBoardDetail from '../../../../../components/BO/Stock/QueryStock/QueryBoard_Detail';

// Both boards show "查無資料 + <product no>" when a query returns no stock.
// The product number shown must be the one that was queried, not whatever the
// user types into the search box afterwards.

vi.mock('../../../../../components/BO/Stock/Utilities/QueryProductInformation', () => ({
  default: function MockQueryProductInformation(props: {
    productNo: string;
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  }) {
    return (
      <form onSubmit={props.onSubmit} data-testid="query-form">
        <input data-testid="product-no-input" name="productNo" value={props.productNo} onChange={props.onChange} />
      </form>
    );
  },
}));

vi.mock('../../../../../components/BO/Stock/Utilities/QueryResponseWithNoStock', () => ({
  default: function MockQueryResponseWithNoStock(props: { productNo?: string }) {
    return <div data-testid="no-stock-response">{props.productNo}</div>;
  },
}));

vi.mock('@achmadk/react-loading-overlay', () => ({
  default: function MockLoadingOverlay({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>;
  },
}));

const mockQuery = vi.fn();
vi.mock('../../../../../actions/StockActions', () => ({
  getStockInfoesBasic: (productNo: string) => () => mockQuery(productNo),
  getStockInfoes: (productNo: string) => () => mockQuery(productNo),
}));

const mockStore = configureMockStore([thunk]);

// The store holds no product information, so nothing overwrites the queried value.
const renderBoard = (Board: React.ComponentType) =>
  render(
    <Provider
      store={mockStore({
        stockInfo: {
          stockInfoes: { information: { productNo: null }, result: [], prevProduct: '', nextProduct: '', productList: [] },
        },
      })}
    >
      <Board />
    </Provider>
  );

const query = async (value: string) => {
  fireEvent.change(screen.getByTestId('product-no-input'), { target: { value, name: 'productNo' } });
  await act(async () => {
    fireEvent.submit(screen.getByTestId('query-form'));
  });
};

describe.each([
  ['QueryBoard (/stock/2/1)', QueryBoard],
  ['QueryBoardDetail (/stock/2/2)', QueryBoardDetail],
])('%s no-stock message', (_name, Board) => {
  beforeEach(() => {
    mockQuery.mockReset();
    mockQuery.mockResolvedValue({ status: 200 });
  });

  test('shows the queried product number', async () => {
    renderBoard(Board);
    await query('CF1003');
    expect(screen.getByTestId('no-stock-response')).toHaveTextContent('CF1003');
  });

  test('keeps the queried product number while the user types', async () => {
    renderBoard(Board);
    await query('CF1003');

    fireEvent.change(screen.getByTestId('product-no-input'), { target: { value: 'CF9999', name: 'productNo' } });

    expect(screen.getByTestId('no-stock-response')).toHaveTextContent('CF1003');
  });

  test('switches to the new product number after the next query', async () => {
    renderBoard(Board);
    await query('CF1003');
    await query('CF9999');

    expect(screen.getByTestId('no-stock-response')).toHaveTextContent('CF9999');
  });
});
