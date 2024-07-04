import { configureStore } from '@reduxjs/toolkit';
import shelfReducer from '../features/shelfSlice'; // Ensure the correct path

const store = configureStore({
  reducer: {
    shelves: shelfReducer, // Ensure the key matches the one used in the selector
  },
});

export default store;

