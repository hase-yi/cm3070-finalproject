// src/components/Logout.js
import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Logout = () => {
    const { logoutUser } = useContext(AuthContext);

    return <button onClick={logoutUser}>Logout</button>;
};

export default Logout;  // Ensure default export
