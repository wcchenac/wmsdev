import React from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import { thunk } from 'redux-thunk';
import rootReducer from '../../../../../reducers';
import API from '../../../../../utilities/API';
import OutStockRequestList from '../../../../../components/BO/Stock/OutStockList/OutStockRequestList';

// After an action on 拉貨明細 (delete / cancel ship / update) the page resets its list and
// queries again. If the new list equals the one before, it must still be shown (dev compared
// the store with the list on screen, so it refilled right away), not stay blank.

vi.mock('../../../../../utilities/API', () => ({
  default: { get: vi.fn(), patch: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));

const today = new Date().toJSON().slice(0, 10);
const waitHandleList = () => ({
  userList: ['林倉管'],
  queryResult: {
    [today]: [
      {
        id: 11, productNo: 'CF1001', lotNo: 'L1', type: '整支', quantity: 5, unit: '碼', color: '1', defect: '',
        reason: '中壢', outStockType: 2, stockIdentifierId: 3, fileName: '', handled: true, deleted: false,
        requestFrom: '中壢', createdAt: `${today}T09:00:00`, updatedAt: `${today}T09:00:00`,
        createdBy: '林倉管', updatedBy: '林倉管',
      },
      {
        id: 12, productNo: 'CF1002', lotNo: 'L2', type: '板卷', quantity: 8, unit: '碼', color: '1', defect: '',
        reason: '新竹', outStockType: 2, stockIdentifierId: 4, fileName: '', handled: true, deleted: false,
        requestFrom: '新竹', createdAt: `${today}T10:00:00`, updatedAt: `${today}T10:00:00`,
        createdBy: '林倉管', updatedBy: '林倉管',
      },
    ],
  },
});

const settle = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

beforeEach(() => {
  // Every query returns a fresh object with the same content.
  vi.mocked(API.get).mockReset().mockImplementation(async () => ({ status: 200, data: waitHandleList() }));
  vi.mocked(API.patch).mockReset().mockResolvedValue({ status: 200, data: {} });
});

test('the list is shown again after an action when the new list equals the old one', async () => {
  const store = createStore(rootReducer, applyMiddleware(thunk));
  render(
    <Provider store={store}>
      <OutStockRequestList />
    </Provider>
  );
  await settle();
  expect(screen.getByText('CF1001')).toBeInTheDocument();
  expect(screen.getByText('CF1002')).toBeInTheDocument();

  fireEvent.click(screen.getAllByRole('button', { name: '刪除此筆記錄' })[0]);
  const dialog = await screen.findByRole('dialog');
  await act(async () => {
    fireEvent.click(within(dialog).getByRole('button', { name: /確認/ }));
  });
  await settle();

  expect(API.patch).toHaveBeenCalledTimes(1);
  expect(API.get).toHaveBeenCalledTimes(2);
  expect(screen.getByText('CF1001')).toBeInTheDocument();
  expect(screen.getByText('CF1002')).toBeInTheDocument();
  // The user filter is rebuilt as well.
  expect(screen.getByRole('button', { name: /林倉管/ })).toBeInTheDocument();
});
