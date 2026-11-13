import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import { thunk } from 'redux-thunk';
import rootReducer from '../../../../../reducers';
import { GET_StockInfoes } from '../../../../../types';
import StockCategory from '../../../../../components/BO/User/AdminPlatform/StockCategory';

// The category list arrives in the shared stockInfo slice as [{ label, value }]. Only entries
// of that shape become options, so another page's result in the slice is not offered.

vi.mock('../../../../../utilities/API', () => {
  const pending = () => new Promise(() => undefined);
  return { default: { get: vi.fn(pending), post: vi.fn(pending) } };
});

const openMenu = (container: HTMLElement) => {
  const input = container.querySelector<HTMLInputElement>('input[id^="react-select"]')!;
  fireEvent.keyDown(input, { key: 'ArrowDown', code: 'ArrowDown' });
};

const optionTexts = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('[id*="-option-"]'), (o) => o.textContent);

const renderPage = () => {
  const store = createStore(rootReducer, applyMiddleware(thunk));
  const view = render(
    <Provider store={store}>
      <StockCategory />
    </Provider>
  );
  return { ...view, store };
};

describe('庫存類別 options', () => {
  test('the category list becomes the options', () => {
    const { container, store } = renderPage();
    act(() => {
      store.dispatch({ type: GET_StockInfoes, payload: [{ label: '棉', value: '棉' }, { label: '麻', value: '麻' }] });
    });

    openMenu(container);

    expect(optionTexts(container)).toEqual(['棉', '麻']);
  });

  test('another page’s result in the slice is not offered as categories', () => {
    const { container, store } = renderPage();
    act(() => {
      store.dispatch({ type: GET_StockInfoes, payload: [{ id: 7, productNo: 'CF1001' }] });
    });

    openMenu(container);

    expect(optionTexts(container)).toEqual([]);
    expect(screen.queryByText('CF1001')).not.toBeInTheDocument();
  });
});
