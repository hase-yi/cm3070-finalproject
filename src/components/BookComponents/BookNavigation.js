import React from 'react';
import { NavLink } from 'react-router-dom';
import classes from './BookNavigation.module.css'

const BookNavigation = () => {
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
							All books
						</NavLink>
					</li>
          <li>
            {/* <Link to="/books/new">Add New Book(to be changed)</Link> */}
            <li>
						<NavLink
							to="new"
							className={({ isActive }) =>
								isActive ? classes.active : undefined
							}
							end
						>
							New Book
						</NavLink>
					</li>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default BookNavigation;

