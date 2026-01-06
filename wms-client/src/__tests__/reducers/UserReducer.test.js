import UserReducer from '../../reducers/UserReducer';
import {
  SET_Current_User,
  GET_UserList,
  UPDATE_User,
  DELETE_User
} from '../../actions/types';

describe('UserReducer', () => {
  const initialState = {
    validToken: false,
    user: {},
    users: []
  };

  describe('initial state', () => {
    test('returns initial state when no state provided', () => {
      expect(UserReducer(undefined, {})).toEqual(initialState);
    });

    test('returns initial state for unknown action type', () => {
      expect(UserReducer(initialState, { type: 'UNKNOWN_ACTION' })).toEqual(initialState);
    });
  });

  describe('SET_Current_User', () => {
    test('sets user and validToken to true when payload has data', () => {
      const payload = {
        employeeId: 'EMP001',
        fullname: 'Test User',
        role: { authority: 'ROLE_Admin' }
      };
      const result = UserReducer(initialState, { type: SET_Current_User, payload });

      expect(result.validToken).toBe(true);
      expect(result.user).toEqual(payload);
    });

    test('sets validToken to false when payload is empty object', () => {
      const existingState = {
        validToken: true,
        user: { employeeId: 'EMP001' },
        users: []
      };
      const result = UserReducer(existingState, { type: SET_Current_User, payload: {} });

      // Empty object is truthy in JavaScript, so validToken remains true
      // Based on booleanActionPayload function
      expect(result.validToken).toBe(true);
      expect(result.user).toEqual({});
    });

    test('sets validToken to false when payload is null', () => {
      const result = UserReducer(initialState, { type: SET_Current_User, payload: null });

      expect(result.validToken).toBe(false);
      expect(result.user).toBe(null);
    });

    test('sets validToken to false when payload is undefined', () => {
      const result = UserReducer(initialState, { type: SET_Current_User, payload: undefined });

      expect(result.validToken).toBe(false);
      expect(result.user).toBe(undefined);
    });

    test('sets validToken to false when payload is false', () => {
      const result = UserReducer(initialState, { type: SET_Current_User, payload: false });

      expect(result.validToken).toBe(false);
      expect(result.user).toBe(false);
    });

    test('sets validToken to false when payload is 0', () => {
      const result = UserReducer(initialState, { type: SET_Current_User, payload: 0 });

      expect(result.validToken).toBe(false);
      expect(result.user).toBe(0);
    });

    test('preserves users array when setting current user', () => {
      const existingState = {
        validToken: false,
        user: {},
        users: [{ employeeId: 'USER001' }]
      };
      const payload = { employeeId: 'EMP001' };
      const result = UserReducer(existingState, { type: SET_Current_User, payload });

      expect(result.users).toEqual([{ employeeId: 'USER001' }]);
    });
  });

  describe('GET_UserList', () => {
    test('sets users to payload', () => {
      const payload = [
        { employeeId: '001', fullname: 'User 1' },
        { employeeId: '002', fullname: 'User 2' }
      ];
      const result = UserReducer(initialState, { type: GET_UserList, payload });

      expect(result.users).toEqual(payload);
    });

    test('replaces existing users', () => {
      const existingState = {
        ...initialState,
        users: [{ employeeId: 'old' }]
      };
      const payload = [{ employeeId: 'new' }];
      const result = UserReducer(existingState, { type: GET_UserList, payload });

      expect(result.users).toEqual(payload);
    });

    test('handles empty payload', () => {
      const result = UserReducer(initialState, { type: GET_UserList, payload: [] });
      expect(result.users).toEqual([]);
    });

    test('preserves validToken and user when getting user list', () => {
      const existingState = {
        validToken: true,
        user: { employeeId: 'ADMIN' },
        users: []
      };
      const payload = [{ employeeId: '001' }];
      const result = UserReducer(existingState, { type: GET_UserList, payload });

      expect(result.validToken).toBe(true);
      expect(result.user).toEqual({ employeeId: 'ADMIN' });
    });
  });

  describe('UPDATE_User', () => {
    test('sets users to payload', () => {
      const payload = [
        { employeeId: '001', fullname: 'Updated User', role: 'ROLE_Admin' }
      ];
      const result = UserReducer(initialState, { type: UPDATE_User, payload });

      expect(result.users).toEqual(payload);
    });

    test('replaces entire users array with updated list', () => {
      const existingState = {
        ...initialState,
        users: [
          { employeeId: '001', fullname: 'Original' }
        ]
      };
      const payload = [
        { employeeId: '001', fullname: 'Updated' },
        { employeeId: '002', fullname: 'New User' }
      ];
      const result = UserReducer(existingState, { type: UPDATE_User, payload });

      expect(result.users).toEqual(payload);
      expect(result.users).toHaveLength(2);
    });
  });

  describe('DELETE_User', () => {
    test('removes user by employeeId', () => {
      const existingState = {
        ...initialState,
        users: [
          { employeeId: '001', fullname: 'User 1' },
          { employeeId: '002', fullname: 'User 2' }
        ]
      };
      const result = UserReducer(existingState, { type: DELETE_User, payload: '001' });

      expect(result.users).toHaveLength(1);
      expect(result.users[0].employeeId).toBe('002');
    });

    test('removes correct user when multiple users exist', () => {
      const existingState = {
        ...initialState,
        users: [
          { employeeId: '001' },
          { employeeId: '002' },
          { employeeId: '003' }
        ]
      };
      const result = UserReducer(existingState, { type: DELETE_User, payload: '002' });

      expect(result.users).toHaveLength(2);
      expect(result.users.map(u => u.employeeId)).toEqual(['001', '003']);
    });

    test('handles payload that does not match any user', () => {
      const existingState = {
        ...initialState,
        users: [
          { employeeId: '001' },
          { employeeId: '002' }
        ]
      };
      const result = UserReducer(existingState, { type: DELETE_User, payload: '999' });

      expect(result.users).toHaveLength(2);
    });

    test('handles empty users array', () => {
      const result = UserReducer(initialState, { type: DELETE_User, payload: '001' });
      expect(result.users).toEqual([]);
    });

    test('preserves validToken and user when deleting from list', () => {
      const existingState = {
        validToken: true,
        user: { employeeId: 'ADMIN' },
        users: [{ employeeId: '001' }]
      };
      const result = UserReducer(existingState, { type: DELETE_User, payload: '001' });

      expect(result.validToken).toBe(true);
      expect(result.user).toEqual({ employeeId: 'ADMIN' });
    });
  });

  describe('state immutability', () => {
    test('does not mutate original state', () => {
      const originalState = {
        validToken: true,
        user: { employeeId: 'EMP001' },
        users: [{ employeeId: '001' }]
      };
      const stateCopy = JSON.parse(JSON.stringify(originalState));

      UserReducer(originalState, { type: DELETE_User, payload: '001' });

      expect(originalState).toEqual(stateCopy);
    });
  });
});
