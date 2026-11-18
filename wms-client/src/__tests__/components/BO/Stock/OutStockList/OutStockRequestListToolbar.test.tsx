import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import { thunk } from 'redux-thunk';
import rootReducer from '../../../../../reducers';
import API from '../../../../../utilities/API';
import OutStockRequestList from '../../../../../components/BO/Stock/OutStockList/OutStockRequestList';

// The 拉貨明細 toolbar shows 頁面初始化 next to 時間區間查詢; both are small buttons. The reset
// button once carried a responsive size class that, after 0d19d49 loaded Bootstrap's CSS first,
// overrode `.btn-sm` and made it full size from 768px up, unlike its neighbour.

vi.mock('../../../../../utilities/API', () => ({
  default: { get: vi.fn(), patch: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));

const sizeClasses = (button: HTMLElement) =>
  [...button.classList].filter((c) => /^btn-(sm|lg)$/.test(c)).sort();

test('頁面初始化 has the same size classes as 時間區間查詢', async () => {
  vi.mocked(API.get).mockResolvedValue({ status: 200, data: { userList: [], queryResult: {} } });
  render(
    <Provider store={createStore(rootReducer, applyMiddleware(thunk))}>
      <OutStockRequestList />
    </Provider>
  );
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  const reset = screen.getByRole('button', { name: /頁面初始化/ });
  const period = screen.getByRole('button', { name: /時間區間查詢/ });

  expect(sizeClasses(period)).toEqual(['btn-sm']);
  expect(sizeClasses(reset)).toEqual(sizeClasses(period));
});
