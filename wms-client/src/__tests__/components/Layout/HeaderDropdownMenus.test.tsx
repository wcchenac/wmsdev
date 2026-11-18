import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import { applyMiddleware, createStore } from 'redux';
import { thunk } from 'redux-thunk';
import rootReducer from '../../../reducers';
import { SET_Current_User } from '../../../types';
import Header from '../../../components/Layout/Header';

// The nav dropdowns (入庫作業, 庫存異動作業) are laid out by Bootstrap's navbar CSS: static in
// the collapsed toggler menu, so an opened dropdown pushes the items below it down, and absolute
// once the role's navbar-expand-* breakpoint is reached. Positioned by Popper instead, they got
// an inline `position: absolute` and covered 拉貨明細, 歷史記錄查詢 and 檔案總管 in the menu.

const renderHeader = (authority: string) => {
  const store = createStore(rootReducer, applyMiddleware(thunk));
  store.dispatch({
    type: SET_Current_User,
    payload: { employeeId: 'u', fullName: '測試', role: { authority } },
  });
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/stock/2/2']}>
        <Header />
      </MemoryRouter>
    </Provider>
  );
};

describe.each([
  ['ROLE_Admin', ['入庫作業', '庫存異動作業']],
  ['ROLE_Operator', ['入庫作業', '庫存異動作業']],
])('%s', (authority, toggles) => {
  test.each(toggles)('the %s menu is left to Bootstrap navbar CSS, not Popper', async (label) => {
    renderHeader(authority);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: label }));
    });

    const menu = screen.getByRole('button', { name: label }).parentElement!.querySelector<HTMLElement>('.dropdown-menu')!;
    expect(menu).toHaveClass('show');
    expect(menu).toHaveAttribute('data-bs-popper', 'static');
    expect(menu.style.position).toBe('');
    expect(menu.style.transform).toBe('');
  });
});
