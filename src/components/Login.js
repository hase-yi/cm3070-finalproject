// src/components/Login.js
import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './Login.css'; // Import CSS file

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { loginUser, logoutUser, loginFeedback, authTokens } = useContext(AuthContext);

    const handleSubmit = (e) => {
        e.preventDefault();
        loginUser(username, password);
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Username: </label>
                    <input
                        type="text"
                        value={username}
                        placeholder={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Password: </label>
                    <input
                        type="password"
                        value={password}
                        placeholder={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="button-container">
                    <button 
                        type="submit" 
                        className={authTokens ? 'button-logged-in' : 'button-default'}
                    >
                        Login
                    </button>
                    {authTokens && (
                        <button 
                            type="button" 
                            className="button-logout"
                            onClick={logoutUser}
                        >
                            Logout
                        </button>
                    )}
                </div>
            </form>
            {loginFeedback && <p>{loginFeedback}</p>}
        </div>
    );
};

export default Login;
