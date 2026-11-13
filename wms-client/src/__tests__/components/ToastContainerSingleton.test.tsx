import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import { thunk } from 'redux-thunk';
import { ToastContainer, toast } from 'react-toastify';
import rootReducer from '../../reducers';
import StockCategory from '../../components/BO/User/AdminPlatform/StockCategory';
import UserRegister from '../../components/BO/User/AdminPlatform/UserRegister';
import ScheduleMission from '../../components/BO/User/AdminPlatform/ScheduleMission';
import InStockByImportFile from '../../components/BO/User/AdminPlatform/InStockByImportFile';
import SetWarehouse from '../../components/BO/User/AdminPlatform/SetWarehouse';

// App.tsx renders the one ToastContainer. react-toastify 11 keys containers by containerId
// (default 1), so a page that renders its own container takes over that key and, when it
// unmounts, unregisters it: every later toast in the app (request failures, the
// session-expired message) is silently dropped. Pages must not render their own container.

vi.mock('../../utilities/API', () => {
  const pending = () => new Promise(() => undefined);
  return { default: { get: vi.fn(pending), post: vi.fn(pending), put: vi.fn(pending), patch: vi.fn(pending) } };
});

describe.each([
  ['庫存類別 (StockCategory)', StockCategory],
  ['新增使用者 (UserRegister)', UserRegister],
  ['任務排程 (ScheduleMission)', ScheduleMission],
  ['批量入庫 (InStockByImportFile)', InStockByImportFile],
  ['設定倉別 (SetWarehouse)', SetWarehouse],
])('%s', (_name, Page) => {
  test('toasts still show after leaving the page', async () => {
    const store = createStore(rootReducer, applyMiddleware(thunk));
    const app = (showPage: boolean) => (
      <Provider store={store}>
        {showPage ? <Page /> : <div>other page</div>}
        <ToastContainer />
      </Provider>
    );
    const { rerender } = render(app(true));

    // Leave the admin page.
    rerender(app(false));
    act(() => {
      toast.error('登入已逾時，請重新登入');
    });

    expect(await screen.findByText('登入已逾時，請重新登入')).toBeInTheDocument();
  });
});

test('control: with only the app container, a toast shows', async () => {
  const { rerender } = render(
    <>
      <div>page</div>
      <ToastContainer />
    </>
  );
  rerender(
    <>
      <div>other page</div>
      <ToastContainer />
    </>
  );
  act(() => {
    toast.error('對照組提示');
  });

  expect(await screen.findByText('對照組提示')).toBeInTheDocument();
});
