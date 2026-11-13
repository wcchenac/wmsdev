import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import { thunk } from 'redux-thunk';
import rootReducer from '../../../../../reducers';
import API from '../../../../../utilities/API';
import NormalStockBoard from '../../../../../components/BO/Stock/InStock/NormalStockBoard';
import AssembleStockBoard from '../../../../../components/BO/Stock/InStock/AssembleStockBoard';
import CustomerReturnBoard from '../../../../../components/BO/Stock/InStock/CustomerReturnBoard';
import StoreReturnBoard from '../../../../../components/BO/Stock/InStock/StoreReturnBoard';

// After a product is submitted in Step 3, the products the user left unticked in Step 2 must
// stay unticked: once every ticked product is in, the page says the job is done and returns to
// Step 1. (dev only marked the submitted product; it did not re-query the order.)

vi.mock('../../../../../utilities/API', () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

// Like the backend: every query returns a new object, and P1's remaining quantity drops to 0
// once P1 has been submitted.
let p1Submitted = false;
const order = () => ({
  currentStatus: {
    P1: { 板卷: { quantity: '40.00', unit: '碼' } },
    P2: { 板卷: { quantity: '25.00', unit: '碼' } },
  },
  waitHandleStatus: {
    P1: { 板卷: { quantity: p1Submitted ? '0.00' : '40.00', unit: '碼' } },
    P2: { 板卷: { quantity: '25.00', unit: '碼' } },
  },
});

const mockedGet = vi.mocked(API.get);
const mockedPost = vi.mocked(API.post);

describe.each([
  ['進貨單入庫', NormalStockBoard],
  ['組裝單入庫', AssembleStockBoard],
  ['退貨單入庫', CustomerReturnBoard],
  ['調撥單入庫', StoreReturnBoard],
])('%s submit', (_name, Board) => {
  beforeEach(() => {
    p1Submitted = false;
    mockedGet.mockReset().mockImplementation(async () => ({ status: 200, data: order() }));
    mockedPost.mockReset().mockImplementation(async () => {
      p1Submitted = true;
      return { status: 200, data: {} };
    });
  });

  test('submitting the only ticked product finishes the job instead of bringing back unticked ones', async () => {
    const store = createStore(rootReducer, applyMiddleware(thunk));
    const { container } = render(
      <Provider store={store}>
        <Board />
      </Provider>
    );

    // Step 1: query the order.
    const orderInput = container.querySelector<HTMLInputElement>('input[name=orderNo]')!;
    fireEvent.change(orderInput, { target: { value: 'X1', name: 'orderNo' } });
    await act(async () => {
      fireEvent.submit(orderInput.closest('form')!);
    });
    await waitFor(() => expect(container.querySelector('.nav-link.active')).toHaveTextContent('Step 2'));

    // Step 2: untick P2, keep P1.
    const p2 = container.querySelector<HTMLInputElement>('#checkbox-1')!;
    expect(p2).toBeChecked();
    fireEvent.click(p2);
    expect(p2).not.toBeChecked();
    fireEvent.click(screen.getByRole('button', { name: '下一步' }));

    // Step 3: only P1 is shown; fill its quantity and submit.
    const pane = container.querySelector<HTMLElement>('.tab-pane.active .tab-pane.active')
      ?? container.querySelector<HTMLElement>('.tab-pane.active')!;
    const quantity = pane.querySelector<HTMLInputElement>('input[placeholder="數量"]')!;
    fireEvent.change(quantity, { target: { value: '40', name: 'quantity' } });
    const submit = Array.from(pane.querySelectorAll<HTMLButtonElement>('button')).find((b) => b.textContent === '送出')!;
    expect(submit).toBeEnabled();
    await act(async () => {
      fireEvent.click(submit);
    });

    // Let any follow-up request and state update settle before looking at the result.
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    expect(mockedPost).toHaveBeenCalledTimes(1);
    expect(screen.getByText('此次入庫作業已完成')).toBeInTheDocument();
    // The order is not queried again, so P2 does not come back as a new tab.
    expect(mockedGet).toHaveBeenCalledTimes(1);
    const step3 = container.querySelector<HTMLElement>('.tab-pane.active')!;
    const prev = Array.from(step3.querySelectorAll<HTMLButtonElement>('button')).find((b) => b.textContent === '上一步')!;
    expect(prev).toBeDisabled();
  });
});
