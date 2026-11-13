import React from 'react';
import { act, render, screen, fireEvent, RenderResult } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import configureMockStore, { MockStoreEnhanced } from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import UserRegister from '../../../../../components/BO/User/AdminPlatform/UserRegister';
import { toast } from 'react-toastify';
import { REQUEST_FAILED_MESSAGE } from '../../../../../utilities/notifyRequestFailed';

interface MockLoadingOverlayProps {
  children: React.ReactNode;
  active: boolean;
  spinner: React.ReactNode;
}

interface StoreState {
  user: {
    validToken: boolean;
    user: {
      role?: string;
    };
  };
  errors: Record<string, unknown>;
}

interface RenderUserRegisterResult extends RenderResult {
  store: MockStoreEnhanced<unknown>;
}

// Mock react-loading-overlay-ts
vi.mock('react-loading-overlay-ts', () => ({ default: (() => {
  return function MockLoadingOverlay({ children, active }: MockLoadingOverlayProps): JSX.Element {
    return (
      <div data-testid="loading-overlay" data-active={active}>
        {active && <div data-testid="spinner">Loading...</div>}
        {children}
      </div>
    );
  };
})() }));

// Mock Spinner
vi.mock('../../../../../components/Others/Spinner', () => ({
  Spinner: (): JSX.Element => <div data-testid="spinner-component">Spinner</div>
}));

// Mock react-toastify
vi.mock('react-toastify', () => ({
  ToastContainer: (): JSX.Element => <div data-testid="toast-container" />,
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// Mock registerUser action
const mockRegisterUser = vi.fn();
vi.mock('../../../../../actions/UserActions', () => ({
  registerUser: (registration: unknown) => () => mockRegisterUser(registration)
}));

const mockStore = configureMockStore([thunk]);

const renderUserRegister = (storeState: Partial<StoreState> = {}): RenderUserRegisterResult => {
  const defaultState: StoreState = {
    user: {
      validToken: true,
      user: { role: 'ROLE_Admin' }
    },
    errors: {}
  };

  const store = mockStore({ ...defaultState, ...storeState });

  return {
    ...render(
      <Provider store={store}>
        <MemoryRouter>
          <UserRegister />
        </MemoryRouter>
      </Provider>
    ),
    store
  };
};

describe('UserRegister', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRegisterUser.mockResolvedValue({ status: 200 });
  });

  describe('rendering', () => {
    test('renders registration form title', () => {
      renderUserRegister();
      expect(screen.getByText('註冊新員工')).toBeInTheDocument();
    });

    test('renders employee ID input', () => {
      renderUserRegister();
      expect(screen.getByLabelText('員工編號')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('員工編號')).toBeInTheDocument();
    });

    test('renders full name input', () => {
      renderUserRegister();
      expect(screen.getByLabelText('姓名')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('姓名')).toBeInTheDocument();
    });

    test('renders password input', () => {
      renderUserRegister();
      expect(screen.getByLabelText('密碼')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('密碼')).toBeInTheDocument();
    });

    test('renders role select dropdown', () => {
      renderUserRegister();
      expect(screen.getByLabelText('權限')).toBeInTheDocument();
    });

    test('renders submit button', () => {
      renderUserRegister();
      expect(screen.getByRole('button', { name: '註冊' })).toBeInTheDocument();
    });

    // Toasts go through App's single ToastContainer; a page-level one unregisters it on
    // unmount (see ToastContainerSingleton.test.tsx).
    test('does not render its own toast container', () => {
      renderUserRegister();
      expect(screen.queryByTestId('toast-container')).not.toBeInTheDocument();
    });

    test('password input has type password', () => {
      renderUserRegister();
      expect(screen.getByPlaceholderText('密碼')).toHaveAttribute('type', 'password');
    });
  });

  describe('role options', () => {
    test('renders all role options', () => {
      renderUserRegister();

      const roleSelect = screen.getByLabelText('權限') as HTMLSelectElement;
      const options = roleSelect.querySelectorAll('option');

      expect(options.length).toBeGreaterThan(0);
      // Should include: 請選擇..., 一般人員/門市, 業務, 庫存相關人員, 管理員
      const optionTexts = Array.from(options).map(opt => opt.textContent);
      expect(optionTexts).toContain('請選擇...');
      expect(optionTexts).toContain('一般人員/門市');
      expect(optionTexts).toContain('業務');
      expect(optionTexts).toContain('庫存相關人員');
      expect(optionTexts).toContain('管理員');
    });
  });

  describe('input handling', () => {
    test('updates employeeId on input change', () => {
      renderUserRegister();

      const input = screen.getByPlaceholderText('員工編號') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'EMP001', name: 'employeeId' } });

      expect(input).toHaveValue('EMP001');
    });

    test('updates fullName on input change', () => {
      renderUserRegister();

      const input = screen.getByPlaceholderText('姓名') as HTMLInputElement;
      fireEvent.change(input, { target: { value: '測試用戶', name: 'fullName' } });

      expect(input).toHaveValue('測試用戶');
    });

    test('updates password on input change', () => {
      renderUserRegister();

      const input = screen.getByPlaceholderText('密碼') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'secret123', name: 'password' } });

      expect(input).toHaveValue('secret123');
    });

    test('updates role on select change', () => {
      renderUserRegister();

      const select = screen.getByLabelText('權限') as HTMLSelectElement;
      fireEvent.change(select, { target: { value: 'ROLE_Normal', name: 'role' } });

      expect(select).toHaveValue('ROLE_Normal');
    });
  });

  describe('form validation', () => {
    test('submit button is disabled when form is empty', () => {
      renderUserRegister();

      const submitButton = screen.getByRole('button', { name: '註冊' });
      expect(submitButton).toBeDisabled();
    });

    test('submit button is disabled when employeeId is empty', () => {
      renderUserRegister();

      fireEvent.change(screen.getByPlaceholderText('姓名'), { target: { value: 'Test', name: 'fullName' } });
      fireEvent.change(screen.getByPlaceholderText('密碼'), { target: { value: 'pass', name: 'password' } });
      fireEvent.change(screen.getByLabelText('權限'), { target: { value: 'ROLE_Normal', name: 'role' } });

      expect(screen.getByRole('button', { name: '註冊' })).toBeDisabled();
    });

    test('submit button is disabled when fullName is empty', () => {
      renderUserRegister();

      fireEvent.change(screen.getByPlaceholderText('員工編號'), { target: { value: 'EMP', name: 'employeeId' } });
      fireEvent.change(screen.getByPlaceholderText('密碼'), { target: { value: 'pass', name: 'password' } });
      fireEvent.change(screen.getByLabelText('權限'), { target: { value: 'ROLE_Normal', name: 'role' } });

      expect(screen.getByRole('button', { name: '註冊' })).toBeDisabled();
    });

    test('submit button is disabled when password is empty', () => {
      renderUserRegister();

      fireEvent.change(screen.getByPlaceholderText('員工編號'), { target: { value: 'EMP', name: 'employeeId' } });
      fireEvent.change(screen.getByPlaceholderText('姓名'), { target: { value: 'Test', name: 'fullName' } });
      fireEvent.change(screen.getByLabelText('權限'), { target: { value: 'ROLE_Normal', name: 'role' } });

      expect(screen.getByRole('button', { name: '註冊' })).toBeDisabled();
    });

    test('submit button is disabled when role is empty', () => {
      renderUserRegister();

      fireEvent.change(screen.getByPlaceholderText('員工編號'), { target: { value: 'EMP', name: 'employeeId' } });
      fireEvent.change(screen.getByPlaceholderText('姓名'), { target: { value: 'Test', name: 'fullName' } });
      fireEvent.change(screen.getByPlaceholderText('密碼'), { target: { value: 'pass', name: 'password' } });

      expect(screen.getByRole('button', { name: '註冊' })).toBeDisabled();
    });

    test('submit button is enabled when all fields are filled', () => {
      renderUserRegister();

      fireEvent.change(screen.getByPlaceholderText('員工編號'), { target: { value: 'EMP001', name: 'employeeId' } });
      fireEvent.change(screen.getByPlaceholderText('姓名'), { target: { value: 'Test User', name: 'fullName' } });
      fireEvent.change(screen.getByPlaceholderText('密碼'), { target: { value: 'password123', name: 'password' } });
      fireEvent.change(screen.getByLabelText('權限'), { target: { value: 'ROLE_Normal', name: 'role' } });

      expect(screen.getByRole('button', { name: '註冊' })).not.toBeDisabled();
    });
  });

  describe('form submission', () => {
    const fillForm = (): void => {
      fireEvent.change(screen.getByPlaceholderText('員工編號'), { target: { value: 'EMP001', name: 'employeeId' } });
      fireEvent.change(screen.getByPlaceholderText('姓名'), { target: { value: 'Test User', name: 'fullName' } });
      fireEvent.change(screen.getByPlaceholderText('密碼'), { target: { value: 'password123', name: 'password' } });
      fireEvent.change(screen.getByLabelText('權限'), { target: { value: 'ROLE_Normal', name: 'role' } });
    };

    test('calls registerUser with correct data on submit', async () => {
      renderUserRegister();

      fillForm();
      fireEvent.click(screen.getByRole('button', { name: '註冊' }));

      // Let the request settle inside act, so React applies the state updates it causes before
      // the assertions run (a bare setTimeout(0) can fire before React's scheduled render).
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Component now sends additional fields
      expect(mockRegisterUser).toHaveBeenCalledWith(
        expect.objectContaining({
          employeeId: 'EMP001',
          fullName: 'Test User',
          password: 'password123',
          role: 'ROLE_Normal'
        })
      );
    });

    test('shows loading overlay during registration', async () => {
      // The test decides when the request answers, and lets it finish before it ends, so no
      // answer arrives after the test environment is gone.
      let answer: (response: { status: number }) => void = () => undefined;
      mockRegisterUser.mockImplementationOnce(
        () => new Promise((resolve) => { answer = resolve; })
      );

      renderUserRegister();
      fillForm();

      fireEvent.click(screen.getByRole('button', { name: '註冊' }));

      expect(screen.getByTestId('loading-overlay')).toHaveAttribute('data-active', 'true');

      await act(async () => {
        answer({ status: 200 });
      });

      expect(screen.getByTestId('loading-overlay')).toHaveAttribute('data-active', 'false');
    });

    test('shows success toast on successful registration', async () => {
      renderUserRegister();
      fillForm();

      fireEvent.click(screen.getByRole('button', { name: '註冊' }));

      // Let the request settle inside act, so React applies the state updates it causes before
      // the assertions run (a bare setTimeout(0) can fire before React's scheduled render).
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(toast.success).toHaveBeenCalledWith('新增使用者成功');
    });

    test('resets form after successful registration', async () => {
      renderUserRegister();
      fillForm();

      fireEvent.click(screen.getByRole('button', { name: '註冊' }));

      // Wait for async operations to complete
      await new Promise(resolve => setTimeout(resolve, 50));

      // The component calls initialState() which resets all values to ''
      // Note: The inputs are uncontrolled (no value prop), so we verify the mock was called
      expect(mockRegisterUser).toHaveBeenCalled();
    });

    // A taken employee ID or an unknown role is something the admin can fix, so the backend's
    // answer is shown in Chinese; any other failure gets the usual request-failed handling.
    test.each([
      [
        'a taken employee ID',
        Object.assign(new Error('400'), {
          response: { status: 400, data: { success: false, message: 'EmployeeId is already exists!' } },
        }),
        '員工編號已存在',
      ],
      [
        'a role the backend does not know',
        Object.assign(new Error('400'), {
          response: { status: 400, data: { success: false, message: 'Role setting error' } },
        }),
        '角色設定錯誤',
      ],
      [
        'another message from the app (4xx)',
        Object.assign(new Error('400'), {
          response: { status: 400, data: { success: false, message: '其他後端訊息' } },
        }),
        '其他後端訊息',
      ],
      [
        'a known message on a 5xx (not translated)',
        Object.assign(new Error('500'), {
          response: { status: 500, data: { success: false, message: 'EmployeeId is already exists!' } },
        }),
        REQUEST_FAILED_MESSAGE,
      ],
      [
        'a server error',
        Object.assign(new Error('500'), {
          response: { status: 500, data: { timestamp: 't', status: 500, error: 'Internal Server Error', message: 'SQL [n/a]', path: '/api' } },
        }),
        REQUEST_FAILED_MESSAGE,
      ],
      ['no response', new Error('Network Error'), REQUEST_FAILED_MESSAGE],
    ])('shows the right error toast for %s', async (_name, error, shown) => {
      mockRegisterUser.mockRejectedValue(error);

      renderUserRegister();
      fillForm();

      fireEvent.click(screen.getByRole('button', { name: '註冊' }));

      // Let the request settle inside act, so React applies the state updates it causes before
      // the assertions run (a bare setTimeout(0) can fire before React's scheduled render).
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(toast.error).toHaveBeenCalledTimes(1);
      expect(toast.error).toHaveBeenCalledWith(shown);
    });

    test('hides loading overlay after registration failure', async () => {
      mockRegisterUser.mockRejectedValue(new Error('Registration failed'));

      renderUserRegister();
      fillForm();

      fireEvent.click(screen.getByRole('button', { name: '註冊' }));

      // Let the request settle inside act, so React applies the state updates it causes before
      // the assertions run (a bare setTimeout(0) can fire before React's scheduled render).
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(screen.getByTestId('loading-overlay')).toHaveAttribute('data-active', 'false');
    });
  });

  describe('CSS structure', () => {
    test('has Bootstrap container', () => {
      const { container } = renderUserRegister();
      expect(container.querySelector('.container')).toBeInTheDocument();
    });

    test('has form with Bootstrap classes', () => {
      const { container } = renderUserRegister();
      expect(container.querySelector('.form-control')).toBeInTheDocument();
      expect(container.querySelector('.form-select')).toBeInTheDocument();
      // Bootstrap 4-only classes must not come back.
      expect(container.querySelector('.form-group, .custom-select')).not.toBeInTheDocument();
    });

    test('submit button has Bootstrap classes', () => {
      renderUserRegister();

      const button = screen.getByRole('button', { name: '註冊' });
      expect(button).toHaveClass('btn', 'btn-primary', 'w-100');
      expect(button).not.toHaveClass('btn-block');
    });
  });
});
