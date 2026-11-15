import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { applyMiddleware, createStore } from 'redux';
import { thunk } from 'redux-thunk';
import rootReducer from '../../../reducers';
import { SET_Current_User } from '../../../types';
import Header from '../../../components/Layout/Header';

// Logging out goes straight to the login page inside the app (no /logout route, no full
// reload to a blank "/"). On a phone, the opened menu closes once you pick a page.

function Where() {
  return <output data-testid="path">{useLocation().pathname}</output>;
}

const renderHeader = () => {
  const store = createStore(rootReducer, applyMiddleware(thunk));
  store.dispatch({
    type: SET_Current_User,
    payload: { employeeId: 'admin', fullName: '陳管理', role: { authority: 'ROLE_Admin' } },
  });
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/stock/2/2']}>
        <Header />
        <Routes>
          <Route path="*" element={<Where />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
  return store;
};

beforeEach(() => {
  window.location.href = '';
  vi.mocked(window.localStorage.removeItem).mockReset();
});

describe('logout', () => {
  test('is a button, and nothing links to /logout', () => {
    renderHeader();

    const logout = screen.getByRole('button', { name: '登出' });
    expect(logout).toHaveAttribute('type', 'button');
    expect(document.querySelector('a[href="/logout"]')).toBeNull();
  });

  test('signs out and shows the login page without reloading', async () => {
    const store = renderHeader();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '登出' }));
    });

    expect(store.getState().user.validToken).toBe(false);
    expect(window.localStorage.removeItem).toHaveBeenCalledWith('jwtToken');
    expect(screen.getByTestId('path')).toHaveTextContent('/login');
    expect(window.location.href).toBe('');
  });
});

describe('mobile menu', () => {
  const openMenu = () => {
    const menu = document.getElementById('mobile-nav')!;
    fireEvent.click(screen.getByRole('button', { name: '開啟導覽選單' }));
    expect(menu).toHaveClass('show');
    return menu;
  };

  test('closes after picking a page, even the one already open', async () => {
    renderHeader(); // starts on /stock/2/2, which 庫存查詢 links to
    const menu = openMenu();

    await act(async () => {
      fireEvent.click(screen.getByRole('link', { name: '庫存查詢' }));
    });

    expect(menu).not.toHaveClass('show');
  });

  test('stays open while a dropdown is being opened', async () => {
    renderHeader();
    const menu = openMenu();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '入庫作業' }));
    });

    expect(menu).toHaveClass('show');
  });
});
