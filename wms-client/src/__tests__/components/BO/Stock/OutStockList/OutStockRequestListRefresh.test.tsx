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

test('sorting the user filter does not mutate the store userList', async () => {
  const userList = ['zeta', 'alpha'];
  vi.mocked(API.get).mockImplementation(async () => ({
    status: 200,
    data: {
      userList,
      queryResult: {
        [today]: [
          {
            id: 21, productNo: 'CF2001', lotNo: 'L1', type: '整支', quantity: 1, unit: '碼', color: '1', defect: '',
            reason: '中壢', outStockType: 2, stockIdentifierId: 9, fileName: '', handled: true, deleted: false,
            requestFrom: '中壢', createdAt: `${today}T09:00:00`, updatedAt: `${today}T09:00:00`,
            createdBy: 'alpha', updatedBy: 'alpha',
          },
        ],
      },
    },
  }));

  const store = createStore(rootReducer, applyMiddleware(thunk));
  render(
    <Provider store={store}>
      <OutStockRequestList />
    </Provider>
  );
  await settle();

  expect(userList).toEqual(['zeta', 'alpha']);
  expect(store.getState().outStockRequests.outStockRequests?.userList).toEqual(['zeta', 'alpha']);

  const alpha = screen.getByRole('button', { name: 'alpha' });
  const zeta = screen.getByRole('button', { name: 'zeta' });
  expect(alpha.compareDocumentPosition(zeta) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});

test('clearing the list does not restore it until the next response arrives', async () => {
  const pending: Array<(value: { status: number; data: ReturnType<typeof waitHandleList> }) => void> = [];
  vi.mocked(API.get).mockImplementation(
    () =>
      new Promise((resolve) => {
        pending.push(resolve);
      })
  );

  const store = createStore(rootReducer, applyMiddleware(thunk));
  render(
    <Provider store={store}>
      <OutStockRequestList />
    </Provider>
  );

  expect(screen.queryByText('CF1001')).not.toBeInTheDocument();

  await act(async () => {
    pending[0]({ status: 200, data: waitHandleList() });
  });
  await settle();
  expect(screen.getByText('CF1001')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /頁面初始化/ }));
  await settle();

  expect(pending.length).toBeGreaterThanOrEqual(2);
  expect(screen.queryByText('CF1001')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /林倉管/ })).not.toBeInTheDocument();

  await act(async () => {
    pending[pending.length - 1]({ status: 200, data: waitHandleList() });
  });
  await settle();

  expect(screen.getByText('CF1001')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /林倉管/ })).toBeInTheDocument();
});

test('ConfirmModal stays disabled while delete request is pending', async () => {
  let resolvePatch!: (value: { status: number; data: Record<string, unknown> }) => void;
  vi.mocked(API.patch).mockImplementationOnce(
    () => new Promise((resolve) => {
      resolvePatch = resolve;
    })
  );

  const store = createStore(rootReducer, applyMiddleware(thunk));
  render(
    <Provider store={store}>
      <OutStockRequestList />
    </Provider>
  );
  await settle();

  fireEvent.click(screen.getAllByRole('button', { name: '刪除此筆記錄' })[0]);
  const dialog = await screen.findByRole('dialog');
  const confirmBtn = within(dialog).getByRole('button', { name: /確認/ });

  fireEvent.click(confirmBtn);
  expect(confirmBtn).toBeDisabled();

  await act(async () => {
    resolvePatch({ status: 200, data: {} });
  });
  await settle();
});

test('10-minute polling does not overwrite active date-interval mode', async () => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  try {
    const store = createStore(rootReducer, applyMiddleware(thunk));
    render(
      <Provider store={store}>
        <OutStockRequestList />
      </Provider>
    );

    await act(async () => {
      await Promise.resolve();
    });
    expect(API.get).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: '時間區間查詢' }));
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: '確認' }));

    await act(async () => {
      await Promise.resolve();
    });
    expect(API.get).toHaveBeenCalledTimes(2);
    expect(vi.mocked(API.get).mock.calls[1][0]).toContain('/waitHandleList/interval');

    await act(async () => {
      vi.advanceTimersByTime(1000 * 60 * 10);
      await Promise.resolve();
    });
    expect(API.get).toHaveBeenCalledTimes(2);
  } finally {
    vi.useRealTimers();
  }
});

test('background poll with changed queryResult preserves selectedUserList filter and unhandled whName gating', async () => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  try {
    const initialPoll = {
      userList: ['林倉管', '陳主管'],
      queryResult: {
        [today]: [
          {
            id: 21, productNo: 'CF2001', lotNo: 'L1', type: '整支', quantity: 5, unit: '碼', color: '1', defect: '',
            reason: '中壢', outStockType: 2, stockIdentifierId: 3, fileName: '', handled: false, deleted: false,
            requestFrom: '', createdAt: `${today}T09:00:00`, updatedAt: `${today}T09:00:00`,
            createdBy: '林倉管', updatedBy: '林倉管',
          },
          {
            id: 22, productNo: 'CF2002', lotNo: 'L2', type: '板卷', quantity: 8, unit: '碼', color: '1', defect: '',
            reason: '新竹', outStockType: 2, stockIdentifierId: 4, fileName: '', handled: false, deleted: false,
            requestFrom: '', createdAt: `${today}T10:00:00`, updatedAt: `${today}T10:00:00`,
            createdBy: '陳主管', updatedBy: '陳主管',
          },
        ],
      },
    };
    const updatedPoll = {
      userList: ['林倉管', '陳主管'],
      queryResult: {
        [today]: [
          ...initialPoll.queryResult[today],
          {
            id: 23, productNo: 'CF2003', lotNo: 'L3', type: '板卷', quantity: 3, unit: '碼', color: '1', defect: '',
            reason: '台中', outStockType: 2, stockIdentifierId: 5, fileName: '', handled: false, deleted: false,
            requestFrom: '', createdAt: `${today}T11:00:00`, updatedAt: `${today}T11:00:00`,
            createdBy: '陳主管', updatedBy: '陳主管',
          },
        ],
      },
    };
    vi.mocked(API.get)
      .mockResolvedValueOnce({ status: 200, data: initialPoll })
      .mockResolvedValueOnce({ status: 200, data: updatedPoll });

    const store = createStore(rootReducer, applyMiddleware(thunk));
    render(
      <Provider store={store}>
        <OutStockRequestList />
      </Provider>
    );

    await act(async () => {
      await Promise.resolve();
    });

    // Unselect 陳主管 so only 林倉管 rows are active
    fireEvent.click(screen.getByRole('button', { name: /陳主管/ }));
    expect(screen.queryByText('CF2002')).not.toBeInTheDocument();

    // Select a warehouse for 林倉管's row -> 儲存 becomes enabled
    const whSelect = document.querySelector<HTMLSelectElement>('select.form-select')!;
    fireEvent.change(whSelect, { target: { name: 'whName', value: '內倉' } });
    expect(screen.getByRole('button', { name: '儲存' })).toBeEnabled();

    // Advance 10 minutes to trigger background poll returning changed queryResult
    await act(async () => {
      vi.advanceTimersByTime(1000 * 60 * 10);
      await Promise.resolve();
    });

    expect(screen.queryByText('CF2002')).not.toBeInTheDocument();
    expect(screen.queryByText('CF2003')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '儲存' })).toBeEnabled();
  } finally {
    vi.useRealTimers();
  }
});
