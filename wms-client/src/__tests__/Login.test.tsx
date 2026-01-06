import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { createStore, applyMiddleware } from 'redux';
import { thunk } from 'redux-thunk';
import rootReducer from '../reducers';
import Login from '../components/BO/User/Login';

const createMockStore = (initialState = {}) => {
  return createStore(
    rootReducer,
    initialState,
    applyMiddleware(thunk)
  );
};

const renderWithProviders = (component: React.ReactElement, initialState = {}) => {
  const store = createMockStore(initialState);
  return {
    ...render(
      <Provider store={store}>
        <BrowserRouter>
          {component}
        </BrowserRouter>
      </Provider>
    ),
    store
  };
};

describe('Login Component', () => {
  it('renders login form correctly', () => {
    renderWithProviders(<Login />);

    expect(screen.getByText('庫存管理系統')).toBeInTheDocument();
    expect(screen.getByText('使用者登入')).toBeInTheDocument();
    expect(screen.getByLabelText(/員工編號/)).toBeInTheDocument();
    expect(screen.getByLabelText(/密碼/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /登入/ })).toBeInTheDocument();
  });

  it('allows user to type in employee ID and password fields', async () => {
    renderWithProviders(<Login />);

    const employeeIdInput = screen.getByLabelText(/員工編號/);
    const passwordInput = screen.getByLabelText(/密碼/);

    await userEvent.type(employeeIdInput, 'testuser');
    await userEvent.type(passwordInput, 'testpass');

    expect(employeeIdInput).toHaveValue('testuser');
    expect(passwordInput).toHaveValue('testpass');
  });

  it('shows submit button with correct text', () => {
    renderWithProviders(<Login />);

    const submitButton = screen.getByRole('button', { name: /登入/ });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).not.toBeDisabled();
  });

  it('has correct placeholder text', () => {
    renderWithProviders(<Login />);

    expect(screen.getByPlaceholderText('請輸入員工編號')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('請輸入密碼')).toBeInTheDocument();
  });
});
