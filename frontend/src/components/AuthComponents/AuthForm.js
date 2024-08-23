import { Form, Link, useSearchParams, useActionData, useNavigation } from 'react-router-dom';  // Import necessary hooks and components from react-router-dom

import classes from './AuthForm.module.css';  // Import CSS module for styling

function AuthForm() {
	const data = useActionData();  // Hook to get data returned from the action function, such as errors or success messages
	const navigation = useNavigation();  // Hook to get information about the current navigation state (e.g., whether a form is submitting)

	const [searchParams] = useSearchParams();  // Hook to access the query parameters in the URL
	const isLogin = searchParams.get('mode') === 'login';  // Determine whether the form is in login mode based on the URL query parameter
	const isSubmitting = navigation.state === 'submitting';  // Check if the form is currently being submitted

	return (
		<>
			<Form method="post" className={classes.form}>  {/* Form component that submits data via POST */}
				<h1>{isLogin ? 'Log in' : 'Create a new user'}</h1>  {/* Dynamically change the heading based on the form mode (login or signup) */}
				
				{/* Display validation errors if any */}
				{data && data.errors && (
					<ul>
						{Object.entries(data.errors).map(([field, errors]) => (
							<li key={field}>{errors.join(', ')}</li>
						))}
					</ul>
				)}
				{/* Display an error message if provided */}
				{data && data.detail && <p className={classes.error}>{data.detail}</p>}
				{/* Display a success or general message if provided */}
				{data && data.message && <p>{data.message}</p>}

				{/* Username input field */}
				<p>
					<label htmlFor="username">Username</label>
					<input id="username" type="text" name="username" required />
				</p>

				{/* Email input field */}
				<p>
					<label htmlFor="email">Email</label>
					<input id="email" type="email" name="email" required />
				</p>

				{/* Password input field */}
				<p>
					<label htmlFor="password">Password</label>
					<input id="password" type="password" name="password" required />
				</p>

				{/* Actions section for switching between login/signup and submitting the form */}
				<div className={classes.actions}>
					{/* Link to toggle between login and signup modes */}
					<Link to={`?mode=${isLogin ? 'signup' : 'login'}`}>
						{isLogin ? 'Create new user' : 'Login'}  {/* Text changes based on the current mode */}
					</Link>
					{/* Submit button is disabled when the form is submitting */}
					<button disabled={isSubmitting}>
						{isSubmitting ? 'Submitting...' : 'Save'}  {/* Button text changes based on the form's submission state */}
					</button>
				</div>
			</Form>
		</>
	);
}

export default AuthForm;  // Export the component as the default export
