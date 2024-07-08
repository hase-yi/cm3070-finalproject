import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../axiosInstance';

const initialState = {
	user: null,
	status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
	error: null,
};

// Async thunk for user login
export const loginUser = createAsyncThunk(
	'auth/login',
	async (credentials, { rejectWithValue }) => {
		try {
			const response = await axiosInstance.post(
				'login/',
				credentials,
			);
			return response.data;
		} catch (err) {
			return rejectWithValue(err.response.data);
		}
	}
);

// Async thunk for user registration
export const registerUser = createAsyncThunk(
	'auth/registerUser',
	async (userData, { rejectWithValue }) => {
		try {
			const response = await axiosInstance.post('/signup/', userData);
			return response.data;
		} catch (err) {
			return rejectWithValue(err.response.data);
		}
	}
);

const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		logoutUser(state) {
			state.user = null;
			state.status = 'idle';
			state.error = null;
			axiosInstance.post('/logout/', {}, { withCredentials: true });
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(loginUser.pending, (state) => {
				state.status = 'loading';
			})
			.addCase(loginUser.fulfilled, (state, action) => {
				state.status = 'succeeded';
				state.user = action.payload;
			})
			.addCase(loginUser.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.payload;
			})
			.addCase(registerUser.pending, (state) => {
				state.status = 'loading';
			})
			.addCase(registerUser.fulfilled, (state, action) => {
				state.status = 'succeeded';
				state.user = action.payload;
			})
			.addCase(registerUser.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.payload;
			});
	},
});

export const { logoutUser } = authSlice.actions;
export default authSlice.reducer;
