import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { useLocation } from 'react-router';
import store from '../store';
import App from '../App';
import { SET_Current_User } from '../types';

// "/" (where login, the logo and ProtectedRoute send people) and any unknown path must lead
// somewhere: signed-out users to /login, signed-in users to their role's first menu page.

vi.mock('../utilities/API', () => ({
  default: { get: vi.fn(() => new Promise(() => undefined)), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));
vi.mock('../components/Layout/Header', () => ({ default: () => <header /> }));

let startAt = '/';
vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof import('react-router')>('react-router');
  function Where() {
    return <output data-testid="path">{useLocation().pathname}</output>;
  }
  return {
    ...actual,
    BrowserRouter: ({ children }: { children: React.ReactNode }) => (
      <actual.MemoryRouter initialEntries={[startAt]}>
        {children}
        <Where />
      </actual.MemoryRouter>
    ),
  };
});

const signIn = (authority?: string) => {
  store.dispatch({
    type: SET_Current_User,
    payload: { employeeId: 'E001', fullName: '王小明', ...(authority ? { role: { authority } } : {}) },
  });
};

const renderAt = async (path: string) => {
  startAt = path; // read by the BrowserRouter stand-in when it renders
  await act(async () => {
    render(<App />);
  });
  return screen.getByTestId('path').textContent;
};

beforeEach(() => {
  store.dispatch({ type: SET_Current_User, payload: {} });
});

describe('"/"', () => {
  test('signed out: goes to /login', async () => {
    expect(await renderAt('/')).toBe('/login');
  });

  test.each([
    ['ROLE_Admin', '/stock/1/1'],
    ['ROLE_Operator', '/stock/1/1'],
    ['ROLE_Normal', '/stock/2/1'],
    ['ROLE_Sales', '/stock/2/2'],
  ])('%s: goes to its first menu page %s', async (role, page) => {
    signIn(role);
    expect(await renderAt('/')).toBe(page);
  });

  test('signed in without a role: stays and says so instead of bouncing to /login', async () => {
    signIn();
    expect(await renderAt('/')).toBe('/');
    expect(screen.getByText(/沒有可使用的功能/)).toBeInTheDocument();
  });
});

describe('unknown paths', () => {
  test('signed out: go to /login', async () => {
    expect(await renderAt('/no-such-page')).toBe('/login');
  });

  test('signed in: go to the role\'s first menu page', async () => {
    signIn('ROLE_Sales');
    expect(await renderAt('/logout')).toBe('/stock/2/2');
  });
});

test('a page the role may not open sends it to its own first page', async () => {
  signIn('ROLE_Sales');
  expect(await renderAt('/admin')).toBe('/stock/2/2');
});

test('an expired token in Redux state redirects to /login on route transition', async () => {
  store.dispatch({
    type: SET_Current_User,
    payload: {
      employeeId: 'E001',
      fullName: '王小明',
      role: { authority: 'ROLE_Admin' },
      exp: Math.floor(Date.now() / 1000) - 60,
    },
  });

  expect(await renderAt('/admin')).toBe('/login');
  expect(store.getState().user.validToken).toBe(false);
});
