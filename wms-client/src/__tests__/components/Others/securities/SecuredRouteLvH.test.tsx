import React from 'react';
import { render, screen, RenderResult } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import configureMockStore, { MockStoreEnhanced } from 'redux-mock-store';
import SecuredRouteLvH from '../../../../components/Others/securities/SecuredRouteLvH';

const mockStore = configureMockStore([]);

// Test component to render
const TestComponent: React.FC = () => <div data-testid="protected-content">Protected Content</div>;

// Helper to render with providers - React Router v6 pattern
const renderWithProviders = (store: MockStoreEnhanced<unknown>, initialEntries: string[] = ['/protected']): RenderResult => {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route element={<SecuredRouteLvH />}>
            <Route path="/protected" element={<TestComponent />} />
          </Route>
          <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
          <Route path="/" element={<div data-testid="home-page">Home Page</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
};

describe('SecuredRouteLvH', () => {
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

  describe('when user is authenticated but not admin', () => {
    test('redirects to home page for ROLE_Normal user', () => {
      const store = mockStore({
        user: {
          validToken: true,
          user: { role: 'ROLE_Normal' }
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
          user: { role: 'ROLE_Sales' }
        }
      });

      renderWithProviders(store);

      expect(screen.getByTestId('home-page')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    test('redirects to home page for ROLE_Operator user', () => {
      const store = mockStore({
        user: {
          validToken: true,
          user: { role: 'ROLE_Operator' }
        }
      });

      renderWithProviders(store);

      expect(screen.getByTestId('home-page')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
  });

  describe('when user is authenticated as admin', () => {
    test('renders protected component for ROLE_Admin user', () => {
      const store = mockStore({
        user: {
          validToken: true,
          user: { role: 'ROLE_Admin' }
        }
      });

      renderWithProviders(store);

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
      expect(screen.queryByTestId('home-page')).not.toBeInTheDocument();
    });
  });

  describe('children prop usage', () => {
    test('renders children when provided directly', () => {
      const store = mockStore({
        user: {
          validToken: true,
          user: { role: 'ROLE_Admin' }
        }
      });

      render(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/']}>
            <SecuredRouteLvH>
              <div data-testid="direct-child">Direct Child</div>
            </SecuredRouteLvH>
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByTestId('direct-child')).toBeInTheDocument();
    });
  });
});
