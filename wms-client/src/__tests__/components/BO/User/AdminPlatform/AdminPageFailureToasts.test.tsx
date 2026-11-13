import React from 'react';
import { act, fireEvent, render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import { thunk } from 'redux-thunk';
import { toast } from 'react-toastify';
import rootReducer from '../../../../../reducers';
import API from '../../../../../utilities/API';
import { GET_StockInfoes } from '../../../../../types';
import { REQUEST_FAILED_MESSAGE } from '../../../../../utilities/notifyRequestFailed';
import StockCategory from '../../../../../components/BO/User/AdminPlatform/StockCategory';
import UserRegister from '../../../../../components/BO/User/AdminPlatform/UserRegister';
import InStockByImportFile from '../../../../../components/BO/User/AdminPlatform/InStockByImportFile';
import SetWarehouse from '../../../../../components/BO/User/AdminPlatform/SetWarehouse';

// These admin pages show their own failure toast. On a 401 the API client already shows
// 「登入已逾時，請重新登入」 and goes to /login, so the page must not add a second toast; other
// failures still get the page's message.

vi.mock('../../../../../utilities/API', () => {
  const pending = () => new Promise(() => undefined);
  return { default: { get: vi.fn(pending), post: vi.fn(), put: vi.fn(pending), patch: vi.fn(pending) } };
});

vi.mock('react-toastify', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-toastify')>();
  return { ...actual, toast: Object.assign(vi.fn(), { ...actual.toast, error: vi.fn(), success: vi.fn() }) };
});

// A real .xlsx, so the pages' own MIME check passes.
const XLSX = { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' };

const httpError = (status: number) =>
  Object.assign(new Error(`Request failed with status code ${status}`), { response: { status, data: {} } });

const settle = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

const renderPage = (Page: React.ComponentType) => {
  const store = createStore(rootReducer, applyMiddleware(thunk));
  return { store, ...render(<Provider store={store}><Page /></Provider>) };
};

// Each entry renders the page and performs the action that fails.
const pages: [string, string, () => Promise<void>][] = [
  [
    '新增使用者 (UserRegister)',
    REQUEST_FAILED_MESSAGE,
    async () => {
      const { container } = renderPage(UserRegister);
      const set = (name: string, value: string) =>
        fireEvent.change(container.querySelector(`[name=${name}]`)!, { target: { name, value } });
      set('employeeId', 'u1');
      set('fullName', '測試');
      set('password', 'pw');
      set('role', 'ROLE_Normal');
      await act(async () => {
        fireEvent.submit(container.querySelector('form')!);
      });
    },
  ],
  [
    '批量入庫 (InStockByImportFile)',
    'upload fail',
    async () => {
      const { container, getByRole } = renderPage(InStockByImportFile);
      fireEvent.change(container.querySelector('input[type=file]')!, {
        target: { files: [new File(['x'], 'in.xlsx', XLSX)] },
      });
      await act(async () => {
        fireEvent.click(getByRole('button', { name: '上傳' }));
      });
    },
  ],
  [
    '設定倉別 (SetWarehouse)',
    'upload fail',
    async () => {
      const { container, getByRole } = renderPage(SetWarehouse);
      fireEvent.change(container.querySelector('input[type=file]')!, {
        target: { files: [new File(['x'], 'wh.xlsx', XLSX)] },
      });
      await act(async () => {
        fireEvent.click(getByRole('button', { name: '上傳' }));
      });
    },
  ],
  [
    '庫存類別 (StockCategory)',
    '棉分類本建立失敗',
    async () => {
      const { container, store, getByRole } = renderPage(StockCategory);
      act(() => {
        store.dispatch({ type: GET_StockInfoes, payload: [{ label: '棉', value: '棉' }] });
      });
      const input = container.querySelector<HTMLInputElement>('input[id^="react-select"]')!;
      fireEvent.keyDown(input, { key: 'ArrowDown', code: 'ArrowDown' });
      fireEvent.click(container.querySelector('[id*="-option-0"]')!);
      await act(async () => {
        fireEvent.click(getByRole('button', { name: '送出' }));
      });
    },
  ],
];

describe.each(pages)('%s', (_name, pageMessage, performFailingAction) => {
  beforeEach(() => {
    vi.mocked(toast.error).mockReset();
  });

  test('a 401 adds no page toast next to the session-expired message', async () => {
    vi.mocked(API.post).mockReset().mockRejectedValue(httpError(401));
    vi.mocked(API.get).mockImplementation((url: string) =>
      url.includes('/category/') ? Promise.reject(httpError(401)) : new Promise(() => undefined)
    );

    await performFailingAction();
    await settle();

    expect(toast.error).not.toHaveBeenCalled();
  });

  test('other failures still show the page message', async () => {
    vi.mocked(API.post).mockReset().mockRejectedValue(httpError(500));
    vi.mocked(API.get).mockImplementation((url: string) =>
      url.includes('/category/') ? Promise.reject(httpError(500)) : new Promise(() => undefined)
    );

    await performFailingAction();
    await settle();

    expect(toast.error).toHaveBeenCalledWith(pageMessage);
  });
});
