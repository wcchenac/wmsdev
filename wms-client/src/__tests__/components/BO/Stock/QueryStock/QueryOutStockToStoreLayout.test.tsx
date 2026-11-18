import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import { thunk } from 'redux-thunk';
import rootReducer from '../../../../../reducers';
import QueryOutStockToStore from '../../../../../components/BO/Stock/QueryStock/QueryOutStockToStore';
import { appCss } from '../../../../helpers/appCss';

const mockGet = vi.fn();
vi.mock('../../../../../utilities/API', () => ({
  default: { get: (...args: unknown[]) => mockGet(...args), post: vi.fn() },
}));

let style: HTMLStyleElement;
beforeAll(() => {
  style = document.createElement('style');
  style.textContent = appCss;
  document.head.appendChild(style);
});
afterAll(() => style.remove());

const rows = [
  {
    productNo: 'CF1001',
    cName: '超細纖維布',
    cCCCODE: 'Microfiber',
    spec: '60" x 50Y',
    packDesc: '捲裝',
  },
  {
    productNo: 'CF1002',
    cName: '斜紋防風布',
    cCCCODE: 'Twill Windproof',
    spec: '58" x 40Y',
    packDesc: '疊裝',
  },
];

async function renderQueriedTable() {
  mockGet.mockResolvedValueOnce({ status: 200, data: rows });
  const store = createStore(rootReducer, applyMiddleware(thunk));
  const rendered = render(
    <Provider store={store}>
      <QueryOutStockToStore />
    </Provider>
  );

  fireEvent.change(screen.getByPlaceholderText('請輸入出庫單單號'), {
    target: { value: 'OS2026001' },
  });
  fireEvent.click(screen.getByRole('button', { name: '查詢' }));
  await screen.findByText('捲裝');
  return rendered;
}

test('headers and cells keep their text on one line inside an overflow: auto box', async () => {
  const { container } = await renderQueriedTable();

  const table = container.querySelector('table')!;
  const cells = [...table.querySelectorAll<HTMLElement>('th, td')];
  expect(cells.length).toBeGreaterThan(10);
  const wrapping = cells.filter((el) => getComputedStyle(el).whiteSpace !== 'nowrap');
  expect(wrapping.map((el) => el.textContent?.trim() || el.tagName)).toEqual([]);
  expect(getComputedStyle(table.parentElement!).overflow).toBe('auto');
});

test('column widths follow the content (no fixed % widths)', async () => {
  const { container } = await renderQueriedTable();

  const fixedWidths = [...container.querySelectorAll<HTMLElement>('thead th')]
    .filter((th) => th.style.width || getComputedStyle(th).width !== 'auto')
    .map((th) => `${th.textContent?.trim()}: ${th.style.width || getComputedStyle(th).width}`);
  expect(fixedWidths).toEqual([]);
  expect(container.querySelector('colgroup')).toBeNull();
});
