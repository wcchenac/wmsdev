import React from 'react';
import { render, screen, fireEvent, RenderResult } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore, { MockStoreEnhanced } from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import AdminPlatform from '../../../../../components/BO/User/AdminPlatform/AdminPlatform';

interface StoreState {
  user: {
    validToken: boolean;
    user: {
      role?: string;
    };
    users: unknown[];
  };
  errors: Record<string, unknown>;
}

interface RenderAdminPlatformResult extends RenderResult {
  store: MockStoreEnhanced<unknown>;
}

// Mock all sub-components
vi.mock('../../../../../components/BO/User/AdminPlatform/UserRegister', () => ({ default: (() => {
  return function MockUserRegister(): JSX.Element {
    return <div data-testid="user-register">UserRegister Component</div>;
  };
})() }));

vi.mock('../../../../../components/BO/User/AdminPlatform/UserManagement/UserManagement', () => ({ default: (() => {
  return function MockUserManagement(): JSX.Element {
    return <div data-testid="user-management">UserManagement Component</div>;
  };
})() }));

vi.mock('../../../../../components/BO/User/AdminPlatform/InStockByImportFile', () => ({ default: (() => {
  return function MockInStockByImportFile(): JSX.Element {
    return <div data-testid="import-file">InStockByImportFile Component</div>;
  };
})() }));

vi.mock('../../../../../components/BO/User/AdminPlatform/ScheduleMission', () => ({ default: (() => {
  return function MockScheduleMission(): JSX.Element {
    return <div data-testid="schedule-mission">ScheduleMission Component</div>;
  };
})() }));

vi.mock('../../../../../components/BO/User/AdminPlatform/ShrinkRollback/ShrinkRollback', () => ({ default: (() => {
  return function MockShrinkRollback(): JSX.Element {
    return <div data-testid="shrink-rollback">ShrinkRollback Component</div>;
  };
})() }));

vi.mock('../../../../../components/BO/User/AdminPlatform/StockCategory', () => ({ default: (() => {
  return function MockStockCategory(): JSX.Element {
    return <div data-testid="stock-category">StockCategory Component</div>;
  };
})() }));

vi.mock('../../../../../components/BO/User/AdminPlatform/InStockRollback/InStockRollback', () => ({ default: (() => {
  return function MockInStockRollback(): JSX.Element {
    return <div data-testid="instock-rollback">InStockRollback Component</div>;
  };
})() }));

vi.mock('../../../../../components/BO/User/AdminPlatform/SetWarehouse', () => ({ default: (() => {
  return function MockSetWarehouse(): JSX.Element {
    return <div data-testid="set-warehouse">SetWarehouse Component</div>;
  };
})() }));

const mockStore = configureMockStore([thunk]);

const renderAdminPlatform = (storeState: Partial<StoreState> = {}): RenderAdminPlatformResult => {
  const defaultState: StoreState = {
    user: {
      validToken: true,
      user: { role: 'ROLE_Admin' },
      users: []
    },
    errors: {}
  };

  const store = mockStore({ ...defaultState, ...storeState });

  return {
    ...render(
      <Provider store={store}>
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AdminPlatform />
        </MemoryRouter>
      </Provider>
    ),
    store
  };
};

describe('AdminPlatform', () => {
  describe('rendering', () => {
    test('renders function list title', () => {
      renderAdminPlatform();
      // Component now uses '管理功能' as header instead of '功能列表'
      expect(screen.getByText('管理功能')).toBeInTheDocument();
    });

    test('renders 新增使用者 button', () => {
      renderAdminPlatform();
      expect(screen.getByRole('button', { name: /新增使用者/ })).toBeInTheDocument();
    });

    test('renders 使用者管理 button', () => {
      renderAdminPlatform();
      expect(screen.getByRole('button', { name: /使用者管理/ })).toBeInTheDocument();
    });

    test('renders 批量入庫 button', () => {
      renderAdminPlatform();
      expect(screen.getByRole('button', { name: /批量入庫/ })).toBeInTheDocument();
    });

    test('renders 入庫回朔 button', () => {
      renderAdminPlatform();
      expect(screen.getByRole('button', { name: /入庫回朔/ })).toBeInTheDocument();
    });

    test('renders 減肥回朔 button', () => {
      renderAdminPlatform();
      expect(screen.getByRole('button', { name: /減肥回朔/ })).toBeInTheDocument();
    });

    test('renders 庫存類別 button', () => {
      renderAdminPlatform();
      expect(screen.getByRole('button', { name: /庫存類別/ })).toBeInTheDocument();
    });

    test('renders 設定倉別 button (disabled)', () => {
      renderAdminPlatform();
      const button = screen.getByRole('button', { name: /設定倉別/ });
      expect(button).toBeInTheDocument();
      expect(button).toBeDisabled();
    });

    test('renders 任務排程 button', () => {
      renderAdminPlatform();
      expect(screen.getByRole('button', { name: /任務排程/ })).toBeInTheDocument();
    });
  });

  describe('sub-component rendering', () => {
    test('does not show any sub-component initially', () => {
      renderAdminPlatform();
      expect(screen.queryByTestId('user-register')).not.toBeInTheDocument();
      expect(screen.queryByTestId('user-management')).not.toBeInTheDocument();
    });

    test('shows UserRegister when 新增使用者 clicked', () => {
      renderAdminPlatform();
      fireEvent.click(screen.getByRole('button', { name: /新增使用者/ }));
      expect(screen.getByTestId('user-register')).toBeInTheDocument();
    });

    test('shows UserManagement when 使用者管理 clicked', () => {
      renderAdminPlatform();
      fireEvent.click(screen.getByRole('button', { name: /使用者管理/ }));
      expect(screen.getByTestId('user-management')).toBeInTheDocument();
    });

    test('shows InStockByImportFile when 批量入庫 clicked', () => {
      renderAdminPlatform();
      fireEvent.click(screen.getByRole('button', { name: /批量入庫/ }));
      expect(screen.getByTestId('import-file')).toBeInTheDocument();
    });

    test('shows InStockRollback when 入庫回朔 clicked', () => {
      renderAdminPlatform();
      fireEvent.click(screen.getByRole('button', { name: /入庫回朔/ }));
      expect(screen.getByTestId('instock-rollback')).toBeInTheDocument();
    });

    test('shows ShrinkRollback when 減肥回朔 clicked', () => {
      renderAdminPlatform();
      fireEvent.click(screen.getByRole('button', { name: /減肥回朔/ }));
      expect(screen.getByTestId('shrink-rollback')).toBeInTheDocument();
    });

    test('shows StockCategory when 庫存類別 clicked', () => {
      renderAdminPlatform();
      fireEvent.click(screen.getByRole('button', { name: /庫存類別/ }));
      expect(screen.getByTestId('stock-category')).toBeInTheDocument();
    });

    test('shows ScheduleMission when 任務排程 clicked', () => {
      renderAdminPlatform();
      fireEvent.click(screen.getByRole('button', { name: /任務排程/ }));
      expect(screen.getByTestId('schedule-mission')).toBeInTheDocument();
    });
  });

  describe('function switching', () => {
    test('switches between functions correctly', () => {
      renderAdminPlatform();

      // Click UserRegister
      fireEvent.click(screen.getByRole('button', { name: /新增使用者/ }));
      expect(screen.getByTestId('user-register')).toBeInTheDocument();
      expect(screen.queryByTestId('user-management')).not.toBeInTheDocument();

      // Click UserManagement
      fireEvent.click(screen.getByRole('button', { name: /使用者管理/ }));
      expect(screen.getByTestId('user-management')).toBeInTheDocument();
      expect(screen.queryByTestId('user-register')).not.toBeInTheDocument();
    });
  });

  describe('CSS structure', () => {
    test('has platform container', () => {
      const { container } = renderAdminPlatform();
      // Component now uses 'admin-platform' class instead of 'platform'
      expect(container.querySelector('.admin-platform')).toBeInTheDocument();
    });

    test('has Bootstrap container', () => {
      const { container } = renderAdminPlatform();
      // Component now uses 'container-fluid' instead of 'container'
      expect(container.querySelector('.container-fluid')).toBeInTheDocument();
    });

    test('buttons have btn btn-block classes', () => {
      renderAdminPlatform();
      const button = screen.getByRole('button', { name: /新增使用者/ });
      // Component now uses 'btn-outline-secondary' or 'btn-primary' depending on selection state
      expect(button).toHaveClass('btn', 'btn-block');
    });
  });
});
