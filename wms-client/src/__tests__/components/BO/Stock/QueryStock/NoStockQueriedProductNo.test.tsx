import React, { ChangeEvent, FormEvent } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createMockStore } from '../../../../helpers/mockStore';
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

const mockStore = createMockStore;

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

  test('clears previous product stock when a later query returns no stock (C-4)', async () => {
    const validStore = mockStore({
      stockInfo: {
        stockInfoes: {
          information: { productNo: 'CF1001' },
          result: [{ id: 1, stockIdentifier: { id: 1, productNo: 'CF1001', lotNo: 'LOT-VALID', type: '板卷', quantity: 10, unit: '碼' } }],
          prevProduct: 'CF1000',
          nextProduct: 'CF1002',
          productList: [{ type: '板卷', quantity: 10, unit: '碼' }],
        },
      },
    });
    const emptyStore = mockStore({
      stockInfo: {
        stockInfoes: { information: { productNo: null }, result: [], prevProduct: '', nextProduct: '', productList: [] },
      },
    });

    const { rerender } = render(
      <Provider store={validStore}>
        <Board />
      </Provider>
    );
    await query('CF1001');
    rerender(
      <Provider store={validStore}>
        <Board />
      </Provider>
    );
    // Simulate new stockInfoes arriving after mount
    const validStore2 = mockStore({
      stockInfo: {
        stockInfoes: {
          information: { productNo: 'CF1001' },
          result: [{ id: 1, stockIdentifier: { id: 1, productNo: 'CF1001', lotNo: 'LOT-VALID', type: '板卷', quantity: 10, unit: '碼' } }],
          prevProduct: 'CF1000',
          nextProduct: 'CF1002',
          productList: [{ type: '板卷', quantity: 10, unit: '碼' }],
        },
      },
    });
    rerender(
      <Provider store={validStore2}>
        <Board />
      </Provider>
    );
    expect(screen.getByText('LOT-VALID')).toBeInTheDocument();

    await query('CF9999');
    rerender(
      <Provider store={emptyStore}>
        <Board />
      </Provider>
    );

    expect(screen.queryByText('LOT-VALID')).not.toBeInTheDocument();
    expect(screen.getByTestId('no-stock-response')).toHaveTextContent('CF9999');
  });
});
