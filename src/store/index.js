// store.js
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer'; // import the rootReducer you defined

export const store = configureStore({
  reducer: rootReducer,  // Use the rootReducer here
});
