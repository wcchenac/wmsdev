import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import SecuredRouteLvL3 from '../../../../components/Others/securities/SecuredRouteLvL3';

const mockStore = configureMockStore([]);

const TestComponent = () => <div data-testid="protected-content">Protected Content</div>;

const renderWithProviders = (store, initialEntries = ['/protected']) => {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={initialEntries}>
        <SecuredRouteLvL3 path="/protected" component={TestComponent} />
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

describe('SecuredRouteLvL3', () => {
  describe('when user is not authenticated', () => {
    test('redirects to login page', () => {
      const store = mockStore({
        user: { validToken: false, user: {} }
      });

      renderWithProviders(store);
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });
  });

  describe('when user is authenticated', () => {
    test('allows ROLE_Normal user', () => {
      const store = mockStore({
        user: { validToken: true, user: { role: { authority: 'ROLE_Normal' } } }
      });

      renderWithProviders(store);
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    test('allows ROLE_Admin user', () => {
      const store = mockStore({
        user: { validToken: true, user: { role: { authority: 'ROLE_Admin' } } }
      });

      renderWithProviders(store);
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    test('redirects ROLE_Sales user to home', () => {
      const store = mockStore({
        user: { validToken: true, user: { role: { authority: 'ROLE_Sales' } } }
      });

      renderWithProviders(store);
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });

    test('redirects ROLE_Operator user to home', () => {
      const store = mockStore({
        user: { validToken: true, user: { role: { authority: 'ROLE_Operator' } } }
      });

      renderWithProviders(store);
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });
  });
});
