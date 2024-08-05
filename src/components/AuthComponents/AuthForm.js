import { Form, Link, useSearchParams, useActionData, useNavigation } from 'react-router-dom';

import classes from './AuthForm.module.css';

function AuthForm() {
	const data = useActionData();
	const navigation = useNavigation();

	const [searchParams] = useSearchParams();
	const isLogin = searchParams.get('mode') === 'login';
	const isSubmitting = navigation.state === 'submitting';

	return (
		<>
			<Form method="post" className={classes.form}>
				<h1>{isLogin ? 'Log in' : 'Create a new user'}</h1>
				{/* validation */}
				{data && data.errors && (
					<ul>
						{Object.entries(data.errors).map(([field, errors]) => (
							<li key={field}>{errors.join(', ')}</li>
						))}
					</ul>
				)}
				{data && data.detail && <p className={classes.error}>{data.detail}</p>}
				{data && data.message && <p>{data.message}</p>}
				<p>
					<label htmlFor="username">Username</label>
					<input id="username" type="text" name="username" required />
				</p>
				<p>
					<label htmlFor="email">Email</label>
					<input id="email" type="email" name="email" required />
				</p>
				<p>
					<label htmlFor="password">Password</label>
					<input id="password" type="password" name="password" required />
				</p>
				<div className={classes.actions}>
					<Link to={`?mode=${isLogin ? 'signup' : 'login'}`}>
						{isLogin ? 'Create new user' : 'Login'}
					</Link>
					<button disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Save'}</button>
				</div>
			</Form>
		</>
	);
}

export default AuthForm;
