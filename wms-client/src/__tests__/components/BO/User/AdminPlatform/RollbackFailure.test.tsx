import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import { thunk } from 'redux-thunk';
import { toast } from 'react-toastify';
import rootReducer from '../../../../../reducers';
import API from '../../../../../utilities/API';
import { REQUEST_FAILED_MESSAGE } from '../../../../../utilities/notifyRequestFailed';
import {
  ROLLBACK_DONE_NOT_REFRESHED_MESSAGE,
  ROLLBACK_REJECTED_MESSAGE,
  ROLLBACK_REJECTED_NOT_REFRESHED_MESSAGE,
} from '../../../../../utilities/rollbackRequest';
import InStockRollback from '../../../../../components/BO/User/AdminPlatform/InStockRollback/InStockRollback';
import ShrinkRollback from '../../../../../components/BO/User/AdminPlatform/ShrinkRollback/ShrinkRollback';

// The backend answers 400 with no body when a rollback cannot be done as a whole (an id is
// gone, two admins rolled back the same batch, the roll was never shrunk) and changes nothing.
// The page must stop loading, say so, and show the list as it now is.

vi.mock('../../../../../utilities/API', () => ({
  default: { get: vi.fn(), patch: vi.fn() },
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

// Stand-ins for the lists: show what the page currently holds, and one button that rolls back.
vi.mock('../../../../../components/BO/User/AdminPlatform/InStockRollback/StockInfoContainer', () => ({
  default: ({ result, handleInStockRollback }: { result: object; handleInStockRollback: (ids: number[]) => void }) => (
    <div>
      <output data-testid="list">{JSON.stringify(result)}</output>
      <button onClick={() => handleInStockRollback([1, 2])}>回朔</button>
    </div>
  ),
}));
vi.mock('../../../../../components/BO/User/AdminPlatform/ShrinkRollback/StockInfoContainer', () => ({
  default: ({ result, handleShrinkRollback }: { result: object; handleShrinkRollback: (id: number) => void }) => (
    <div>
      <output data-testid="list">{JSON.stringify(result)}</output>
      <button onClick={() => handleShrinkRollback(7)}>回朔</button>
    </div>
  ),
}));

const badRequest = () =>
  Object.assign(new Error('Request failed with status code 400'), { response: { status: 400, data: '' } });
const serverError = () =>
  Object.assign(new Error('Request failed with status code 500'), { response: { status: 500, data: '' } });

const settle = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

const overlayIdle = () => screen.getByTestId('loading-overlay').dataset.active === 'false';

const pages = [
  [
    '入庫回朔 (InStockRollback)',
    InStockRollback,
    async (container: HTMLElement) => {
      fireEvent.change(container.querySelector('select[name=orderType]')!, { target: { name: 'orderType', value: 'normal' } });
      fireEvent.change(container.querySelector('input[name=orderNo]')!, { target: { name: 'orderNo', value: 'IN001' } });
      await act(async () => {
        fireEvent.submit(container.querySelector('input[name=orderNo]')!.closest('form')!);
      });
    },
    '/api/stock/queryStock/inStockRollback?orderType=normal&orderNo=IN001',
    { CF1001: [{ id: 1 }, { id: 2 }] },
    { CF1001: [{ id: 2 }] },
    (container: HTMLElement) => {
      fireEvent.change(container.querySelector('select[name=orderType]')!, { target: { name: 'orderType', value: 'assemble' } });
      fireEvent.change(container.querySelector('input[name=orderNo]')!, { target: { name: 'orderNo', value: 'IN999' } });
    },
    '/api/stock/queryStock/inStockRollback?orderType=assemble&orderNo=IN999',
  ],
  [
    '減肥回朔 (ShrinkRollback)',
    ShrinkRollback,
    async (container: HTMLElement) => {
      const input = container.querySelector<HTMLInputElement>('#productNo-search')!;
      fireEvent.change(input, { target: { name: 'productNo', value: 'CF1001' } });
      await act(async () => {
        fireEvent.submit(input.closest('form')!);
      });
    },
    '/api/stock/queryStock/shrinkRollback/CF1001',
    [{ id: 7 }, { id: 8 }],
    [{ id: 8 }],
    (container: HTMLElement) => {
      fireEvent.change(container.querySelector('#productNo-search')!, { target: { name: 'productNo', value: 'CF9999' } });
    },
    '/api/stock/queryStock/shrinkRollback/CF9999',
  ],
] as const;

describe.each(pages)('%s', (_name, Page, query, listUrl, staleList, currentList, editSearch, editedListUrl) => {
  const renderAndQuery = async () => {
    const view = render(
      <Provider store={createStore(rootReducer, applyMiddleware(thunk))}>
        <Page />
      </Provider>
    );
    vi.mocked(API.get).mockResolvedValueOnce({ status: 200, data: staleList });
    await query(view.container);
    await settle();
    expect(screen.getByTestId('list')).toHaveTextContent(JSON.stringify(staleList));
    return view;
  };

  const rollBack = async () => {
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '回朔' }));
    });
    await settle();
  };

  beforeEach(() => {
    vi.mocked(API.get).mockReset();
    vi.mocked(API.patch).mockReset();
    vi.mocked(toast.error).mockReset();
  });

  test('the refresh after a rollback uses what was queried, not what the search box says now', async () => {
    const { container } = await renderAndQuery();
    editSearch(container);
    vi.mocked(API.patch).mockRejectedValue(badRequest());
    vi.mocked(API.get).mockResolvedValue({ status: 200, data: currentList });

    await rollBack();

    expect(API.get).toHaveBeenCalledTimes(2);
    expect(API.get).toHaveBeenLastCalledWith(listUrl);
    expect(toast.error).toHaveBeenCalledWith(ROLLBACK_REJECTED_MESSAGE);
    expect(screen.getByTestId('list')).toHaveTextContent(JSON.stringify(currentList));
  });

  test('a later query that fails leaves the refresh on the order still on screen', async () => {
    // Query A, change the search to B, B's query fails (A's list stays on screen), roll back:
    // the refresh must load A again, not B.
    const { container } = await renderAndQuery();
    editSearch(container);
    vi.mocked(API.get).mockRejectedValueOnce(serverError());
    await act(async () => {
      fireEvent.submit(container.querySelector('form')!);
    });
    await settle();
    // B was really queried (so this is not just the "edited but never queried" case).
    expect(API.get).toHaveBeenNthCalledWith(2, editedListUrl);
    expect(toast.error).toHaveBeenCalledWith(REQUEST_FAILED_MESSAGE);
    expect(screen.getByTestId('list')).toHaveTextContent(JSON.stringify(staleList));
    vi.mocked(API.patch).mockRejectedValue(badRequest());
    vi.mocked(API.get).mockResolvedValue({ status: 200, data: currentList });

    await rollBack();

    expect(API.get).toHaveBeenCalledTimes(3);
    expect(API.get).toHaveBeenLastCalledWith(listUrl);
    expect(toast.error).toHaveBeenLastCalledWith(ROLLBACK_REJECTED_MESSAGE);
    expect(overlayIdle()).toBe(true);
    expect(screen.getByTestId('list')).toHaveTextContent(JSON.stringify(currentList));
  });

  test('a rejected rollback (400) stops loading, says nothing changed and shows the list as it now is', async () => {
    await renderAndQuery();
    vi.mocked(API.patch).mockRejectedValue(badRequest());
    vi.mocked(API.get).mockResolvedValue({ status: 200, data: currentList });

    await rollBack();

    expect(overlayIdle()).toBe(true);
    expect(toast.error).toHaveBeenCalledWith(ROLLBACK_REJECTED_MESSAGE);
    expect(API.get).toHaveBeenLastCalledWith(listUrl);
    expect(screen.getByTestId('list')).toHaveTextContent(JSON.stringify(currentList));
  });

  test('a rejected rollback whose list query fails too does not keep loading', async () => {
    await renderAndQuery();
    vi.mocked(API.patch).mockRejectedValue(badRequest());
    vi.mocked(API.get).mockRejectedValue(serverError());

    await rollBack();

    expect(overlayIdle()).toBe(true);
    expect(toast.error).toHaveBeenCalledWith(ROLLBACK_REJECTED_NOT_REFRESHED_MESSAGE);
  });

  test('a successful rollback whose list query fails does not keep loading', async () => {
    await renderAndQuery();
    vi.mocked(API.patch).mockResolvedValue({ status: 200, data: '' });
    vi.mocked(API.get).mockRejectedValue(serverError());

    await rollBack();

    expect(overlayIdle()).toBe(true);
    expect(toast.error).toHaveBeenCalledWith(ROLLBACK_DONE_NOT_REFRESHED_MESSAGE);
  });

  test('a successful rollback stops loading and shows the new list without an error', async () => {
    await renderAndQuery();
    vi.mocked(API.patch).mockResolvedValue({ status: 200, data: '' });
    vi.mocked(API.get).mockResolvedValue({ status: 200, data: currentList });

    await rollBack();

    expect(overlayIdle()).toBe(true);
    expect(toast.error).not.toHaveBeenCalled();
    expect(screen.getByTestId('list')).toHaveTextContent(JSON.stringify(currentList));
  });
});
