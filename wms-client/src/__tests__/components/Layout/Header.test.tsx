import React from 'react';
import { render, screen, fireEvent, RenderResult } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore, { MockStoreEnhanced } from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import Header from '../../../components/Layout/Header';

interface MockHeaderStockFunctionsProps {
  isAuthencated: boolean;
  authority: string | null;
}

interface MockHeaderUserFunctionsProps {
  isAuthencated: boolean;
  fullName: string;
  authority: string | null;
  logout: () => void;
}

interface StoreState {
  user: {
    validToken: boolean;
    user: {
      fullName?: string;
      role?: string | { authority: string };
    };
  };
}

// Mock child components
vi.mock('../../../components/Layout/HeaderStockFunctions', () => ({ default: (() => {
  return function MockHeaderStockFunctions(props: MockHeaderStockFunctionsProps): JSX.Element {
    return (
      <div data-testid="header-stock-functions"
           data-authenticated={props.isAuthencated}
           data-authority={props.authority}>
        Stock Functions
      </div>
    );
  };
})() }));

vi.mock('../../../components/Layout/HeaderUserFunctions', () => ({ default: (() => {
  return function MockHeaderUserFunctions(props: MockHeaderUserFunctionsProps): JSX.Element {
    return (
      <div data-testid="header-user-functions"
           data-authenticated={props.isAuthencated}
           data-fullname={props.fullName}
           data-authority={props.authority}>
        <button onClick={props.logout} data-testid="logout-button">Logout</button>
      </div>
    );
  };
})() }));

// Mock logout action
const mockLogout = vi.fn();
vi.mock('../../../actions/UserActions', () => ({
  logout: () => mockLogout
}));

const mockStore = configureMockStore([thunk]);

// Helper to render with providers
const renderWithProviders = (store: MockStoreEnhanced<unknown>): RenderResult => {
  return render(
    <Provider store={store}>
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Header />
      </MemoryRouter>
    </Provider>
  );
};

describe('Header', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original location
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true
    });
  });

  describe('rendering', () => {
    test('renders navbar with brand link', () => {
      const store = mockStore({
        user: {
          validToken: false,
          user: {}
        }
      });

      renderWithProviders(store);

      expect(screen.getByText('庫存管理工具')).toBeInTheDocument();
    });

    test('renders navbar-toggler button for mobile', () => {
      const store = mockStore({
        user: {
          validToken: false,
          user: {}
        }
      });

      const { container } = renderWithProviders(store);

      // The toggle button has an empty aria-label when closed ("開啟導覽選單")
      const toggleButton = container.querySelector('.navbar-toggler');
      expect(toggleButton).toBeInTheDocument();
      expect(toggleButton).toHaveClass('navbar-toggler');
    });

    test('brand link navigates to home', () => {
      const store = mockStore({
        user: {
          validToken: false,
          user: {}
        }
      });

      renderWithProviders(store);

      const brandLink = screen.getByText('庫存管理工具');
      expect(brandLink.closest('a')).toHaveAttribute('href', '/');
    });
  });

  describe('unauthenticated user', () => {
    test('passes isAuthencated=false to child components', () => {
      const store = mockStore({
        user: {
          validToken: false,
          user: {}
        }
      });

      renderWithProviders(store);

      expect(screen.getByTestId('header-stock-functions')).toHaveAttribute('data-authenticated', 'false');
      expect(screen.getByTestId('header-user-functions')).toHaveAttribute('data-authenticated', 'false');
    });

    test('passes null authority when no role', () => {
      const store = mockStore({
        user: {
          validToken: false,
          user: {}
        }
      });

      renderWithProviders(store);

      // authority is null when user.role is undefined, React converts null to empty string or removes attribute
      const stockFunctions = screen.getByTestId('header-stock-functions');
      // When authority is null, the attribute will be "null" as a string or not present
      expect(stockFunctions.getAttribute('data-authority')).toBeNull();
    });
  });

  describe('authenticated user', () => {
    test('passes isAuthencated=true to child components', () => {
      const store = mockStore({
        user: {
          validToken: true,
          user: {
            fullName: 'Test User',
            role: { authority: 'ROLE_Admin' }
          }
        }
      });

      renderWithProviders(store);

      expect(screen.getByTestId('header-stock-functions')).toHaveAttribute('data-authenticated', 'true');
      expect(screen.getByTestId('header-user-functions')).toHaveAttribute('data-authenticated', 'true');
    });

    test('passes user authority to child components', () => {
      const store = mockStore({
        user: {
          validToken: true,
          user: {
            fullName: 'Test User',
            role: { authority: 'ROLE_Admin' }
          }
        }
      });

      renderWithProviders(store);

      expect(screen.getByTestId('header-stock-functions')).toHaveAttribute('data-authority', 'ROLE_Admin');
      expect(screen.getByTestId('header-user-functions')).toHaveAttribute('data-authority', 'ROLE_Admin');
    });

    test('passes fullName to HeaderUserFunctions', () => {
      const store = mockStore({
        user: {
          validToken: true,
          user: {
            fullName: 'John Doe',
            role: { authority: 'ROLE_Operator' }
          }
        }
      });

      renderWithProviders(store);

      expect(screen.getByTestId('header-user-functions')).toHaveAttribute('data-fullname', 'John Doe');
    });
  });

  describe('logout functionality', () => {
    test('logout redirects to home page', () => {
      // Mock window.location.href assignment
      const locationHrefSpy = vi.fn();
      Object.defineProperty(window, 'location', {
        value: { href: '', set href(value: string) { locationHrefSpy(value); } },
        writable: true,
        configurable: true
      });

      const store = mockStore({
        user: {
          validToken: true,
          user: {
            fullName: 'Test User',
            role: { authority: 'ROLE_Admin' }
          }
        }
      });

      renderWithProviders(store);

      const logoutButton = screen.getByTestId('logout-button');
      fireEvent.click(logoutButton);

      expect(locationHrefSpy).toHaveBeenCalledWith('/');
    });
  });

  describe('different user roles', () => {
    test.each([
      ['ROLE_Normal', '一般人員'],
      ['ROLE_Sales', '業務'],
      ['ROLE_Operator', '庫存相關人員'],
      ['ROLE_Admin', '管理員']
    ])('handles %s role correctly', (roleAuthority) => {
      const store = mockStore({
        user: {
          validToken: true,
          user: {
            fullName: 'Test User',
            role: { authority: roleAuthority }
          }
        }
      });

      renderWithProviders(store);

      expect(screen.getByTestId('header-stock-functions')).toHaveAttribute('data-authority', roleAuthority);
    });
  });

  describe('navbar structure', () => {
    test('has correct Bootstrap classes', () => {
      const store = mockStore({
        user: {
          validToken: false,
          user: {}
        }
      });

      const { container } = renderWithProviders(store);

      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('navbar');
      expect(nav).toHaveClass('sticky-top');
      expect(nav).toHaveClass('navbar-expand-sm');
      expect(nav).toHaveClass('navbar-dark');
      expect(nav).toHaveClass('bg-primary');
      expect(nav).toHaveClass('mb-4');
    });

    test('has container div', () => {
      const store = mockStore({
        user: {
          validToken: false,
          user: {}
        }
      });

      const { container } = renderWithProviders(store);

      const containerDiv = container.querySelector('.container');
      expect(containerDiv).toBeInTheDocument();
    });

    test('has collapsible navigation', () => {
      const store = mockStore({
        user: {
          validToken: false,
          user: {}
        }
      });

      const { container } = renderWithProviders(store);

      const collapse = container.querySelector('#mobile-nav');
      expect(collapse).toBeInTheDocument();
      expect(collapse).toHaveClass('navbar-collapse');
    });
  });
});
