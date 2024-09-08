import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getUsername } from '../features/authSlice';
import { fetchFollowedUsers, fetchFollowers } from '../features/followingSlice';
import { fetchBooks } from '../features/bookSlice';
import { fetchShelves } from '../features/shelfSlice';
import { useLocation } from 'react-router-dom';

function NavigationLinks() {
	const user = useSelector((state) => state.auth.user);
	const status = useSelector((state) => state.auth.status);
	const { search } = useLocation()

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

	const list = new URLSearchParams(search).get('list')
	return (
		<>
			<NavLink
				to="/"
				end
			>
				<i>home</i>
				<div>{user && `${user}'s `} Home</div>
			</NavLink>
			<NavLink
				to="/shelves"
				end
			>
				<i>library_books</i>
				<div>Shelves</div>
			</NavLink>
			{/* <NavLink
				to="/auth"
				end
			>
				<i>lock</i>
				<div>Authentication</div>
			</NavLink> */}
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
			<NavLink
				to="/auth"
				end
			>
				<i>logout</i>
				<div>Logout</div>
			</NavLink>
			<hr className='m l'></hr>
			<label className='m l'>Reading Lists</label>
			<NavLink
				to="/books/?list=W"
				className={({ isActive }) => (isActive && list === 'W') ? 'active' : ''}
				end
			>
				<i>favorite_border</i>
				<div>Want To Read</div>
			</NavLink>
			<NavLink
				to="/books/?list=R"
				className={({ isActive }) => (isActive && list === 'R') ? 'active' : ''}
				end
			>
				<i>book</i>
				<div>Is Reading</div>
			</NavLink>
			<NavLink
				to="/books/?list=F"
				className={({ isActive }) => (isActive && list === 'F') ? 'active' : ''}
				end
			>
				<i>done</i>
				<div>Finished Reading</div>
			</NavLink>
		</>
	);
}

export default NavigationLinks;
