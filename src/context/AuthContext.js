// src/context/AuthContext.js
import React, { createContext, useState } from 'react';
import axiosInstance from '../axiosConfig';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [authTokens, setAuthTokens] = useState(() =>
        localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')) : null
    );
    const [user, setUser] = useState(() =>
        localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null
    );
    const [loginFeedback, setLoginFeedback] = useState('');

    const loginUser = async (username, password) => {
        try {
            const response = await axiosInstance.post('api/token/', {  // Use axiosInstance
                username,
                password,
            });
            setAuthTokens(response.data);
            setUser({ username });
            localStorage.setItem('authTokens', JSON.stringify(response.data));
            localStorage.setItem('user', JSON.stringify({ username }));
            setLoginFeedback('Login successful!');  // Set feedback message
        } catch (error) {
            console.error(error);
            alert('Failed to login');
            setLoginFeedback('Login failed. Please try again.');  // Set feedback message
        }
    };

    const logoutUser = () => {
        setAuthTokens(null);
        setUser(null);
        localStorage.removeItem('authTokens');
        localStorage.removeItem('user');
        setLoginFeedback('');  // Reset feedback message
    };

    return (
        <AuthContext.Provider value={{ user, authTokens, loginUser, logoutUser, loginFeedback }}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext, AuthProvider };
