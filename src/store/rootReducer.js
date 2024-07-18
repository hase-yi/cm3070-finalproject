// rootReducer.js
import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../features/authSlice';
import shelfReducer from '../features/shelfSlice';
import bookReducer from '../features/bookSlice';
import readingProgressReducer from '../features/readingProgressSlice';

const appReducer = combineReducers({
  auth: authReducer,
  books: bookReducer,
  shelves: shelfReducer,
  readingProgress:readingProgressReducer,
});

const rootReducer = (state, action) => {
  if (action.type === 'LOGOUT') {
    state = undefined;
  }
  return appReducer(state, action);
};

export default rootReducer;
