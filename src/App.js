// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Login';
import Logout from './components/Logout';
import Home from './components/Home';  // Ensure this matches the file location and export

const App = () => {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/logout" element={<Logout />} />
                    <Route path="/" element={<Home />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
};

export default App;
