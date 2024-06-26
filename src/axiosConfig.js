// src/axiosConfig.js
import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use((config) => {
    const tokens = JSON.parse(localStorage.getItem('authTokens'));
    if (tokens) {
        config.headers['Authorization'] = `Bearer ${tokens.access}`;
    }
    return config;
});

export default axiosInstance;
