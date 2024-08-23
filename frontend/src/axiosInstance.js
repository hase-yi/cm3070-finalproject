// axiosInstance.js
import axios from 'axios';
import navigateEmitter from './navigateEmitter'; // Adjust the import path

axios.defaults.withCredentials = true;
axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";
axios.defaults.xsrfCookieName = "csrftoken";

const instance = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a response interceptor
instance.interceptors.response.use(
  response => response, // Simply return the response if everything is okay
  error => {
    // Handle 401 and 403 errors specifically
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      
      // Emit navigation event
      navigateEmitter.emit('navigate', '/auth');
    }
    return Promise.reject(error);
  }
);

export default instance;
