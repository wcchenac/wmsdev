import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import { thunk } from 'redux-thunk';
import rootReducer from '../../../../../reducers';
import { GET_Order } from '../../../../../types';
import NormalStockBoard from '../../../../../components/BO/Stock/InStock/NormalStockBoard';
import AssembleStockBoard from '../../../../../components/BO/Stock/InStock/AssembleStockBoard';
import CustomerReturnBoard from '../../../../../components/BO/Stock/InStock/CustomerReturnBoard';
import StoreReturnBoard from '../../../../../components/BO/Stock/InStock/StoreReturnBoard';

// Step 2 "全選" must select only products with remaining waitHandle quantity (> 0);
// completed (0-quantity) products have disabled checkboxes and must stay unchecked.

vi.mock('../../../../../utilities/API', () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

const boards = [
  ['進貨單入庫 (NormalStockBoard)', NormalStockBoard],
  ['組裝單入庫 (AssembleStockBoard)', AssembleStockBoard],
  ['退貨單入庫 (CustomerReturnBoard)', CustomerReturnBoard],
  ['調撥單入庫 (StoreReturnBoard)', StoreReturnBoard],
] as const;

const mixedOrderPayload = {
  currentStatus: {
    P_ACTIVE: { 板卷: { quantity: '10.00', unit: '碼' } },
    P_DONE: { 板卷: { quantity: '10.00', unit: '碼' } },
  },
  waitHandleStatus: {
    P_ACTIVE: { 板卷: { quantity: '5.00', unit: '碼' } },
    P_DONE: { 板卷: { quantity: '0', unit: '碼' } },
  },
};

describe.each(boards)('%s Step 2 全選 skips completed products', (_name, Board) => {
  test('全選 checks P_ACTIVE and keeps disabled P_DONE unchecked', () => {
    const store = createStore(rootReducer, applyMiddleware(thunk));
    render(
      <Provider store={store}>
        <Board />
      </Provider>
    );

    act(() => {
      store.dispatch({ type: GET_Order, payload: mixedOrderPayload });
    });

    const activeBox = screen.getByRole('checkbox', { name: 'P_ACTIVE' }) as HTMLInputElement;
    const doneBox = screen.getByRole('checkbox', { name: 'P_DONE' }) as HTMLInputElement;

    expect(activeBox.checked).toBe(true);
    expect(doneBox.checked).toBe(false);
    expect(doneBox).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: '取消全選' }));
    expect(activeBox.checked).toBe(false);
    expect(doneBox.checked).toBe(false);

    fireEvent.click(screen.getByRole('button', { name: '全選' }));
    expect(activeBox.checked).toBe(true);
    expect(doneBox.checked).toBe(false);
  });
});
