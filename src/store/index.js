import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/authSlice';
import shelfReducer from '../features/shelfSlice';
import bookReducer from '../features/bookSlice';
import searchReducer from '../features/searchSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    books: bookReducer,
    search: searchReducer,
    shelves: shelfReducer,

  },
});

