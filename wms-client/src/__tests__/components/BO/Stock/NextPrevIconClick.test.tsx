import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore, Store } from 'redux';
import { thunk } from 'redux-thunk';
import rootReducer from '../../../../reducers';
import { GET_StockInfoes } from '../../../../types';
import ModifyBoard from '../../../../components/BO/Stock/ModifyStock/ModifyBoard/ModifyBoard';
import QueryBoard from '../../../../components/BO/Stock/QueryStock/QueryBoard';
import QueryBoardDetail from '../../../../components/BO/Stock/QueryStock/QueryBoard_Detail';

vi.mock('@achmadk/react-loading-overlay', () => ({
  default: function MockLoadingOverlay({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>;
  },
}));

const mockGetStockInfoes = vi.fn();
const mockGetStockInfoesBasic = vi.fn();
vi.mock('../../../../actions/StockActions', () => ({
  getStockInfoes: (productNo: string) => () => mockGetStockInfoes(productNo),
  getStockInfoesBasic: (productNo: string) => () => mockGetStockInfoesBasic(productNo),
  stockIdentifierIsShiped: () => () => Promise.resolve({ status: 200 }),
  stockIdentifiersAreShiped: () => () => Promise.resolve({ status: 200 }),
  stockIdentifierWaitToShrinkIsTrue: () => () => Promise.resolve({ status: 200 }),
  createOutStockRequest: () => () => Promise.resolve({ status: 200 }),
  updateStockInfo: () => () => Promise.resolve({ status: 200 }),
}));

const stockPayload = {
  information: { productNo: 'CF1001' },
  result: [],
  prevProduct: 'CF1000',
  nextProduct: 'CF1002',
  productList: [],
};

function renderBoard(Board: React.FC): Store {
  const store = createStore(rootReducer, applyMiddleware(thunk));
  render(
    <Provider store={store}>
      <Board />
    </Provider>
  );
  act(() => {
    store.dispatch({ type: GET_StockInfoes, payload: stockPayload });
  });
  return store;
}

async function clickIcon(buttonName: RegExp): Promise<void> {
  const button = screen.getByRole('button', { name: buttonName });
  const icon = button.querySelector('i');
  if (icon === null) {
    throw new Error(`no icon inside ${buttonName}`);
  }
  await act(async () => {
    fireEvent.click(icon);
  });
}

describe('next and previous product from the button, not the icon', () => {
  beforeEach(() => {
    mockGetStockInfoes.mockReset().mockResolvedValue({ status: 200 });
    mockGetStockInfoesBasic.mockReset().mockResolvedValue({ status: 200 });
  });

  test('ModifyBoard reads the product when the previous icon is clicked', async () => {
    renderBoard(ModifyBoard);
    await clickIcon(/上一筆/);
    expect(mockGetStockInfoes).toHaveBeenCalledWith('CF1000');
    expect(mockGetStockInfoesBasic).not.toHaveBeenCalled();
  });

  test('QueryBoard reads the product when the next icon is clicked', async () => {
    renderBoard(QueryBoard);
    await clickIcon(/下一筆/);
    expect(mockGetStockInfoesBasic).toHaveBeenCalledWith('CF1002');
    expect(mockGetStockInfoes).not.toHaveBeenCalled();
  });

  test('QueryBoard detail reads the product when the next icon is clicked', async () => {
    renderBoard(QueryBoardDetail);
    await clickIcon(/下一筆/);
    expect(mockGetStockInfoes).toHaveBeenCalledWith('CF1002');
    expect(mockGetStockInfoesBasic).not.toHaveBeenCalled();
  });
});
