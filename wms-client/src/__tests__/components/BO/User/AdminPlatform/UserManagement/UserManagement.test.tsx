import React from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import { thunk } from 'redux-thunk';
import { toast } from 'react-toastify';
import rootReducer from '../../../../../../reducers';
import API from '../../../../../../utilities/API';
import UserManagement from '../../../../../../components/BO/User/AdminPlatform/UserManagement/UserManagement';

// Deleting a user cannot be undone, so it asks first. Updates and deletions say when they
// worked, and the loading overlay closes whatever the answer.

vi.mock('../../../../../../utilities/API', () => ({
  default: { get: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

vi.mock('react-toastify', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-toastify')>();
  return { ...actual, toast: Object.assign(vi.fn(), { ...actual.toast, error: vi.fn(), success: vi.fn() }) };
});

vi.mock('@achmadk/react-loading-overlay', () => ({
  default: function MockLoadingOverlay({ active, children }: { active: boolean; children: React.ReactNode }) {
    return (
      <div data-testid="loading-overlay" data-active={String(Boolean(active))}>
        {children}
      </div>
    );
  },
}));

// jsdom has no layout, so MUI's DataGrid renders no rows there. This stand-in renders every
// row with the page's own column definitions (renderCell included).
vi.mock('@mui/x-data-grid', () => ({
  DataGrid: ({ rows, columns }: { rows: Record<string, unknown>[]; columns: { field: string; renderCell?: (p: { row: unknown }) => React.ReactNode }[] }) => (
    <table>
      <tbody>
        {rows.map((row) => (
          <tr key={String(row.id)} data-testid={`row-${String(row.employeeId)}`}>
            {columns.map((column) => (
              <td key={column.field}>{column.renderCell ? column.renderCell({ row }) : String(row[column.field] ?? '')}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
}));

const users = [
  { employeeId: 'E001', fullName: '王小明', role: '業務' },
  { employeeId: 'E002', fullName: '陳小華', role: '管理員' },
];

const settle = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

const overlayIdle = () => screen.getByTestId('loading-overlay').dataset.active === 'false';

const renderAndLoad = async () => {
  render(
    <Provider store={createStore(rootReducer, applyMiddleware(thunk))}>
      <UserManagement />
    </Provider>
  );
  vi.mocked(API.get).mockResolvedValue({ status: 200, data: users });
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: '讀取員工清單' }));
  });
  await settle();
};

const clickDelete = async (employeeId: string) => {
  await act(async () => {
    fireEvent.click(within(screen.getByTestId(`row-${employeeId}`)).getByRole('button', { name: '刪除' }));
  });
};

beforeEach(() => {
  vi.mocked(API.get).mockReset();
  vi.mocked(API.patch).mockReset();
  vi.mocked(API.delete).mockReset();
  vi.mocked(toast.success).mockReset();
  vi.mocked(toast.error).mockReset();
});

describe('UserManagement delete', () => {
  test('asks before deleting and names the user', async () => {
    await renderAndLoad();

    await clickDelete('E001');

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText(/E001/)).toBeInTheDocument();
    expect(within(dialog).getByText(/王小明/)).toBeInTheDocument();
    expect(API.delete).not.toHaveBeenCalled();
  });

  test('cancelling deletes nothing', async () => {
    await renderAndLoad();
    await clickDelete('E001');

    await act(async () => {
      fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: '取消' }));
    });
    await settle();

    expect(API.delete).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
  });

  test('confirming deletes that user, says so and stops loading', async () => {
    await renderAndLoad();
    vi.mocked(API.delete).mockResolvedValue({ status: 200, data: '' });
    await clickDelete('E002');

    await act(async () => {
      fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: '刪除' }));
    });
    await settle();

    expect(API.delete).toHaveBeenCalledTimes(1);
    expect(API.delete).toHaveBeenCalledWith('/api/user/adminManagement/user/delete?employeeId=E002');
    expect(toast.success).toHaveBeenCalledWith('已刪除員工 E002');
    expect(overlayIdle()).toBe(true);
    expect(screen.queryByTestId('row-E002')).toBeNull();
  });

  test('the overlay closes for any successful answer, not only 200', async () => {
    await renderAndLoad();
    vi.mocked(API.delete).mockResolvedValue({ status: 204, data: '' });
    await clickDelete('E001');

    await act(async () => {
      fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: '刪除' }));
    });
    await settle();

    expect(overlayIdle()).toBe(true);
  });
});

describe('UserManagement update', () => {
  test('saving an edit says so and stops loading', async () => {
    await renderAndLoad();
    vi.mocked(API.patch).mockResolvedValue({ status: 200, data: '' });
    await act(async () => {
      fireEvent.click(within(screen.getByTestId('row-E001')).getByRole('button', { name: '編輯' }));
    });
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: '編輯' }));

    await act(async () => {
      fireEvent.click(within(dialog).getByRole('button', { name: '儲存' }));
    });
    await settle();

    expect(API.patch).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledWith('已更新員工資料');
    expect(overlayIdle()).toBe(true);
  });

  test('a failed update stops loading and shows the request-failed message', async () => {
    await renderAndLoad();
    vi.mocked(API.patch).mockRejectedValue(
      Object.assign(new Error('500'), { response: { status: 500, data: {} } })
    );
    await act(async () => {
      fireEvent.click(within(screen.getByTestId('row-E001')).getByRole('button', { name: '編輯' }));
    });
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: '編輯' }));

    await act(async () => {
      fireEvent.click(within(dialog).getByRole('button', { name: '儲存' }));
    });
    await settle();

    expect(toast.success).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('操作失敗，請稍後再試');
    expect(overlayIdle()).toBe(true);
  });
});
