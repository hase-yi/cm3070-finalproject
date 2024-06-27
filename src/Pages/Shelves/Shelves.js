import { useEffect, useState } from 'react';

import ShelfList from '../../components/ShelfComponents/ShelfList'

function ShelvesPage() {
	const [isLoading, setIsLoading] = useState(false);
	const [fetchedShelves, setFetchedShelves] = useState();
	const [error, setError] = useState();

	useEffect(() => {
		async function fetchShelves() {
			setIsLoading(true);
			const response = await fetch('http://127.0.0.1:8000/api/shelves/');
			if (!response.ok) {
				setError('Fetching shelves failed.');
			} else {
				const resData = await response.json();
				console.log(resData);
				setFetchedShelves(resData.shelves);
			}
			setIsLoading(false);
		}
		fetchShelves();
	}, []);

	return (
		<>
			<h1>The Shelves page</h1>
			<>
				<div style={{ textAlign: 'center' }}>
					{isLoading && <p>Loading...</p>}
					{error && <p>{error}</p>}
				</div>
				{!isLoading && fetchedShelves && <ShelfList shelves={fetchedShelves}/>}
			</>
		</>
	);
}

export default ShelvesPage;

// {/* <ul>
// {SHELVES.map((shelf) => (
//   <li key={shelf.id}>
//     {/* relative path */}
//     <Link to={shelf.id} >{shelf.id}</Link>
//   </li>
// ))}
// </ul> */}
