import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../axiosInstance';
const initialState = {
  readingProgress: [],
  status: 'idle',
  error: null,
};

// Async Thunks
export const fetchReadingProgress = createAsyncThunk(
  'readingProgress/fetchReadingProgress',
  async () => {
    const response = await axiosInstance.get('reading/');
    return response.data;
  }
);

export const addReadingProgress = createAsyncThunk(
  'readingProgress/addReadingProgress',
  async (newProgress) => {
    const response = await axiosInstance.post('reading/', newProgress);
    return response.data;
  }
);

export const updateReadingProgress = createAsyncThunk(
  'readingProgress/updateReadingProgress',
  async ({ id, updatedProgress }) => {
    const response = await axiosInstance.put(`reading/${id}/`, updatedProgress);
    return response.data;
  }
);

export const deleteReadingProgress = createAsyncThunk(
  'readingProgress/deleteReadingProgress',
  async (id) => {
    await axiosInstance.delete(`reading/${id}/`);
    return id;
  }
);

// Slice
const readingProgressSlice = createSlice({
  name: 'readingProgress',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReadingProgress.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchReadingProgress.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.readingProgress = action.payload;
      })
      .addCase(fetchReadingProgress.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(addReadingProgress.fulfilled, (state, action) => {
        state.readingProgress.push(action.payload);
      })
      .addCase(updateReadingProgress.fulfilled, (state, action) => {
        const index = state.readingProgress.findIndex((progress) => progress.id === action.payload.id);
        state.readingProgress[index] = action.payload;
      })
      .addCase(deleteReadingProgress.fulfilled, (state, action) => {
        state.readingProgress = state.readingProgress.filter((progress) => progress.id !== action.payload);
      });
  },
});

export default readingProgressSlice.reducer;
