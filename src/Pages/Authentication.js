import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
	getUsername as fetchUsername,
	loginUser,
	logoutUser,
} from '../features/authSlice'; // Ensure logoutUser is imported
import navigateEmitter from '../navigateEmitter';
import { store } from '../store/index';
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
		dispatch(loginUser({ username, password }))
			.unwrap()
			.then(() => {
				// If loginUser was successful, execute the following dispatches
				return dispatch(fetchUsername()).unwrap();
			})
			.then(() => {
				return dispatch(fetchFollowedUsers()).unwrap();
			})
			.then(() => {
				return dispatch(fetchFollowers()).unwrap();
			})
			.then(() => {
				navigateEmitter.emit('navigate', '/');
			})
			.catch((err) => {
				// Handle any errors that occur during the dispatches
				console.error('An error occurred:', err);
			});
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
