import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import { applyMiddleware, createStore } from 'redux';
import { thunk } from 'redux-thunk';
import { toast } from 'react-toastify';
import rootReducer from '../../../reducers';
import API from '../../../utilities/API';
import { REQUEST_FAILED_MESSAGE } from '../../../utilities/notifyRequestFailed';
import QueryBoard from '../../../components/BO/Stock/QueryStock/QueryBoard';
import QueryBoardDetail from '../../../components/BO/Stock/QueryStock/QueryBoard_Detail';
import ModifyBoard from '../../../components/BO/Stock/ModifyStock/ModifyBoard/ModifyBoard';
import NormalStockBoard from '../../../components/BO/Stock/InStock/NormalStockBoard';
import AssembleStockBoard from '../../../components/BO/Stock/InStock/AssembleStockBoard';
import CustomerReturnBoard from '../../../components/BO/Stock/InStock/CustomerReturnBoard';
import StoreReturnBoard from '../../../components/BO/Stock/InStock/StoreReturnBoard';
import QueryOutStockToStore from '../../../components/BO/Stock/QueryStock/QueryOutStockToStore';
import InStockRollback from '../../../components/BO/User/AdminPlatform/InStockRollback/InStockRollback';
import ShrinkBoard from '../../../components/BO/Stock/ModifyStock/ShrinkBoard/ShrinkBoard';
import OutStockRequestList from '../../../components/BO/Stock/OutStockList/OutStockRequestList';
import StockCategory from '../../../components/BO/User/AdminPlatform/StockCategory';
import FileCenter from '../../../components/BO/File/FileCenter';

// When a request fails, the actions dispatch the error and rethrow. Every page must catch it:
// hide the loading overlay and tell the user, instead of leaving an unhandled rejection and an
// overlay that never goes away.

vi.mock('../../../utilities/API', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

vi.mock('react-toastify', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-toastify')>();
  return { ...actual, toast: Object.assign(vi.fn(), { ...actual.toast, error: vi.fn(), success: vi.fn() }) };
});

vi.mock('react-loading-overlay-ts', () => ({
  default: function MockLoadingOverlay({ active, children }: { active: boolean; children: React.ReactNode }) {
    return (
      <div data-testid="loading-overlay" data-active={String(Boolean(active))}>
        {children}
      </div>
    );
  },
}));

const serverError = Object.assign(new Error('Request failed with status code 500'), {
  response: { status: 500, data: {} },
});

const renderPage = (Page: React.ComponentType) => {
  const store = createStore(rootReducer, applyMiddleware(thunk));
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <Page />
      </MemoryRouter>
    </Provider>
  );
};

const settle = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

const submitForm = async (container: HTMLElement, selector: string, value: string) => {
  const input = container.querySelector<HTMLInputElement>(selector)!;
  fireEvent.change(input, { target: { value, name: input.name } });
  await act(async () => {
    fireEvent.submit(input.closest('form')!);
  });
  await settle();
};

const overlaysIdle = () =>
  screen.queryAllByTestId('loading-overlay').every((overlay) => overlay.dataset.active === 'false');

beforeEach(() => {
  for (const method of ['get', 'post', 'put', 'delete'] as const) {
    vi.mocked(API[method]).mockReset().mockRejectedValue(serverError);
  }
  vi.mocked(toast.error).mockReset();
});

describe.each([
  ['庫存查詢 (QueryBoard)', QueryBoard, '#productNo-search'],
  ['庫存查詢 (QueryBoardDetail)', QueryBoardDetail, '#productNo-search'],
  ['庫存異動 (ModifyBoard)', ModifyBoard, '#productNo-search'],
  ['進貨單入庫', NormalStockBoard, 'input[name=orderNo]'],
  ['組裝單入庫', AssembleStockBoard, 'input[name=orderNo]'],
  ['退貨單入庫', CustomerReturnBoard, 'input[name=orderNo]'],
  ['調撥單入庫', StoreReturnBoard, 'input[name=orderNo]'],
  ['出庫單查詢', QueryOutStockToStore, 'input[name=orderNo]'],
  ['入庫回朔', InStockRollback, 'input[name=orderNo]'],
])('%s: a failed query', (_name, Page, inputSelector) => {
  test('hides the loading overlay and shows an error toast', async () => {
    const { container } = renderPage(Page);

    await submitForm(container, inputSelector, 'X1');

    expect(toast.error).toHaveBeenCalledWith(REQUEST_FAILED_MESSAGE);
    expect(overlaysIdle()).toBe(true);
  });
});

describe.each([
  ['減肥清單 (ShrinkBoard)', ShrinkBoard],
  ['拉貨明細 (OutStockRequestList)', OutStockRequestList],
  ['庫存類別 (StockCategory)', StockCategory],
  ['檔案總管 (FileCenter)', FileCenter],
])('%s: a failed initial load', (_name, Page) => {
  test('shows an error toast and does not stay loading', async () => {
    renderPage(Page);
    await settle();

    expect(toast.error).toHaveBeenCalledWith(REQUEST_FAILED_MESSAGE);
    expect(overlaysIdle()).toBe(true);
  });
});

test('the backend message is shown when there is one', async () => {
  vi.mocked(API.get).mockRejectedValue(
    Object.assign(new Error('400'), { response: { status: 400, data: { message: '查無此貨號' } } })
  );
  const { container } = renderPage(QueryBoard);

  await submitForm(container, '#productNo-search', 'X1');

  expect(toast.error).toHaveBeenCalledWith('查無此貨號');
});
