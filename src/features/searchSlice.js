import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import axiosInstance from '../axiosInstance';

// Thunk to perform search
export const searchBooks = createAsyncThunk('search/searchBooks', async (query) => {
  const response = await axios.get(`https://openlibrary.org/search.json?q=${query}`);
  return response.data.docs; // assuming docs contains the list of books
});

// Thunk to add book
export const addBook = createAsyncThunk('search/addBook', async (newBook, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post('/books/', newBook);
    return response.data;
  } catch (error) {
    if (error.response) {
      return rejectWithValue(error.response.data);
    }
    return rejectWithValue(error.message);
  }
});

const searchSlice = createSlice({
  name: 'search',
  initialState: {
    query: '',
    results: [],
    selectedBook: null,
    showModal: false,
    feedbackMessage: '',
    loading: false,
    cache: {},
    scannerError: '',
    addBookStatus: 'idle',
    addBookError: null,
  },
  reducers: {
    setQuery(state, action) {
      state.query = action.payload;
    },
    setSelectedBook(state, action) {
      state.selectedBook = action.payload;
      state.showModal = true;
    },
    clearSelectedBook(state) {
      state.selectedBook = null;
      state.showModal = false;
    },
    clearFeedbackMessage(state) {
      state.feedbackMessage = '';
    },
    setScannerError(state, action) {
      state.scannerError = action.payload;
    },
    clearScannerError(state) {
      state.scannerError = '';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchBooks.pending, (state) => {
        state.loading = true;
        state.feedbackMessage = '';
      })
      .addCase(searchBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload;
        state.cache[state.query] = action.payload;
      })
      .addCase(searchBooks.rejected, (state, action) => {
        state.loading = false;
        state.feedbackMessage = 'Error fetching search results';
      })
      .addCase(addBook.pending, (state) => {
        state.addBookStatus = 'loading';
      })
      .addCase(addBook.fulfilled, (state) => {
        state.addBookStatus = 'succeeded';
        state.feedbackMessage = 'Book added successfully!';
        state.showModal = false;
        state.selectedBook = null;
      })
      .addCase(addBook.rejected, (state, action) => {
        state.addBookStatus = 'failed';
        state.addBookError = action.payload || 'Error adding book to backend';
      });
  },
});

export const {
  setQuery,
  setSelectedBook,
  clearSelectedBook,
  clearFeedbackMessage,
  setScannerError,
  clearScannerError,
} = searchSlice.actions;

export default searchSlice.reducer;
