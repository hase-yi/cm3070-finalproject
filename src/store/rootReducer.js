// rootReducer.js
import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../features/authSlice';
import shelfReducer from '../features/shelfSlice';
import bookReducer from '../features/bookSlice';
import searchReducer from '../features/searchSlice';

const appReducer = combineReducers({
  auth: authReducer,
  books: bookReducer,
  search: searchReducer,
  shelves: shelfReducer,
});

const rootReducer = (state, action) => {
  if (action.type === 'LOGOUT') {
    state = undefined;
  }
  return appReducer(state, action);
};

export default rootReducer;
