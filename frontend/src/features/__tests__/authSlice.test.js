import axiosInstance from '../../axiosInstance';
import { loginUser, registerUser, getUsername } from '../authSlice';
import authReducer, { logoutUser } from '../authSlice';
import { configureStore } from '@reduxjs/toolkit';

// jest.mock('../../axiosInstance', () => {
//   return {
//     create: jest.fn(() => ({
//       interceptors: {
//         response: {
//           use: jest.fn(),
//         },
//       },
//     })),
//   };
// });

jest.mock('../../axiosInstance', () => ({
  post: jest.fn(),
  get: jest.fn(),
}));



describe('authSlice tests', () => {
  const initialState = {
    user: null,
    status: 'idle',
    error: null,
  };

  // Test the initial state of the auth slice
  test('should return the initial state', () => {
    expect(authReducer(undefined, {})).toEqual(initialState);
  });
  
  test('should handle loginUser successfully', async () => {
    const user = { username: 'testuser' };
    axiosInstance.post.mockResolvedValueOnce({ data: user });
  
    const store = configureStore({ reducer: authReducer });
  
    await store.dispatch(loginUser({ username: 'testuser', password: 'password' }));
  
    const state = store.getState();
    expect(state.status).toBe('succeeded');
    expect(state.user).toEqual(user);
  });
  
  test('should handle loginUser failure', async () => {
    const error = { message: 'Invalid credentials' };
    axiosInstance.post.mockRejectedValueOnce({ response: { data: error } });
  
    const store = configureStore({ reducer: authReducer });
  
    await store.dispatch(loginUser({ username: 'testuser', password: 'wrongpassword' }));
  
    const state = store.getState();
    expect(state.status).toBe('failed');
    expect(state.error).toEqual(error);
  });

  test('should handle registerUser successfully', async () => {
    const user = { username: 'newuser' };
    axiosInstance.post.mockResolvedValueOnce({ data: user });

    const store = configureStore({ reducer: authReducer });

    await store.dispatch(registerUser({ username: 'newuser', password: 'password' }));

    const state = store.getState();
    expect(state.status).toBe('succeeded');
    expect(state.user).toEqual(user);
  });

  test('should handle registerUser failure', async () => {
    const error = { message: 'User already exists' };
    axiosInstance.post.mockRejectedValueOnce({ response: { data: error } });

    const store = configureStore({ reducer: authReducer });

    await store.dispatch(registerUser({ username: 'newuser', password: 'password' }));

    const state = store.getState();
    expect(state.status).toBe('failed');
    expect(state.error).toEqual(error);
  });

  test('should handle getUsername successfully', async () => {
    const user = { username: 'testuser' };
    axiosInstance.get.mockResolvedValueOnce({ data: user });

    const store = configureStore({ reducer: authReducer });

    await store.dispatch(getUsername());

    const state = store.getState();
    expect(state.status).toBe('succeeded');
    expect(state.user).toEqual(user.username);
  });

    // Test the getUsername thunk when the API call fails
    test('should handle getUsername failure', async () => {
      const error = { message: 'Unauthorized' };
      axiosInstance.get.mockRejectedValueOnce({ response: { data: error } });
  
      const store = configureStore({ reducer: authReducer });
  
      await store.dispatch(getUsername());
  
      const state = store.getState();
      expect(state.status).toBe('failed');
      expect(state.error).toEqual(error);
    });

    test('should handle logoutUser', () => {
      const stateWithUser = {
        user: { username: 'testuser' },
        status: 'succeeded',
        error: null,
      };
  
      const newState = authReducer(stateWithUser, logoutUser());
  
      expect(newState.user).toBe(null);
      expect(newState.status).toBe('idle');
      expect(newState.error).toBe(null);
    });
});