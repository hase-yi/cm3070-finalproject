import { NavLink } from 'react-router-dom';

import classes from './MainNavigation.module.css';

function MainNavigation() {
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
				</ul>
			</nav>
		</header>
	);
}

export default MainNavigation;
