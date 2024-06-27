import { NavLink } from 'react-router-dom';

import classes from './ShelfNavigation.module.css';

function ShelfNavigation() {
	return (
		<header className={classes.header}>
			<nav>
				<ul className={classes.list}>
					<li>
						<NavLink
							to=""
							className={({ isActive }) =>
								isActive ? classes.active : undefined
							}
							end
						>
							All Shelves
						</NavLink>
					</li>
					<li>
						<NavLink
							to="new"
							className={({ isActive }) =>
								isActive ? classes.active : undefined
							}
							end
						>
							New Shelf
						</NavLink>
					</li>
				</ul>
			</nav>
		</header>
	);
}

export default ShelfNavigation;
