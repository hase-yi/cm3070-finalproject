import axiosInstance from '../../axiosInstance';
import { loginUser, registerUser, getUsername } from '../authSlice';
import authReducer, { logoutUser } from '../authSlice';
import { configureStore } from '@reduxjs/toolkit';

jest.mock('../../axiosInstance', () => {
  return {
    create: jest.fn(() => ({
      interceptors: {
        response: {
          use: jest.fn(),
        },
      },
    })),
  };
});

test('should return the initial state', ()=>{
  const initialState = {
    user:null,
    status:'idle',
    error:null,
  };

expect(authReducer(undefined,{})).toEqual(initialState);
});

