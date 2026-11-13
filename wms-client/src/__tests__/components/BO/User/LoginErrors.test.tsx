import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import { applyMiddleware, createStore } from 'redux';
import { thunk } from 'redux-thunk';
import rootReducer from '../../../../reducers';
import API from '../../../../utilities/API';
import { GET_Errors } from '../../../../types';
import Login from '../../../../components/BO/User/Login';

// A wrong employee ID or password gets 401 with
// { username: "無效的員工編號", password: "無效的密碼" } (backend InvalidLoginResponse). The login
// action stores that body in state.errors.errors, and the form must show it.

vi.mock('../../../../utilities/API', () => ({
  default: { post: vi.fn(), get: vi.fn(), defaults: { headers: { common: {} } } },
}));

const invalidLogin = { username: '無效的員工編號', password: '無效的密碼' };

const makeStore = () => createStore(rootReducer, applyMiddleware(thunk));

const renderLogin = (store = makeStore()) => {
  const view = render(
    <Provider store={store}>
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    </Provider>
  );
  return { ...view, store };
};

const fields = (container: HTMLElement) => ({
  employeeId: container.querySelector<HTMLInputElement>('input[name=employeeId]')!,
  password: container.querySelector<HTMLInputElement>('input[name=password]')!,
});

const submit = async (container: HTMLElement, employeeId: string, password: string) => {
  const { employeeId: idInput, password: pwInput } = fields(container);
  fireEvent.change(idInput, { target: { name: 'employeeId', value: employeeId } });
  fireEvent.change(pwInput, { target: { name: 'password', value: password } });
  await act(async () => {
    fireEvent.submit(idInput.closest('form')!);
  });
};

beforeEach(() => {
  vi.mocked(API.post).mockReset().mockRejectedValue(
    Object.assign(new Error('Request failed with status code 401'), {
      response: { status: 401, data: invalidLogin },
    })
  );
});

describe('Login errors', () => {
  test('a rejected login shows the backend messages under both fields', async () => {
    const { container } = renderLogin();

    await submit(container, 'admin', 'wrong-password');

    expect(screen.getByText('無效的員工編號')).toBeInTheDocument();
    expect(screen.getByText('無效的密碼')).toBeInTheDocument();
    const { employeeId, password } = fields(container);
    expect(employeeId).toHaveClass('is-invalid');
    expect(password).toHaveClass('is-invalid');
  });

  test('typing in a field clears its message', async () => {
    const { container } = renderLogin();
    await submit(container, 'admin', 'wrong-password');

    fireEvent.change(fields(container).password, { target: { name: 'password', value: 'x' } });

    expect(screen.queryByText('無效的密碼')).not.toBeInTheDocument();
    expect(screen.getByText('無效的員工編號')).toBeInTheDocument();
  });

  test('the login button is usable again after a rejected login', async () => {
    const { container } = renderLogin();
    await submit(container, 'admin', 'wrong-password');

    const button = container.querySelector<HTMLButtonElement>('button[type=submit]')!;
    expect(button).toBeEnabled();
  });

  test('messages from an earlier failed login are not shown when the page opens again', () => {
    const store = makeStore();
    store.dispatch({ type: GET_Errors, payload: invalidLogin });

    const { container } = renderLogin(store);
    const { employeeId, password } = fields(container);
    fireEvent.blur(employeeId);
    fireEvent.blur(password);

    expect(screen.queryByText('無效的員工編號')).not.toBeInTheDocument();
    expect(screen.queryByText('無效的密碼')).not.toBeInTheDocument();
  });
});
