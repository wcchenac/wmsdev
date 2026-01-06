import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import AdminPlatform from '../../../../../components/BO/User/AdminPlatform/AdminPlatform';

// Mock all sub-components
jest.mock('../../../../../components/BO/User/AdminPlatform/UserRegister', () => {
  return function MockUserRegister() {
    return <div data-testid="user-register">UserRegister Component</div>;
  };
});

jest.mock('../../../../../components/BO/User/AdminPlatform/UserManagement/UserManagement', () => {
  return function MockUserManagement() {
    return <div data-testid="user-management">UserManagement Component</div>;
  };
});

jest.mock('../../../../../components/BO/User/AdminPlatform/InStockByImportFile', () => {
  return function MockInStockByImportFile() {
    return <div data-testid="import-file">InStockByImportFile Component</div>;
  };
});

jest.mock('../../../../../components/BO/User/AdminPlatform/ScheduleMission', () => {
  return function MockScheduleMission() {
    return <div data-testid="schedule-mission">ScheduleMission Component</div>;
  };
});

jest.mock('../../../../../components/BO/User/AdminPlatform/ShrinkRollback/ShrinkRollback', () => {
  return function MockShrinkRollback() {
    return <div data-testid="shrink-rollback">ShrinkRollback Component</div>;
  };
});

jest.mock('../../../../../components/BO/User/AdminPlatform/StockCategory', () => {
  return function MockStockCategory() {
    return <div data-testid="stock-category">StockCategory Component</div>;
  };
});

jest.mock('../../../../../components/BO/User/AdminPlatform/InStockRollback/InStockRollback', () => {
  return function MockInStockRollback() {
    return <div data-testid="instock-rollback">InStockRollback Component</div>;
  };
});

jest.mock('../../../../../components/BO/User/AdminPlatform/SetWarehouse', () => {
  return function MockSetWarehouse() {
    return <div data-testid="set-warehouse">SetWarehouse Component</div>;
  };
});

const mockStore = configureMockStore([thunk]);

const renderAdminPlatform = (storeState = {}) => {
  const defaultState = {
    user: {
      validToken: true,
      user: { role: { authority: 'ROLE_Admin' } },
      users: []
    },
    errors: {}
  };

  const store = mockStore({ ...defaultState, ...storeState });
  const history = createMemoryHistory();

  return {
    ...render(
      <Provider store={store}>
        <Router history={history}>
          <AdminPlatform />
        </Router>
      </Provider>
    ),
    store,
    history
  };
};

describe('AdminPlatform', () => {
  describe('rendering', () => {
    test('renders function list title', () => {
      renderAdminPlatform();
      expect(screen.getByText('功能列表')).toBeInTheDocument();
    });

    test('renders 新增使用者 button', () => {
      renderAdminPlatform();
      expect(screen.getByRole('button', { name: '新增使用者' })).toBeInTheDocument();
    });

    test('renders 使用者管理 button', () => {
      renderAdminPlatform();
      expect(screen.getByRole('button', { name: '使用者管理' })).toBeInTheDocument();
    });

    test('renders 批量入庫 button', () => {
      renderAdminPlatform();
      expect(screen.getByRole('button', { name: '批量入庫' })).toBeInTheDocument();
    });

    test('renders 入庫回朔 button', () => {
      renderAdminPlatform();
      expect(screen.getByRole('button', { name: '入庫回朔' })).toBeInTheDocument();
    });

    test('renders 減肥回朔 button', () => {
      renderAdminPlatform();
      expect(screen.getByRole('button', { name: '減肥回朔' })).toBeInTheDocument();
    });

    test('renders 庫存類別 button', () => {
      renderAdminPlatform();
      expect(screen.getByRole('button', { name: '庫存類別' })).toBeInTheDocument();
    });

    test('renders 設定倉別 button (disabled)', () => {
      renderAdminPlatform();
      const button = screen.getByRole('button', { name: '設定倉別' });
      expect(button).toBeInTheDocument();
      expect(button).toBeDisabled();
    });

    test('renders 任務排程 button', () => {
      renderAdminPlatform();
      expect(screen.getByRole('button', { name: '任務排程' })).toBeInTheDocument();
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
      fireEvent.click(screen.getByRole('button', { name: '新增使用者' }));
      expect(screen.getByTestId('user-register')).toBeInTheDocument();
    });

    test('shows UserManagement when 使用者管理 clicked', () => {
      renderAdminPlatform();
      fireEvent.click(screen.getByRole('button', { name: '使用者管理' }));
      expect(screen.getByTestId('user-management')).toBeInTheDocument();
    });

    test('shows InStockByImportFile when 批量入庫 clicked', () => {
      renderAdminPlatform();
      fireEvent.click(screen.getByRole('button', { name: '批量入庫' }));
      expect(screen.getByTestId('import-file')).toBeInTheDocument();
    });

    test('shows InStockRollback when 入庫回朔 clicked', () => {
      renderAdminPlatform();
      fireEvent.click(screen.getByRole('button', { name: '入庫回朔' }));
      expect(screen.getByTestId('instock-rollback')).toBeInTheDocument();
    });

    test('shows ShrinkRollback when 減肥回朔 clicked', () => {
      renderAdminPlatform();
      fireEvent.click(screen.getByRole('button', { name: '減肥回朔' }));
      expect(screen.getByTestId('shrink-rollback')).toBeInTheDocument();
    });

    test('shows StockCategory when 庫存類別 clicked', () => {
      renderAdminPlatform();
      fireEvent.click(screen.getByRole('button', { name: '庫存類別' }));
      expect(screen.getByTestId('stock-category')).toBeInTheDocument();
    });

    test('shows ScheduleMission when 任務排程 clicked', () => {
      renderAdminPlatform();
      fireEvent.click(screen.getByRole('button', { name: '任務排程' }));
      expect(screen.getByTestId('schedule-mission')).toBeInTheDocument();
    });
  });

  describe('function switching', () => {
    test('switches between functions correctly', () => {
      renderAdminPlatform();

      // Click UserRegister
      fireEvent.click(screen.getByRole('button', { name: '新增使用者' }));
      expect(screen.getByTestId('user-register')).toBeInTheDocument();
      expect(screen.queryByTestId('user-management')).not.toBeInTheDocument();

      // Click UserManagement
      fireEvent.click(screen.getByRole('button', { name: '使用者管理' }));
      expect(screen.getByTestId('user-management')).toBeInTheDocument();
      expect(screen.queryByTestId('user-register')).not.toBeInTheDocument();
    });
  });

  describe('CSS structure', () => {
    test('has platform container', () => {
      const { container } = renderAdminPlatform();
      expect(container.querySelector('.platform')).toBeInTheDocument();
    });

    test('has Bootstrap container', () => {
      const { container } = renderAdminPlatform();
      expect(container.querySelector('.container')).toBeInTheDocument();
    });

    test('buttons have btn-info btn-block classes', () => {
      renderAdminPlatform();
      const button = screen.getByRole('button', { name: '新增使用者' });
      expect(button).toHaveClass('btn', 'btn-info', 'btn-block');
    });
  });
});
