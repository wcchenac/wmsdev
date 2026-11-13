import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import { thunk } from 'redux-thunk';
import { toast } from 'react-toastify';
import rootReducer from '../../../../reducers';
import FileCenter from '../../../../components/BO/File/FileCenter';
import { queryFileCategoryIntervalFiles, queryFileCategoryTodayFile } from '../../../../actions/FileActions';
import { REQUEST_FAILED_MESSAGE } from '../../../../utilities/notifyRequestFailed';

// Looking up today's file or a period's files can fail (backend down, 500). The page must say
// so instead of just turning the spinner off, and a 401 is left to API.ts.

vi.mock('react-toastify', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-toastify')>();
  return { ...actual, toast: Object.assign(vi.fn(), { ...actual.toast, error: vi.fn() }) };
});

vi.mock('../../../../actions/FileActions', () => ({
  queryFileCategoryTodayFile: vi.fn(),
  queryFileCategoryIntervalFiles: vi.fn(),
  queryCategoryDetailList: vi.fn(() => () => Promise.resolve()),
  downloadFile: vi.fn(),
}));

interface QueryProps {
  fileType: string;
  handleFileCategoryCurrentQuery: (fileCategory: string) => void;
  handleFileCategoryPeriodQuery: (fileCategory: string, startDate: string, endDate: string) => void;
}

// Stand-in for the real containers: one button per query.
vi.mock('../../../../components/BO/File/FileContainer', () => ({
  default: (props: QueryProps) => (
    <div>
      <button onClick={() => props.handleFileCategoryCurrentQuery(props.fileType)}>today {props.fileType}</button>
      <button onClick={() => props.handleFileCategoryPeriodQuery(props.fileType, '2026-11-01', '2026-11-13')}>
        period {props.fileType}
      </button>
    </div>
  ),
}));

const httpError = (status: number) =>
  Object.assign(new Error(`Request failed with status code ${status}`), { response: { status, data: {} } });

const clickAndSettle = async (name: string) => {
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name }));
  });
};

const renderPage = () =>
  render(
    <Provider store={createStore(rootReducer, applyMiddleware(thunk))}>
      <FileCenter />
    </Provider>
  );

beforeEach(() => {
  vi.mocked(toast.error).mockReset();
});

describe.each([
  ['today\'s file', 'today allocation', queryFileCategoryTodayFile],
  ['a period\'s files', 'period allocation', queryFileCategoryIntervalFiles],
] as const)('FileCenter looking up %s', (_name, button, query) => {
  test('a failed lookup shows the request-failed message', async () => {
    vi.mocked(query).mockReset().mockRejectedValue(httpError(500));
    renderPage();

    await clickAndSettle(button);

    expect(toast.error).toHaveBeenCalledWith(REQUEST_FAILED_MESSAGE);
  });

  test('a 401 adds no toast (API.ts shows the session-expired message)', async () => {
    vi.mocked(query).mockReset().mockRejectedValue(httpError(401));
    renderPage();

    await clickAndSettle(button);

    expect(toast.error).not.toHaveBeenCalled();
  });
});
