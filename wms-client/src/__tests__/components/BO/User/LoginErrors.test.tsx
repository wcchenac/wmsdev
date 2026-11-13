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

describe('Login when the request itself fails', () => {
  // No response (network down, backend unreachable): the login action stores
  // { message: "登入失敗，請檢查帳號密碼" }, which belongs to neither field.
  beforeEach(() => {
    vi.mocked(API.post).mockReset().mockRejectedValue(new Error('Network Error'));
  });

  test('shows the message above the login button', async () => {
    const { container } = renderLogin();

    await submit(container, 'admin', 'admin123');

    // The field messages are alerts too, so look the form message up by its text.
    const alert = screen.getByText('登入失敗，請檢查帳號密碼').closest<HTMLElement>('[role=alert]')!;
    expect(alert).toHaveClass('alert', 'alert-danger');
    expect(alert.compareDocumentPosition(container.querySelector('button[type=submit]')!)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
    // It is not a field error.
    const { employeeId, password } = fields(container);
    expect(employeeId).not.toHaveClass('is-invalid');
    expect(password).not.toHaveClass('is-invalid');
  });

  test('typing in either field clears the message', async () => {
    const { container } = renderLogin();
    await submit(container, 'admin', 'admin123');

    fireEvent.change(fields(container).employeeId, { target: { name: 'employeeId', value: 'admin2' } });

    expect(screen.queryByText('登入失敗，請檢查帳號密碼')).not.toBeInTheDocument();
  });

  test('a later rejected login replaces it with the field messages', async () => {
    const { container } = renderLogin();
    await submit(container, 'admin', 'admin123');

    vi.mocked(API.post).mockRejectedValue(
      Object.assign(new Error('401'), { response: { status: 401, data: invalidLogin } })
    );
    await submit(container, 'admin', 'wrong-password');

    expect(screen.queryByText('登入失敗，請檢查帳號密碼')).not.toBeInTheDocument();
    expect(screen.getByText('無效的密碼')).toBeInTheDocument();
  });

  test('a message from another page is not shown when the login page opens', () => {
    const store = makeStore();
    store.dispatch({ type: GET_Errors, payload: { message: '無法取得庫存資料' } });

    renderLogin(store);

    expect(screen.queryByText('無法取得庫存資料')).not.toBeInTheDocument();
  });
});

describe('Login valid marks', () => {
  // A green check (is-valid) only means the field has a value. While a login failure is on
  // screen it would contradict the error, so neither field gets one.
  const marks = (container: HTMLElement) => {
    const { employeeId, password } = fields(container);
    return {
      employeeId: employeeId.classList.contains('is-valid'),
      password: password.classList.contains('is-valid'),
    };
  };

  test('filled fields get a check before any login attempt', () => {
    const { container } = renderLogin();
    const { employeeId, password } = fields(container);
    fireEvent.change(employeeId, { target: { name: 'employeeId', value: 'admin' } });
    fireEvent.blur(employeeId);
    fireEvent.change(password, { target: { name: 'password', value: 'admin123' } });
    fireEvent.blur(password);

    expect(marks(container)).toEqual({ employeeId: true, password: true });
  });

  test('no checks while the request-failed message is shown', async () => {
    vi.mocked(API.post).mockReset().mockRejectedValue(new Error('Network Error'));
    const { container } = renderLogin();

    await submit(container, 'admin', 'admin123');

    expect(screen.getByText('登入失敗，請檢查帳號密碼')).toBeInTheDocument();
    expect(marks(container)).toEqual({ employeeId: false, password: false });
  });

  test('no check on a field while the other field still shows its error', async () => {
    const { container } = renderLogin();
    await submit(container, 'admin', 'wrong-password');

    fireEvent.change(fields(container).password, { target: { name: 'password', value: 'admin123' } });

    expect(screen.getByText('無效的員工編號')).toBeInTheDocument();
    expect(marks(container)).toEqual({ employeeId: false, password: false });
  });

  test('checks come back once every error has been cleared by typing', async () => {
    const { container } = renderLogin();
    await submit(container, 'admin', 'wrong-password');

    fireEvent.change(fields(container).employeeId, { target: { name: 'employeeId', value: 'admin2' } });
    fireEvent.change(fields(container).password, { target: { name: 'password', value: 'admin123' } });

    expect(marks(container)).toEqual({ employeeId: true, password: true });
  });
});

describe('Login when the proxy answers with an error page', () => {
  // Behind nginx, a backend that is down gives 502 with an HTML body, so error.response.data
  // is a string, not { username, password }.
  beforeEach(() => {
    vi.mocked(API.post).mockReset().mockRejectedValue(
      Object.assign(new Error('Request failed with status code 502'), {
        response: { status: 502, data: '<html><body><h1>502 Bad Gateway</h1></body></html>' },
      })
    );
  });

  test('shows the request-failed message', async () => {
    const { container } = renderLogin();

    await submit(container, 'admin', 'admin123');

    expect(screen.getByText('登入失敗，請檢查帳號密碼')).toBeInTheDocument();
  });

  test('the login button works again after a second failed attempt', async () => {
    const { container } = renderLogin();
    const button = () => container.querySelector<HTMLButtonElement>('button[type=submit]')!;

    await submit(container, 'admin', 'admin123');
    expect(button()).toBeEnabled();

    await submit(container, 'admin', 'admin123');
    expect(button()).toBeEnabled();
    expect(button()).toHaveTextContent('登入');
    expect(button()).not.toHaveTextContent('登入中');
  });
});

describe('Login button while signing in', () => {
  test('screen readers hear 「登入中...」 once', async () => {
    // Keep the request pending so the button stays in its busy state.
    vi.mocked(API.post).mockReset().mockReturnValue(new Promise(() => undefined));
    const { container } = renderLogin();

    await submit(container, 'admin', 'admin123');

    const button = screen.getByRole('button', { name: /登入中/ });
    expect(button).toHaveAccessibleName('登入中...');
    expect(button).toBeDisabled();
  });
});

describe('Login when the backend answers with something other than InvalidLoginResponse', () => {
  // Only { username, password } is meant for the form. A Spring error body (500 with the
  // exception text) must not end up in the store or on screen.
  const springError = {
    timestamp: '2026-11-13T02:00:00.000+0000',
    status: 500,
    error: 'Internal Server Error',
    message: 'could not execute query; SQL [n/a]; nested exception is org.hibernate.exception.JDBCConnectionException',
    path: '/api/user/login',
  };

  beforeEach(() => {
    vi.mocked(API.post).mockReset().mockRejectedValue(
      Object.assign(new Error('Request failed with status code 500'), {
        response: { status: 500, data: springError },
      })
    );
  });

  test('shows the request-failed message, not the exception text', async () => {
    const { container, store } = renderLogin();

    await submit(container, 'admin', 'admin123');

    expect(screen.getByText('登入失敗，請檢查帳號密碼')).toBeInTheDocument();
    expect(screen.queryByText(/JDBCConnectionException/)).not.toBeInTheDocument();
    expect(store.getState().errors.errors).toEqual({ message: '登入失敗，請檢查帳號密碼' });
  });

  test('keeps only the field messages when the body has other keys too', async () => {
    vi.mocked(API.post).mockReset().mockRejectedValue(
      Object.assign(new Error('Request failed with status code 401'), {
        response: { status: 401, data: { ...invalidLogin, trace: 'at com.wmstool...' } },
      })
    );
    const { container, store } = renderLogin();

    await submit(container, 'admin', 'wrong');

    expect(store.getState().errors.errors).toEqual(invalidLogin);
  });

  test('field messages that are not strings are not used', async () => {
    vi.mocked(API.post).mockReset().mockRejectedValue(
      Object.assign(new Error('Request failed with status code 401'), {
        response: { status: 401, data: { username: 42, password: null } },
      })
    );
    const { container, store } = renderLogin();

    await submit(container, 'admin', 'wrong');

    expect(store.getState().errors.errors).toEqual({ message: '登入失敗，請檢查帳號密碼' });
  });
});
