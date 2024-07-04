import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../axiosInstance';

// Thunk to fetch a single shelf
export const fetchShelf = createAsyncThunk('shelves/fetchShelf', async (id) => {
  const response = await axiosInstance.get(`shelves/${id}/`);
  return response.data;
});

// Thunk to fetch all shelves
export const fetchShelves = createAsyncThunk('shelves/fetchShelves', async () => {
  const response = await axiosInstance.get('shelves/');
  return response.data;
});

// Thunk to create a new shelf
export const createShelf = createAsyncThunk('shelves/createShelf', async (newShelf, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post('shelves/', newShelf);
    return response.data;
  } catch (error) {
    if (!error.response) {
      throw error;
    }
    return rejectWithValue(error.response.data);
  }
});

// Thunk to update an existing shelf
export const updateShelf = createAsyncThunk('shelves/updateShelf', async ({ id, updatedShelf }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(`shelves/${id}/`, updatedShelf);
    return response.data;
  } catch (error) {
    if (!error.response) {
      throw error;
    }
    return rejectWithValue(error.response.data);
  }
});

// Thunk to delete a shelf
export const deleteShelf = createAsyncThunk('shelves/deleteShelf', async (id) => {
  await axiosInstance.delete(`shelves/${id}/`);
  return id;
});

const shelfSlice = createSlice({
  name: 'shelves',
  initialState: {
    shelves: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchShelf.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchShelf.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.shelves.findIndex((shelf) => shelf.id === action.payload.id);
        if (index === -1) {
          state.shelves.push(action.payload);
        } else {
          state.shelves[index] = action.payload;
        }
      })
      .addCase(fetchShelf.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchShelves.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchShelves.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.shelves = action.payload;
      })
      .addCase(fetchShelves.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(createShelf.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createShelf.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.shelves.push(action.payload);
      })
      .addCase(createShelf.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      .addCase(updateShelf.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateShelf.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.shelves.findIndex((shelf) => shelf.id === action.payload.id);
        if (index !== -1) {
          state.shelves[index] = action.payload;
        }
      })
      .addCase(updateShelf.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      .addCase(deleteShelf.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteShelf.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.shelves = state.shelves.filter((shelf) => shelf.id !== action.payload);
      })
      .addCase(deleteShelf.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default shelfSlice.reducer;
