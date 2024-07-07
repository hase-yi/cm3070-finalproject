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

const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		logoutUser(state) {
      state.user = null;
      state.status = 'idle';
      state.error = null;
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
			});
	},
});

export const { logoutUser } = authSlice.actions;
export default authSlice.reducer;