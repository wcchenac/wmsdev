import { toast } from 'react-toastify';
import { REQUEST_FAILED_MESSAGE, notifyRequestFailed } from '../../utilities/notifyRequestFailed';

// The backend's own message is shown only for a 4xx answer that has a non-empty message (a
// request the user can correct). Server errors and Spring's default bodies ("No message
// available", SQL text) get the generic message instead.

vi.mock('react-toastify', () => ({ toast: { error: vi.fn() } }));

const failure = (status: number | undefined, data?: unknown) =>
  Object.assign(new Error('failed'), status === undefined ? {} : { response: { status, data } });

beforeEach(() => {
  vi.mocked(toast.error).mockReset();
});

describe('notifyRequestFailed', () => {
  test.each([
    ['400 with a message', failure(400, { message: '查無此貨號' }), '查無此貨號'],
    ['409 with a message', failure(409, { message: '貨號已存在' }), '貨號已存在'],
    ['400 with an empty message', failure(400, { message: '' }), REQUEST_FAILED_MESSAGE],
    ['400 with a blank message', failure(400, { message: '   ' }), REQUEST_FAILED_MESSAGE],
    ['400 without a message', failure(400, {}), REQUEST_FAILED_MESSAGE],
    ['400 with a non-string message', failure(400, { message: 42 }), REQUEST_FAILED_MESSAGE],
    ['500 with Spring\'s default message', failure(500, { message: 'No message available' }), REQUEST_FAILED_MESSAGE],
    ['500 with SQL text', failure(500, { message: 'could not execute statement; SQL [n/a]' }), REQUEST_FAILED_MESSAGE],
    ['502 with an HTML page', failure(502, '<html>502 Bad Gateway</html>'), REQUEST_FAILED_MESSAGE],
    ['no response (network down)', failure(undefined), REQUEST_FAILED_MESSAGE],
    ['not an error object', 'oops', REQUEST_FAILED_MESSAGE],
  ])('%s', (_name, error, shown) => {
    notifyRequestFailed(error);
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledWith(shown);
  });

  test('a 401 shows nothing here (API.ts shows the session-expired message)', () => {
    notifyRequestFailed(failure(401, { message: 'Unauthorized' }));
    expect(toast.error).not.toHaveBeenCalled();
  });

  test('the backend message is trimmed', () => {
    notifyRequestFailed(failure(400, { message: '  查無此貨號 \n' }));
    expect(toast.error).toHaveBeenCalledWith('查無此貨號');
  });
});
