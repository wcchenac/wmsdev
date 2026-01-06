import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import SecuredRouteLvL1 from '../../../../components/Others/securities/SecuredRouteLvL1';

const mockStore = configureMockStore([]);

// Test component to render
const TestComponent = () => <div data-testid="protected-content">Protected Content</div>;

// Helper to render with providers
const renderWithProviders = (store, initialEntries = ['/protected']) => {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={initialEntries}>
        <SecuredRouteLvL1 path="/protected" component={TestComponent} />
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

describe('SecuredRouteLvL1', () => {
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

  describe('when user is authenticated with ROLE_Normal', () => {
    test('renders protected component for ROLE_Normal user', () => {
      const store = mockStore({
        user: {
          validToken: true,
          user: { role: { authority: 'ROLE_Normal' } }
        }
      });

      renderWithProviders(store);

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
      expect(screen.queryByTestId('home-page')).not.toBeInTheDocument();
    });
  });

  describe('when user has other roles', () => {
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

    test('redirects to home page for ROLE_Operator user', () => {
      const store = mockStore({
        user: {
          validToken: true,
          user: { role: { authority: 'ROLE_Operator' } }
        }
      });

      renderWithProviders(store);

      expect(screen.getByTestId('home-page')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    test('redirects to home page for ROLE_Admin user', () => {
      const store = mockStore({
        user: {
          validToken: true,
          user: { role: { authority: 'ROLE_Admin' } }
        }
      });

      renderWithProviders(store);

      expect(screen.getByTestId('home-page')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
  });

  describe('route props passing', () => {
    test('passes route props to rendered component', () => {
      const store = mockStore({
        user: {
          validToken: true,
          user: { role: { authority: 'ROLE_Normal' } }
        }
      });

      const PropsTestComponent = (props) => (
        <div data-testid="props-test">
          {props.location && <span data-testid="has-location">has-location</span>}
          {props.match && <span data-testid="has-match">has-match</span>}
          {props.history && <span data-testid="has-history">has-history</span>}
        </div>
      );

      render(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/protected']}>
            <SecuredRouteLvL1 path="/protected" component={PropsTestComponent} />
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByTestId('has-location')).toBeInTheDocument();
      expect(screen.getByTestId('has-match')).toBeInTheDocument();
      expect(screen.getByTestId('has-history')).toBeInTheDocument();
    });
  });
});
