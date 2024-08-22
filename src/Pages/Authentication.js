import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
	getUsername as fetchUsername,
	loginUser,
	logoutUser,
} from '../features/authSlice';  // Importing authentication-related actions from the authSlice
import navigateEmitter from '../navigateEmitter';  // Event emitter for handling navigation
import { store } from '../store/index';  // Importing the store for dispatching logout action
import { fetchFollowedUsers, fetchFollowers } from '../features/followingSlice';  // Actions to fetch followed users and followers
import { fetchShelves } from '../features/shelfSlice';  // Action to fetch shelves data
import { fetchBooks } from '../features/bookSlice';  // Action to fetch books data

function AuthenticationPage() {
	const [username, setUsername] = useState('');  // State to manage username input
	const [password, setPassword] = useState('');  // State to manage password input
	const dispatch = useDispatch();  // Hook to dispatch actions

	// useEffect hook to log the user out when the component is mounted
	useEffect(() => {
		dispatch(logoutUser());  // Dispatch action to log out the user
		store.dispatch({ type: 'LOGOUT' });  // Manually dispatch a LOGOUT action to the Redux store
	}, [dispatch]);

	// Function to handle form submission (login)
	const handleSubmit = (e) => {
		e.preventDefault();  // Prevent the default form submission behavior

		// Dispatch the loginUser action with username and password
		dispatch(loginUser({ username, password }))
			.unwrap()
			.then(() => {
				// After login, fetch the logged-in user's username
				return dispatch(fetchUsername()).unwrap();
			})
			.then(() => {
				// Fetch followed users
				return dispatch(fetchFollowedUsers()).unwrap();
			})
			.then(() => {
				// Fetch followers of the logged-in user
				return dispatch(fetchFollowers()).unwrap();
			})
			.then(() => {
				// Fetch books related to the user
				return dispatch(fetchBooks()).unwrap();
			})
			.then(() => {
				// Fetch shelves data related to the user
				return dispatch(fetchShelves()).unwrap();
			})
			.then(() => {
				// After all data is fetched, navigate to the homepage
				navigateEmitter.emit('navigate', '/');
			})
			.catch((err) => {
				// Handle any errors that occur during the dispatch process
				console.error('An error occurred:', err);
			});
	};

	return (
		<article>
			<form onSubmit={handleSubmit}>  {/* Form submission is handled by handleSubmit */}
				{/* Input field for username */}
				<div className="field label border">
					<input
						type="text"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
					/>
					<label>Username</label>
				</div>

				{/* Input field for password */}
				<div className="field label border">
					<input
						type="password"
						placeholder="Password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
					<label>Password</label>
				</div>

				{/* Submit button to trigger login */}
				<button
					type="submit"
					className='responsive'
				>
					<span>Login</span>
				</button>

				{/* Display a message to redirect users to the registration page */}
				<div className='row center-align'>
					<p className='italic'>No account yet? Register here!</p>
				</div>
			</form>
		</article>
	);
}

export default AuthenticationPage;  // Export the component as the default export
