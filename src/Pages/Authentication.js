import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getUsername as fetchUsername, loginUser, logoutUser } from '../features/authSlice'; // Ensure logoutUser is imported
import navigateEmitter from '../navigateEmitter';
import { store } from '../store/index'
import { fetchFollowedUsers, fetchFollowers } from '../features/followingSlice';

function AuthenticationPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();

  // Logout user when component mounts
  useEffect(() => {
    dispatch(logoutUser());
    store.dispatch({ type: 'LOGOUT' });
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser({ username, password }));
    dispatch(fetchUsername())
    dispatch(fetchFollowedUsers())
    dispatch(fetchFollowers())
    navigateEmitter.emit('navigate', '/');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Login</button>
    </form>
  );
}

export default AuthenticationPage;