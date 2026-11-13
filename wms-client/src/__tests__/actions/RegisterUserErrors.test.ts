import { applyMiddleware, createStore } from 'redux';
import { thunk } from 'redux-thunk';
import rootReducer from '../../reducers';
import API from '../../utilities/API';
import { registerUser } from '../../actions/UserActions';

// UserRegister shows no field messages from the store: a failed registration only gets its
// 「register fail」 toast. So a failure stores just the generic message, never the response
// body (a Spring 500 body carries the exception text).

vi.mock('../../utilities/API', () => ({
  default: { post: vi.fn() },
}));

const newUser = {
  employeeId: 'NEW001',
  fullName: '新員工',
  password: 'pw',
  role: 'ROLE_Normal',
  username: 'NEW001',
  confirmPassword: 'pw',
};

const failure = (status: number | undefined, data?: unknown) =>
  Object.assign(new Error('failed'), status === undefined ? {} : { response: { status, data } });

describe('registerUser failure', () => {
  test.each([
    [
      'a Spring 500 body with the exception text',
      failure(500, {
        timestamp: '2026-11-13T05:00:00.000+0000',
        status: 500,
        error: 'Internal Server Error',
        message: 'could not execute statement; SQL [n/a]; constraint [UK_employee_id]',
        path: '/api/user/adminManagement/user/register',
      }),
    ],
    [
      'a Spring 400 body from @Valid',
      failure(400, {
        timestamp: '2026-11-13T05:00:00.000+0000',
        status: 400,
        error: 'Bad Request',
        errors: [{ field: 'fullName', defaultMessage: 'Please enter your fullName' }],
        path: '/api/user/adminManagement/user/register',
      }),
    ],
    ['the app\'s ApiResponse (employee ID taken)', failure(400, { success: false, message: 'EmployeeId is already exists!' })],
    ['an HTML error page from the proxy', failure(502, '<html>502 Bad Gateway</html>')],
    ['no response', failure(undefined)],
  ])('%s stores only 「註冊失敗」', async (_name, error) => {
    vi.mocked(API.post).mockReset().mockRejectedValue(error);
    const store = createStore(rootReducer, applyMiddleware(thunk));

    await expect(store.dispatch(registerUser(newUser))).rejects.toBe(error);

    expect(store.getState().errors.errors).toEqual({ message: '註冊失敗' });
  });
});
