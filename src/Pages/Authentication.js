import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
	getUsername as fetchUsername,
	loginUser,
	logoutUser,
} from '../features/authSlice';
import navigateEmitter from '../navigateEmitter';
import { store } from '../store/index';
import { fetchFollowedUsers, fetchFollowers } from '../features/followingSlice';
import {
	fetchShelves
} from '../features/shelfSlice';
import { fetchBooks } from '../features/bookSlice';

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
				return dispatch(fetchBooks()).unwrap()
			}
			).then(() => {
				return dispatch(fetchShelves
					()).unwrap()
			}
			)
			.then(() => {
				navigateEmitter.emit('navigate', '/');
			})
			.catch((err) => {
				// Handle any errors that occur during the dispatches
				console.error('An error occurred:', err);
			});
	};

	return (
		<article>
		<form onSubmit={handleSubmit}>
			<div class="field label border">
				<input
					type="text"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
				/>
				<label>Username</label>
			</div>
			<div class="field label border">
				<input
					type="password"
					placeholder="Password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
				<label>Password</label>

			</div>
			<button
				type="submit"
				className='responsive'
			>
				<span>Login</span></button>

			<div className='row center-align'>
				<p className='italic'>No account yet? Register here!</p>
			</div>
		</form>
		</article>
	);
}

export default AuthenticationPage;
