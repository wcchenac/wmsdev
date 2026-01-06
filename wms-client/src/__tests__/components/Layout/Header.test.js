import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import Header from '../../../components/Layout/Header';

// Mock child components
jest.mock('../../../components/Layout/HeaderStockFunctions', () => {
  return function MockHeaderStockFunctions(props) {
    return (
      <div data-testid="header-stock-functions"
           data-authenticated={props.isAuthencated}
           data-authority={props.authority}>
        Stock Functions
      </div>
    );
  };
});

jest.mock('../../../components/Layout/HeaderUserFunctions', () => {
  return function MockHeaderUserFunctions(props) {
    return (
      <div data-testid="header-user-functions"
           data-authenticated={props.isAuthencated}
           data-fullname={props.fullName}
           data-authority={props.authority}>
        <button onClick={props.logout} data-testid="logout-button">Logout</button>
      </div>
    );
  };
});

// Mock logout action
const mockLogout = jest.fn();
jest.mock('../../../actions/UserActions', () => ({
  logout: () => mockLogout
}));

const mockStore = configureMockStore([thunk]);

// Helper to render with providers
const renderWithProviders = (store) => {
  return render(
    <Provider store={store}>
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    </Provider>
  );
};

describe('Header', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock window.location
    delete window.location;
    window.location = { href: '' };
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

      renderWithProviders(store);

      const toggleButton = screen.getByRole('button', { name: '' });
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

      expect(window.location.href).toBe('/');
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
