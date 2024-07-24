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
  async (readingProgressId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`reading/${readingProgressId}/`);
      console.log(`Fetched Reading Progress for book ${readingProgressId}:`, response.data); // Log the fetched data
      return response.data;
    } catch (error) {
      // Check if the error is from Axios and has a response
      if (error.response) {
        return rejectWithValue(error.response.data);
      }
      // For other errors (like network issues)
      return rejectWithValue(error.message);
    }
  }
);

export const addReadingProgress = createAsyncThunk(
  'readingProgress/addReadingProgress',
  async (newProgress, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('reading/', newProgress);
      console.log('Added Reading Progress:', response.data);
      return response.data;
    } catch (error) {
      // Check if the error is from Axios and has a response
      if (error.response) {
        console.error('Error response data:', error.response.data);
        return rejectWithValue(error.response.data);
      }
      // For other errors (like network issues)
      console.error('Error message:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const updateReadingProgress = createAsyncThunk(
  'readingProgress/updateReadingProgress',
  async ({ id, updatedProgress }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`reading/${id}/`, updatedProgress);
      // console.log('Updated Reading Progress:', response.data); // Log the updated progress
      return response.data;
    } catch (error) {
      // Check if the error is from Axios and has a response
      if (error.response) {
        console.error('Error response data:', error.response.data); // Log the error response data
        return rejectWithValue(error.response.data);
      }
      // For other errors (like network issues)
      console.error('Error message:', error.message); // Log the error message
      return rejectWithValue(error.message);
    }
  }
);

export const deleteReadingProgress = createAsyncThunk(
  'readingProgress/deleteReadingProgress',
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`reading/${id}/`);
      console.log(`Deleted Reading Progress with ID: ${id}`);
      return id;
    } catch (error) {
      // Check if the error is from Axios and has a response
      if (error.response) {
        console.error('Error response data:', error.response.data); // Log the error response data
        return rejectWithValue(error.response.data);
      }
      // For other errors (like network issues)
      console.error('Error message:', error.message); // Log the error message
      return rejectWithValue(error.message);
    }
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
