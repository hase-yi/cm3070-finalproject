import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../axiosInstance';

// Thunk to fetch a single book
export const fetchBook = createAsyncThunk('books/fetchBook', async (id) => {
  const response = await axiosInstance.get(`books/${id}/`);
  return response.data;
});

// Thunk to fetch all books
export const fetchBooks = createAsyncThunk('books/fetchBooks', async () => {
  const response = await axiosInstance.get('books/');
  return response.data;
});

// Thunk to fetch books for a specific shelf
export const fetchBooksForShelf = createAsyncThunk('books/fetchBooksForShelf', async (shelfId) => {
  const response = await axiosInstance.get(`shelves/${shelfId}/books/`);
  return response.data;
});

// Thunk to create a new book
export const createBook = createAsyncThunk('books/createBook', async (newBook, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post('books/', newBook);
    return response.data;
  } catch (error) {
    if (!error.response) {
      throw error;
    }
    return rejectWithValue(error.response.data);
  }
});

// Thunk to update an existing book
export const updateBook = createAsyncThunk('books/updateBook', async ({ id, updatedBook }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(`books/${id}/`, updatedBook);
    return response.data;
  } catch (error) {
    if (!error.response) {
      throw error;
    }
    return rejectWithValue(error.response.data);
  }
});

// Thunk to delete a book
export const deleteBook = createAsyncThunk('books/deleteBook', async (id) => {
  await axiosInstance.delete(`books/${id}/`);
  return id;
});

const bookSlice = createSlice({
  name: 'books',
  initialState: {
    books: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBook.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchBook.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.books.findIndex((book) => book.id === action.payload.id);
        if (index === -1) {
          state.books.push(action.payload);
        } else {
          state.books[index] = action.payload;
        }
      })
      .addCase(fetchBook.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchBooks.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.books = action.payload;
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchBooksForShelf.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchBooksForShelf.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.books = action.payload;
      })
      .addCase(fetchBooksForShelf.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(createBook.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createBook.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.books.push(action.payload);
      })
      .addCase(createBook.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      .addCase(updateBook.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateBook.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.books.findIndex((book) => book.id === action.payload.id);
        if (index !== -1) {
          state.books[index] = action.payload;
        }
      })
      .addCase(updateBook.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      .addCase(deleteBook.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteBook.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.books = state.books.filter((book) => book.id !== action.payload);
      })
      .addCase(deleteBook.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default bookSlice.reducer;