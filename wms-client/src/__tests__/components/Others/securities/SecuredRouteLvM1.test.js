import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import SecuredRouteLvM1 from '../../../../components/Others/securities/SecuredRouteLvM1';

const mockStore = configureMockStore([]);

// Test component to render
const TestComponent = () => <div data-testid="protected-content">Protected Content</div>;

// Helper to render with providers
const renderWithProviders = (store, initialEntries = ['/protected']) => {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={initialEntries}>
        <SecuredRouteLvM1 path="/protected" component={TestComponent} />
        <Route path="/login">
          <div data-testid="login-page">Login Page</div>
        </Route>
        <Route exact path="/">
          <div data-testid="home-page">Home Page</div>
        </Route>
      </MemoryRouter>
    </Provider>
  );
};

describe('SecuredRouteLvM1', () => {
  describe('when user is not authenticated', () => {
    test('redirects to login page', () => {
      const store = mockStore({
        user: {
          validToken: false,
          user: {}
        }
      });

      renderWithProviders(store);

      expect(screen.getByTestId('login-page')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
  });

  describe('when user is authenticated but not authorized', () => {
    test('redirects to home page for ROLE_Normal user', () => {
      const store = mockStore({
        user: {
          validToken: true,
          user: { role: { authority: 'ROLE_Normal' } }
        }
      });

      renderWithProviders(store);

      expect(screen.getByTestId('home-page')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    test('redirects to home page for ROLE_Sales user', () => {
      const store = mockStore({
        user: {
          validToken: true,
          user: { role: { authority: 'ROLE_Sales' } }
        }
      });

      renderWithProviders(store);

      expect(screen.getByTestId('home-page')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
  });

  describe('when user is authorized (Operator or Admin)', () => {
    test('renders protected component for ROLE_Operator user', () => {
      const store = mockStore({
        user: {
          validToken: true,
          user: { role: { authority: 'ROLE_Operator' } }
        }
      });

      renderWithProviders(store);

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
      expect(screen.queryByTestId('home-page')).not.toBeInTheDocument();
    });

    test('renders protected component for ROLE_Admin user', () => {
      const store = mockStore({
        user: {
          validToken: true,
          user: { role: { authority: 'ROLE_Admin' } }
        }
      });

      renderWithProviders(store);

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
      expect(screen.queryByTestId('home-page')).not.toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    test('handles user with unknown role', () => {
      const store = mockStore({
        user: {
          validToken: true,
          user: { role: { authority: 'ROLE_Unknown' } }
        }
      });

      renderWithProviders(store);

      // Unknown roles fall through to default case and redirect to home
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });

    test('handles missing role object - component throws error', () => {
      const store = mockStore({
        user: {
          validToken: true,
          user: {}
        }
      });

      // This will throw because user.role.authority will fail
      // The component doesn't handle this case gracefully
      // We suppress console.error for this expected error
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => renderWithProviders(store)).toThrow();

      consoleSpy.mockRestore();
    });
  });
});
