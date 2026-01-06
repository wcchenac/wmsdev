import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../../actions/UserActions';
import * as types from '../../actions/types';
import API from '../../utilities/API';
import jwt_decode from 'jwt-decode';

// Mock dependencies
jest.mock('../../utilities/API');
jest.mock('jwt-decode');
jest.mock('../../utilities/SetJWTToken', () => jest.fn());

const mockStore = configureMockStore([thunk]);

// Create localStorage mock
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

// Setup localStorage mock before all tests
beforeAll(() => {
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true
  });
});

describe('UserActions', () => {
  let store;
  const mockToken = 'mock-jwt-token';
  const mockDecodedUser = {
    employeeId: 'EMP001',
    fullname: 'Test User',
    role: { authority: 'ROLE_Admin' },
    exp: 9999999999
  };

  beforeEach(() => {
    store = mockStore({});
    jest.clearAllMocks();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
  });

  describe('registerUser', () => {
    const newUser = {
      employeeId: 'NEW001',
      fullName: 'New User',
      password: 'password123',
      role: 'ROLE_Normal'
    };

    test('calls API.post with correct endpoint and data', async () => {
      API.post.mockResolvedValue({ data: { success: true }, status: 200 });

      await store.dispatch(actions.registerUser(newUser));

      expect(API.post).toHaveBeenCalledWith(
        '/api/user/adminManagement/user/register',
        newUser
      );
    });

    test('returns response on success', async () => {
      const response = { data: { success: true }, status: 200 };
      API.post.mockResolvedValue(response);

      const result = await store.dispatch(actions.registerUser(newUser));

      expect(result).toEqual(response);
    });

    test('dispatches GET_Errors on API failure', async () => {
      const errorData = { message: 'Employee ID already exists' };
      API.post.mockRejectedValue({ response: { data: errorData } });

      await store.dispatch(actions.registerUser(newUser));

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0]).toEqual({
        type: types.GET_Errors,
        payload: errorData
      });
    });
  });

  describe('login', () => {
    const loginRequest = {
      employeeId: 'EMP001',
      password: 'password123'
    };

    test('calls API.post with correct endpoint and data', async () => {
      API.post.mockResolvedValue({ data: { accessToken: mockToken } });
      jwt_decode.mockReturnValue(mockDecodedUser);

      await store.dispatch(actions.login(loginRequest));

      expect(API.post).toHaveBeenCalledWith('/api/user/login', loginRequest);
    });

    test('stores token in localStorage on success', async () => {
      API.post.mockResolvedValue({ data: { accessToken: mockToken } });
      jwt_decode.mockReturnValue(mockDecodedUser);

      await store.dispatch(actions.login(loginRequest));

      expect(localStorageMock.setItem).toHaveBeenCalledWith('jwtToken', mockToken);
    });

    test('decodes JWT token and dispatches SET_Current_User', async () => {
      API.post.mockResolvedValue({ data: { accessToken: mockToken } });
      jwt_decode.mockReturnValue(mockDecodedUser);

      await store.dispatch(actions.login(loginRequest));

      expect(jwt_decode).toHaveBeenCalledWith(mockToken);
      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0]).toEqual({
        type: types.SET_Current_User,
        payload: mockDecodedUser
      });
    });

    test('dispatches GET_Errors on login failure', async () => {
      const errorData = { message: 'Invalid credentials' };
      API.post.mockRejectedValue({ response: { data: errorData } });

      await store.dispatch(actions.login(loginRequest));

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0]).toEqual({
        type: types.GET_Errors,
        payload: errorData
      });
    });

    test('does not store token on failure', async () => {
      API.post.mockRejectedValue({ response: { data: { message: 'error' } } });

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
      API.get.mockResolvedValue({ data: users, status: 200 });

      await store.dispatch(actions.getUserList());

      expect(API.get).toHaveBeenCalledWith('/api/user/adminManagement/user/userList');
    });

    test('dispatches GET_UserList with response data', async () => {
      const users = [{ employeeId: '001' }, { employeeId: '002' }];
      API.get.mockResolvedValue({ data: users, status: 200 });

      await store.dispatch(actions.getUserList());

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0]).toEqual({
        type: types.GET_UserList,
        payload: users
      });
    });

    test('returns response object', async () => {
      const response = { data: [{ employeeId: '001' }], status: 200 };
      API.get.mockResolvedValue(response);

      const result = await store.dispatch(actions.getUserList());

      expect(result).toEqual(response);
    });
  });

  describe('deleteUser', () => {
    const employeeId = 'EMP001';

    test('calls API.delete with correct endpoint', async () => {
      API.delete.mockResolvedValue({ data: {}, status: 200 });

      await store.dispatch(actions.deleteUser(employeeId));

      expect(API.delete).toHaveBeenCalledWith(
        `/api/user/adminManagement/user/delete?employeeId=${employeeId}`
      );
    });

    test('dispatches DELETE_User with employeeId on success', async () => {
      API.delete.mockResolvedValue({ data: {}, status: 200 });

      await store.dispatch(actions.deleteUser(employeeId));

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0]).toEqual({
        type: types.DELETE_User,
        payload: employeeId
      });
    });

    test('returns response on success', async () => {
      const response = { data: {}, status: 200 };
      API.delete.mockResolvedValue(response);

      const result = await store.dispatch(actions.deleteUser(employeeId));

      expect(result).toEqual(response);
    });

    test('dispatches GET_Errors on failure', async () => {
      const errorResponse = { message: 'Cannot delete user' };
      API.delete.mockRejectedValue({ response: errorResponse });

      await store.dispatch(actions.deleteUser(employeeId));

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0]).toEqual({
        type: types.GET_Errors,
        payload: errorResponse
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
      API.patch.mockResolvedValue({ data: {} });
      API.get.mockResolvedValue({ data: [{ employeeId: 'EMP001' }], status: 200 });

      await store.dispatch(actions.updateUser(updateRequest));

      expect(API.patch).toHaveBeenCalledWith(
        '/api/user/adminManagement/user/update',
        updateRequest
      );
    });

    test('fetches updated user list after update', async () => {
      API.patch.mockResolvedValue({ data: {} });
      API.get.mockResolvedValue({ data: [{ employeeId: 'EMP001' }], status: 200 });

      await store.dispatch(actions.updateUser(updateRequest));

      expect(API.get).toHaveBeenCalledWith('/api/user/adminManagement/user/userList');
    });

    test('dispatches UPDATE_User with refreshed user list', async () => {
      const updatedUsers = [{ employeeId: 'EMP001', fullName: 'Updated Name' }];
      API.patch.mockResolvedValue({ data: {} });
      API.get.mockResolvedValue({ data: updatedUsers, status: 200 });

      await store.dispatch(actions.updateUser(updateRequest));

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0]).toEqual({
        type: types.UPDATE_User,
        payload: updatedUsers
      });
    });

    test('returns response from getUserList', async () => {
      const response = { data: [{ employeeId: 'EMP001' }], status: 200 };
      API.patch.mockResolvedValue({ data: {} });
      API.get.mockResolvedValue(response);

      const result = await store.dispatch(actions.updateUser(updateRequest));

      expect(result).toEqual(response);
    });

    test('dispatches GET_Errors on failure', async () => {
      const errorResponse = { message: 'Update failed' };
      API.patch.mockRejectedValue({ response: errorResponse });

      await store.dispatch(actions.updateUser(updateRequest));

      const dispatchedActions = store.getActions();
      expect(dispatchedActions[0]).toEqual({
        type: types.GET_Errors,
        payload: errorResponse
      });
    });
  });
});
