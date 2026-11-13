import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import { thunk } from 'redux-thunk';
import rootReducer from '../../../../../reducers';
import { GET_Order } from '../../../../../types';
import QueryOutStockToStore from '../../../../../components/BO/Stock/QueryStock/QueryOutStockToStore';

// The backend answers an unknown 出庫單 number with an empty list. The page must then say the
// order was not found, even right after a valid query.

vi.mock('../../../../../utilities/API', () => {
  const pending = () => new Promise(() => undefined);
  return { default: { get: vi.fn(pending), post: vi.fn(pending) } };
});

const NOT_FOUND = '查無出庫單 或 出庫單內沒有需要入庫的貨號';

const rows = [{ productNo: 'CF1001', lotNo: 'L1', quantity: '10', unit: '碼' }];

const setup = () => {
  const store = createStore(rootReducer, applyMiddleware(thunk));
  render(
    <Provider store={store}>
      <QueryOutStockToStore />
    </Provider>
  );
  const answer = (payload: unknown) =>
    act(() => {
      store.dispatch({ type: GET_Order, payload });
    });
  return { answer };
};

describe('出庫單查詢 not found', () => {
  test('nothing is flagged before the first query', () => {
    setup();
    expect(screen.queryByText(NOT_FOUND)).not.toBeInTheDocument();
  });

  test('an unknown order number shows the not-found message', () => {
    const { answer } = setup();
    answer([]);
    expect(screen.getByText(NOT_FOUND)).toBeInTheDocument();
  });

  test('a found order clears the message, and an unknown one after it shows it again', () => {
    const { answer } = setup();
    answer([]);
    answer(rows);
    expect(screen.queryByText(NOT_FOUND)).not.toBeInTheDocument();

    answer([]);
    expect(screen.getByText(NOT_FOUND)).toBeInTheDocument();
  });
});
