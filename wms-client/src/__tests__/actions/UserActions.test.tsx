import type { Mocked, MockedFunction } from 'vitest';
import { createMockStore } from '../helpers/mockStore';
import * as actions from '../../actions/UserActions';
import * as types from '../../types';
import API from '../../utilities/API';
import SetJWTToken from '../../utilities/SetJWTToken';
import { jwtDecode } from 'jwt-decode';

// Mock dependencies
vi.mock('../../utilities/API');
vi.mock('jwt-decode', () => ({
  jwtDecode: vi.fn()
}));
vi.mock('../../utilities/SetJWTToken', () => ({ default: vi.fn() }));

const mockedAPI = API as Mocked<typeof API>;
const mockedJwtDecode = jwtDecode as MockedFunction<typeof jwtDecode>;

const mockStore = createMockStore;

interface DecodedUser {
  employeeId: string;
  fullname: string;
  role: { authority: string };
  exp: number;
}

const localStorageMock = {
  getItem: vi.mocked(window.localStorage.getItem),
  setItem: vi.mocked(window.localStorage.setItem),
  removeItem: vi.mocked(window.localStorage.removeItem),
  clear: vi.mocked(window.localStorage.clear)
};

describe('UserActions', () => {
  let store: ReturnType<typeof mockStore>;
  const mockToken = 'mock-jwt-token';
  const mockDecodedUser: DecodedUser = {
    employeeId: 'EMP001',
    fullname: 'Test User',
    role: { authority: 'ROLE_Admin' },
    exp: 9999999999
  };

  beforeEach(() => {
    store = mockStore({});
    vi.clearAllMocks();
  });

  describe('registerUser', () => {
    const newUser = {
      employeeId: 'NEW001',
      username: 'NEW001',
      fullName: 'New User',
      password: 'password123',
      confirmPassword: 'password123',
      role: 'ROLE_Normal'
    };

    test('calls API.post with correct endpoint and data', async () => {
      mockedAPI.post.mockResolvedValue({ data: { success: true }, status: 200 });

      await store.dispatch(actions.registerUser(newUser));

      expect(mockedAPI.post).toHaveBeenCalledWith(
        '/api/user/adminManagement/user/register',
        newUser
      );
    });

    test('returns response on success', async () => {
      const response = { data: { success: true }, status: 200 };
      mockedAPI.post.mockResolvedValue(response);

      const result = await store.dispatch(actions.registerUser(newUser));

      expect(result).toEqual(response);
    });

    test('dispatches GET_Errors on API failure', async () => {
      const errorData = { message: 'Employee ID already exists' };
      mockedAPI.post.mockRejectedValue({ response: { data: errorData } });

      try {
        await store.dispatch(actions.registerUser(newUser));
      } catch (err) {
        // expected error
      }

      // Only the generic message is stored, not the body (see RegisterUserErrors.test).
      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0]).toEqual({
        type: types.GET_Errors,
        payload: { message: '註冊失敗' }
      });
    });
  });

  describe('login', () => {
    const loginRequest = {
      employeeId: 'EMP001',
      password: 'password123'
    };

    test('calls API.post with correct endpoint and data', async () => {
      mockedAPI.post.mockResolvedValue({ data: { accessToken: mockToken } });
      mockedJwtDecode.mockReturnValue(mockDecodedUser);

      await store.dispatch(actions.login(loginRequest));

      expect(mockedAPI.post).toHaveBeenCalledWith('/api/user/login', loginRequest);
    });

    test('stores token in localStorage on success', async () => {
      mockedAPI.post.mockResolvedValue({ data: { accessToken: mockToken } });
      mockedJwtDecode.mockReturnValue(mockDecodedUser);

      await store.dispatch(actions.login(loginRequest));

      expect(localStorageMock.setItem).toHaveBeenCalledWith('jwtToken', mockToken);
    });

    test('decodes JWT token and dispatches SET_Current_User and clears errors', async () => {
      mockedAPI.post.mockResolvedValue({ data: { accessToken: mockToken } });
      mockedJwtDecode.mockReturnValue(mockDecodedUser);

      await store.dispatch(actions.login(loginRequest));

      expect(mockedJwtDecode).toHaveBeenCalledWith(mockToken);
      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0]).toEqual({
        type: types.SET_Current_User,
        payload: mockDecodedUser
      });
      expect(dispatchedActions[1]).toEqual({
        type: types.GET_Errors,
        payload: null
      });
    });

    test('does not store token or header when accessToken is missing or malformed', async () => {
      mockedAPI.post.mockResolvedValue({ data: { accessToken: 'bad-token' } });
      mockedJwtDecode.mockImplementation(() => {
        throw new Error('Invalid token specified');
      });

      await store.dispatch(actions.login(loginRequest));

      expect(localStorageMock.setItem).not.toHaveBeenCalled();
      expect(SetJWTToken).not.toHaveBeenCalled();
      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0]).toEqual({
        type: types.GET_Errors,
        payload: { message: '登入失敗，請檢查帳號密碼' }
      });
    });

    test('dispatches GET_Errors on login failure', async () => {
      // Backend InvalidLoginResponse.
      const errorData = { username: '無效的員工編號', password: '無效的密碼' };
      mockedAPI.post.mockRejectedValue({ response: { data: errorData } });

      await store.dispatch(actions.login(loginRequest));

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0]).toEqual({
        type: types.GET_Errors,
        payload: errorData
      });
    });

    test('does not store token on failure', async () => {
      mockedAPI.post.mockRejectedValue({ response: { data: { message: 'error' } } });

      await store.dispatch(actions.login(loginRequest));

      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    test('removes token from localStorage', () => {
      store.dispatch(actions.logout());

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('jwtToken');
    });

    test('dispatches SET_Current_User with empty object', () => {
      store.dispatch(actions.logout());

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0]).toEqual({
        type: types.SET_Current_User,
        payload: {}
      });
    });

    test('logout is a thunk action (returns function)', () => {
      // logout returns a function (thunk), not the dispatched action
      const logoutAction = actions.logout();
      expect(typeof logoutAction).toBe('function');
    });
  });

  describe('getUserList', () => {
    test('calls API.get with correct endpoint', async () => {
      const users = [{ employeeId: '001' }, { employeeId: '002' }];
      mockedAPI.get.mockResolvedValue({ data: users, status: 200 });

      await store.dispatch(actions.getUserList());

      expect(mockedAPI.get).toHaveBeenCalledWith('/api/user/adminManagement/user/userList');
    });

    test('dispatches GET_UserList with response data', async () => {
      const users = [{ employeeId: '001' }, { employeeId: '002' }];
      mockedAPI.get.mockResolvedValue({ data: users, status: 200 });

      await store.dispatch(actions.getUserList());

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0]).toEqual({
        type: types.GET_UserList,
        payload: users
      });
    });

    test('returns response object', async () => {
      const response = { data: [{ employeeId: '001' }], status: 200 };
      mockedAPI.get.mockResolvedValue(response);

      const result = await store.dispatch(actions.getUserList());

      expect(result).toEqual(response);
    });
  });

  describe('deleteUser', () => {
    const employeeId = 'EMP001';

    test('calls API.delete with correct endpoint', async () => {
      mockedAPI.delete.mockResolvedValue({ data: {}, status: 200 });

      await store.dispatch(actions.deleteUser(employeeId));

      expect(mockedAPI.delete).toHaveBeenCalledWith(
        `/api/user/adminManagement/user/delete?employeeId=${employeeId}`
      );
    });

    test('encodes employeeId with special characters in deleteUser query param (C-3)', async () => {
      mockedAPI.delete.mockResolvedValue({ data: {}, status: 200 });

      await store.dispatch(actions.deleteUser('EMP#1&x=2'));

      expect(mockedAPI.delete).toHaveBeenCalledWith(
        '/api/user/adminManagement/user/delete?employeeId=EMP%231%26x%3D2'
      );
    });

    test('dispatches DELETE_User with employeeId on success', async () => {
      mockedAPI.delete.mockResolvedValue({ data: {}, status: 200 });

      await store.dispatch(actions.deleteUser(employeeId));

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0]).toEqual({
        type: types.DELETE_User,
        payload: employeeId
      });
    });

    test('returns response on success', async () => {
      const response = { data: {}, status: 200 };
      mockedAPI.delete.mockResolvedValue(response);

      const result = await store.dispatch(actions.deleteUser(employeeId));

      expect(result).toEqual(response);
    });

    test('dispatches GET_Errors on failure', async () => {
      const errorData = { message: 'Cannot delete user' };
      mockedAPI.delete.mockRejectedValue({ response: { data: errorData } });

      try {
        await store.dispatch(actions.deleteUser(employeeId));
      } catch (err) {
        // expected error
      }

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0]).toEqual({
        type: types.GET_Errors,
        payload: errorData
      });
    });
  });

  describe('updateUser', () => {
    const updateRequest = {
      employeeId: 'EMP001',
      fullName: 'Updated Name',
      role: 'ROLE_Admin'
    };

    test('calls API.patch with correct endpoint and data', async () => {
      mockedAPI.patch.mockResolvedValue({ data: {} });
      mockedAPI.get.mockResolvedValue({ data: [{ employeeId: 'EMP001' }], status: 200 });

      await store.dispatch(actions.updateUser(updateRequest));

      expect(mockedAPI.patch).toHaveBeenCalledWith(
        '/api/user/adminManagement/user/update',
        updateRequest
      );
    });

    test('fetches updated user list after update', async () => {
      mockedAPI.patch.mockResolvedValue({ data: {} });
      mockedAPI.get.mockResolvedValue({ data: [{ employeeId: 'EMP001' }], status: 200 });

      await store.dispatch(actions.updateUser(updateRequest));

      expect(mockedAPI.get).toHaveBeenCalledWith('/api/user/adminManagement/user/userList');
    });

    test('dispatches UPDATE_User with refreshed user list', async () => {
      const updatedUsers = [{ employeeId: 'EMP001', fullName: 'Updated Name' }];
      mockedAPI.patch.mockResolvedValue({ data: {} });
      mockedAPI.get.mockResolvedValue({ data: updatedUsers, status: 200 });

      await store.dispatch(actions.updateUser(updateRequest));

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0]).toEqual({
        type: types.UPDATE_User,
        payload: updatedUsers
      });
    });

    test('returns response from getUserList', async () => {
      const response = { data: [{ employeeId: 'EMP001' }], status: 200 };
      mockedAPI.patch.mockResolvedValue({ data: {} });
      mockedAPI.get.mockResolvedValue(response);

      const result = await store.dispatch(actions.updateUser(updateRequest));

      expect(result).toEqual(response);
    });

    test('dispatches GET_Errors on failure', async () => {
      const errorData = { message: 'Update failed' };
      mockedAPI.patch.mockRejectedValue({ response: { data: errorData } });

      try {
        await store.dispatch(actions.updateUser(updateRequest));
      } catch (err) {
        // expected error
      }

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0]).toEqual({
        type: types.GET_Errors,
        payload: errorData
      });
    });

    test('dispatches refresh failure message when update succeeds but list refresh fails', async () => {
      mockedAPI.patch.mockResolvedValue({ data: {} });
      mockedAPI.get.mockRejectedValue(new Error('Network error'));

      await expect(store.dispatch(actions.updateUser(updateRequest))).rejects.toThrow('Network error');

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0]).toEqual({
        type: types.GET_Errors,
        payload: { message: '更新使用者已完成，但重新整理列表失敗，請重新整理頁面' }
      });
    });
  });
});
