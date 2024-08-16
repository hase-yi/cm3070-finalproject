import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getUsername } from '../features/authSlice';
import { fetchFollowedUsers, fetchFollowers } from '../features/followingSlice';
import { fetchBooks } from '../features/bookSlice';
import { fetchShelves } from '../features/shelfSlice';

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

			dispatch(fetchFollowedUsers()).unwrap().catch((err) => {
				console.error('Failed to get who you are following:', err);
			});
			dispatch(fetchFollowers()).unwrap().catch((err) => {
				console.error('Failed to get your followers:', err);
			});
			dispatch(fetchBooks()).unwrap().catch((err) => {
				console.error('Failed to get your books:', err);
			});
			dispatch(fetchShelves()).unwrap().catch((err) => {
				console.error('Failed to get your shelves:', err);
			});
		}


	}, [status, dispatch, user]);

	// console.log("user is:", user)
	return (
		<nav className="left drawer">
			<div className="large-space l m"></div>

			<NavLink
				to="/"
				end
			>
				<i>home</i>
				<div>{user}'s Home</div>
			</NavLink>
			<NavLink
				to="/shelves"
				end
			>
				<i>library_books</i>
				<div>Shelves</div>
			</NavLink>
			<NavLink
				to="/auth"
				end
			>
				<i>lock</i>
				<div>Authentication</div>
			</NavLink>
			<NavLink
				to="/search"
				end
			>
				<i>search</i>
				<div>Search</div>
			</NavLink>
			<NavLink
				to="/books/new"
				end
			>
				<i>add_box</i>
				<div>Add Book</div>
			</NavLink>
			<NavLink
				to="/scan"
				end
			>
				<i>qr_code_scanner</i>
				<div>Scan</div>
			</NavLink>
			<NavLink
				to="/searchpeople"
				end
			>
				<i>person_search</i>
				<div>Search People</div>
			</NavLink>
			<hr></hr>
			<label>Reading Lists</label>
			<NavLink
				to="/books/?list=W"
				end
			>
				<i>favorite_border</i>
				<div>Want To Read</div>
			</NavLink>
			<NavLink
				to="/books/?list=R"
				end
			>
				<i>book</i>
				<div>Is Reading</div>
			</NavLink>
			<NavLink
				to="/books/?list=F"
				end
			>
				<i>done</i>
				<div>Finished Reading</div>
			</NavLink>
		</nav>
	);
}

export default MainNavigation;
