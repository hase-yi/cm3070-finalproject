import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import classes from './MainNavigation.module.css';
import { getUsername } from '../features/authSlice';
import { fetchFollowedUsers, fetchFollowers } from '../features/followingSlice';

function MainNavigation() {
	const user = useSelector((state) => state.auth.user);
	const status = useSelector((state) => state.auth.status);
	const error = useSelector((state) => state.auth.error);

	const dispatch = useDispatch();

	useEffect(() => {
		if (status === 'idle' || !user) {
			dispatch(getUsername())
				.unwrap()
				.catch((err) => {
					console.error('Failed to fetch username:', err);
				});

			dispatch(fetchFollowedUsers()).unwrap()
			dispatch(fetchFollowers()).unwrap()
		}
	}, [status, dispatch, user]);

	// console.log("user is:", user)
	return (
		<header className={classes.header}>
			<nav>
				<ul className={classes.list}>
					<li>
						{/* wether the link is active, so it shows if the link is active */}
						<NavLink
							to="/"
							className={({ isActive }) =>
								isActive ? classes.active : undefined
							}
							end={true} // This link will only be considered active if we are on "/"
						>
							Home
						</NavLink>
					</li>
					<li>
						<NavLink
							to="shelves"
							className={({ isActive }) =>
								isActive ? classes.active : undefined
							}
							end
						>
							Shelves
						</NavLink>
					</li>
					<li>
						<NavLink
							to="auth"
							className={({ isActive }) =>
								isActive ? classes.active : undefined
							}
							end
						>
							Authentication
						</NavLink>
					</li>
					<li>
						<NavLink
							to="search"
							className={({ isActive }) =>
								isActive ? classes.active : undefined
							}
							end
						>
							Search
						</NavLink>
					</li>
					<li>
						<NavLink
							to="books/new"
							className={({ isActive }) =>
								isActive ? classes.active : undefined
							}
							end
						>
							Add Book
						</NavLink>
					</li>
					<li>
						<NavLink
							to="scan"
							className={({ isActive }) =>
								isActive ? classes.active : undefined
							}
							end
						>
							Scan
						</NavLink>
					</li>
					<li>
						<NavLink
							to="searchpeople"
							className={({ isActive }) =>
								isActive ? classes.active : undefined
							}
							end
						>
							Search People
						</NavLink>
					</li>
				</ul>
			</nav>
		</header>
	);
}

export default MainNavigation;
