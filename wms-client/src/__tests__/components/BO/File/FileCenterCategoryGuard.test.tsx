import React from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import { thunk } from 'redux-thunk';
import rootReducer from '../../../../reducers';
import { GET_Categories, GET_InStockRollbackList, GET_StockInfoes } from '../../../../types';
import FileCenter from '../../../../components/BO/File/FileCenter';

// Visiting InStockRollback or QueryStock before FileCenter leaves data in state.stockInfo.
// FileCenter must read state.stockInfo.categories (and guard it at runtime) so opening 選擇分類
// never passes an object map to react-select.

vi.mock('../../../../utilities/API', () => {
  const pending = () => new Promise(() => undefined);
  return { default: { get: vi.fn(pending) } };
});

describe('FileCenter category list isolation (C-2)', () => {
  test('opening 選擇分類 does not crash after InStockRollback or QueryStock updates stockInfo', () => {
    const store = createStore(rootReducer, applyMiddleware(thunk));
    store.dispatch({ type: GET_InStockRollbackList, payload: { CF1001: [{ id: 1 }] } });
    store.dispatch({ type: GET_StockInfoes, payload: { result: [{ id: 2 }] } });

    render(
      <Provider store={store}>
        <FileCenter />
      </Provider>
    );

    act(() => {
      store.dispatch({
        type: GET_Categories,
        payload: [
          { value: '棉', label: '棉' },
          { value: '麻', label: '麻' },
        ],
      });
    });

    fireEvent.click(screen.getByRole('button', { name: '選擇分類' }));
    const dialog = screen.getByRole('dialog');
    const selectInput = dialog.querySelector<HTMLInputElement>('input[id^="react-select"]')!;
    fireEvent.keyDown(selectInput, { key: 'ArrowDown', code: 'ArrowDown' });

    expect(within(dialog).getByText('棉')).toBeInTheDocument();
    expect(within(dialog).getByText('麻')).toBeInTheDocument();
  });
});
