import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../axiosInstance';

// Fetch one book by id
export const fetchBook = createAsyncThunk(
  'books/fetchBook',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`books/${id}/`);
      console.log('Book is:', response.data)
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


// Thunk to fetch all books
export const fetchBooks = createAsyncThunk(
  'books/fetchBooks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('books/');
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

// Thunk to fetch books for a specific shelf
export const fetchBooksForShelf = createAsyncThunk(
  'books/fetchBooksForShelf',
  async (shelfId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('books/', {
        params: {
          shelf: shelfId,
        },
      });
      return response.data;
    } catch (error) {
      // Check if the error is from Axios
      if (error.response) {
        return rejectWithValue(error.response.data);
      }
      // For other errors (like network issues)
      return rejectWithValue(error.message);
    }
  }
);

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
    console.log('updated books data is:', response.data)
    return response.data;
  } catch (error) {
    if (!error.response) {
      throw error;
    }
    return rejectWithValue(error.response.data);
  }
});

// Thunk to delete a book
export const deleteBook = createAsyncThunk(
  'books/deleteBook',
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`books/${id}/`);
      return id;
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

// Thunk to search a book
export const searchBook = createAsyncThunk(
  'books/searchBooks',
  async ({title, isbn}, {rejectWithValue})=>{
    try{
      const params = {};
      if(title) params.title = title;
      if(isbn) params.isbn = isbn;

      const response = await axiosInstance.get('books/search', {params});
      return response.data
      
    }catch(error){
      if(error.response){
        return rejectWithValue(error.response.data);
      } else if (error.request){
        return rejectWithValue('No response received from server');
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
)



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
      })
      .addCase(searchBook.pending,(state)=>{
        state.loading = true;
        state.error = null 
      })
      .addCase(searchBook.fulfilled,(state, action)=>{
        state.loading = false;
        state.books = action.payload; 
      })
      .addCase(searchBook.rejected,(state,action)=>{
        state.loading = false;
        state.error = action.payload || 'Failded to search books';
      })
  },
});

export default bookSlice.reducer;
