import React from 'react';
import { render, screen, fireEvent, RenderResult } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router';
import configureMockStore, { MockStoreEnhanced } from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import Login from '../../../../components/BO/User/Login';

interface LoginRequest {
  employeeId: string;
  password: string;
}

interface StoreState {
  user: {
    validToken: boolean;
    user: Record<string, unknown>;
  };
  errors: {
    errors?: {
      username?: string;
      password?: string;
    };
  };
}

interface RenderLoginResult extends RenderResult {
  store: MockStoreEnhanced<unknown>;
}

// Mock login action
const mockLogin = vi.fn();
vi.mock('../../../../actions/UserActions', () => ({
  login: (loginRequest: LoginRequest) => () => mockLogin(loginRequest)
}));

const mockStore = configureMockStore([thunk]);

// Helper to render Login with all required providers - React Router v6 pattern
const renderLogin = (storeState: Partial<StoreState> = {}, initialPath: string = '/login'): RenderLoginResult => {
  const defaultState: StoreState = {
    user: {
      validToken: false,
      user: {}
    },
    errors: {}
  };

  const store = mockStore({ ...defaultState, ...storeState });

  const result = render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<div data-testid="home-page">Home Page</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );

  return { ...result, store };
};

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    test('renders login form', () => {
      renderLogin();

      expect(screen.getByText('使用者登入')).toBeInTheDocument();
    });

    test('renders employee ID input field', () => {
      renderLogin();

      expect(screen.getByLabelText(/員工編號/)).toBeInTheDocument();
      expect(screen.getByPlaceholderText('請輸入員工編號')).toBeInTheDocument();
    });

    test('renders password input field', () => {
      renderLogin();

      expect(screen.getByLabelText(/密碼/)).toBeInTheDocument();
      expect(screen.getByPlaceholderText('請輸入密碼')).toBeInTheDocument();
    });

    test('renders login button', () => {
      renderLogin();

      expect(screen.getByRole('button', { name: '登入' })).toBeInTheDocument();
    });

    test('password input has type password', () => {
      renderLogin();

      const passwordInput = screen.getByPlaceholderText('請輸入密碼');
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('input handling', () => {
    test('updates employeeId on input change', () => {
      renderLogin();

      const employeeIdInput = screen.getByPlaceholderText('請輸入員工編號') as HTMLInputElement;
      fireEvent.change(employeeIdInput, { target: { value: 'EMP001', name: 'employeeId' } });

      expect(employeeIdInput).toHaveValue('EMP001');
    });

    test('updates password on input change', () => {
      renderLogin();

      const passwordInput = screen.getByPlaceholderText('請輸入密碼') as HTMLInputElement;
      fireEvent.change(passwordInput, { target: { value: 'secret123', name: 'password' } });

      expect(passwordInput).toHaveValue('secret123');
    });
  });

  describe('form submission', () => {
    test('calls login action with credentials on submit', () => {
      renderLogin();

      const employeeIdInput = screen.getByPlaceholderText('請輸入員工編號');
      const passwordInput = screen.getByPlaceholderText('請輸入密碼');
      const submitButton = screen.getByRole('button', { name: '登入' });

      fireEvent.change(employeeIdInput, { target: { value: 'EMP001', name: 'employeeId' } });
      fireEvent.change(passwordInput, { target: { value: 'password123', name: 'password' } });
      fireEvent.click(submitButton);

      expect(mockLogin).toHaveBeenCalledWith({
        employeeId: 'EMP001',
        password: 'password123'
      });
    });

    test('prevents default form submission', () => {
      renderLogin();

      const form = screen.getByRole('button', { name: '登入' }).closest('form') as HTMLFormElement;

      // Simulate form submit
      fireEvent.submit(form);

      // The login action should still be called
      expect(mockLogin).toHaveBeenCalled();
    });

    test('submits with empty fields when not filled', () => {
      renderLogin();

      const submitButton = screen.getByRole('button', { name: '登入' });
      fireEvent.click(submitButton);

      expect(mockLogin).toHaveBeenCalledWith({
        employeeId: '',
        password: ''
      });
    });
  });

  describe('redirect behavior', () => {
    test('redirects to home if already authenticated', () => {
      renderLogin({
        user: {
          validToken: true,
          user: { employeeId: 'EMP001' }
        }
      });

      // Should redirect to home page (which is rendered instead of login)
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });

    test('stays on login page if not authenticated', () => {
      renderLogin({
        user: {
          validToken: false,
          user: {}
        }
      });

      // Should show login form, not home page
      expect(screen.getByText('使用者登入')).toBeInTheDocument();
      expect(screen.queryByTestId('home-page')).not.toBeInTheDocument();
    });
  });

  describe('CSS classes', () => {
    test('has login container class', () => {
      const { container } = renderLogin();

      expect(container.querySelector('.login')).toBeInTheDocument();
    });

    test('has Bootstrap container and row classes', () => {
      const { container } = renderLogin();

      expect(container.querySelector('.container')).toBeInTheDocument();
      expect(container.querySelector('.row')).toBeInTheDocument();
    });

    test('login button has correct Bootstrap classes', () => {
      renderLogin();

      const button = screen.getByRole('button', { name: '登入' });
      expect(button).toHaveClass('btn');
      expect(button).toHaveClass('btn-primary');
      expect(button).toHaveClass('btn-block');
    });
  });

  describe('form structure', () => {
    test('employeeId input has correct name attribute', () => {
      renderLogin();

      const input = screen.getByPlaceholderText('請輸入員工編號');
      expect(input).toHaveAttribute('name', 'employeeId');
    });

    test('password input has correct name attribute', () => {
      renderLogin();

      const input = screen.getByPlaceholderText('請輸入密碼');
      expect(input).toHaveAttribute('name', 'password');
    });

    test('inputs are of type text and password respectively', () => {
      renderLogin();

      expect(screen.getByPlaceholderText('請輸入員工編號')).toHaveAttribute('type', 'text');
      expect(screen.getByPlaceholderText('請輸入密碼')).toHaveAttribute('type', 'password');
    });
  });
});
