import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import { thunk } from 'redux-thunk';
import rootReducer from '../../../../../reducers';
import { GET_Order } from '../../../../../types';
import NormalStockBoard from '../../../../../components/BO/Stock/InStock/NormalStockBoard';
import AssembleStockBoard from '../../../../../components/BO/Stock/InStock/AssembleStockBoard';
import CustomerReturnBoard from '../../../../../components/BO/Stock/InStock/CustomerReturnBoard';
import StoreReturnBoard from '../../../../../components/BO/Stock/InStock/StoreReturnBoard';

vi.mock('../../../../../utilities/API', () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

const boards = [
  ['進貨單入庫 (NormalStockBoard)', NormalStockBoard],
  ['組裝單入庫 (AssembleStockBoard)', AssembleStockBoard],
  ['退貨單入庫 (CustomerReturnBoard)', CustomerReturnBoard],
  ['調撥單入庫 (StoreReturnBoard)', StoreReturnBoard],
] as const;

describe.each(boards)('%s marks nullish or empty order payload as invalid', (_name, Board) => {
  test('sets order input to invalid when currentStatus/waitHandleStatus are null', () => {
    const store = createStore(rootReducer, applyMiddleware(thunk));
    const { container } = render(
      <Provider store={store}>
        <Board />
      </Provider>
    );

    act(() => {
      store.dispatch({
        type: GET_Order,
        payload: { currentStatus: null, waitHandleStatus: null },
      });
    });

    const input = container.querySelector('input[name="orderNo"]');
    expect(input).toHaveClass('is-invalid');
    expect(screen.getByText(/沒有需要入庫的貨號/)).toBeInTheDocument();
  });

  test('sets order input to invalid when currentStatus is present but waitHandleStatus is null', () => {
    const store = createStore(rootReducer, applyMiddleware(thunk));
    const { container } = render(
      <Provider store={store}>
        <Board />
      </Provider>
    );

    act(() => {
      store.dispatch({
        type: GET_Order,
        payload: {
          currentStatus: { 'PROD-1': { 板卷: { quantity: '5', unit: '碼' } } },
          waitHandleStatus: null,
        },
      });
    });

    const input = container.querySelector('input[name="orderNo"]');
    expect(input).toHaveClass('is-invalid');
    expect(screen.getByText(/沒有需要入庫的貨號/)).toBeInTheDocument();
  });
});
