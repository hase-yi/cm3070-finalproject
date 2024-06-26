// src/components/Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import Logout from './Logout';

const Home = () => {
    return (
        <div>
            <h1>Welcome to BookForest</h1>
            <Link to="/login">Login</Link>
            <Logout />
        </div>
    );
};

export default Home;  // Ensure default export
