import { useLoaderData, json } from 'react-router-dom';

import ShelfList from '../../components/ShelfComponents/ShelfList';

function ShelvesPage() {
	const shelves = useLoaderData();

	if (shelves.isError) {
		return <p>{shelves.message}</p>;
	}
	return <ShelfList shelves={shelves} />;
}

export default ShelvesPage;

export async function loader() {
	const response = await fetch('http://127.0.0.1:8000/api/shelves/');
	if (!response.ok) {
		// return {isError:true, message:'Could not fetch events.'}

		return json({ message: 'Could not fetch shelves' }, { status: 500 });
	} else {
		// useLoaderData gives the data that is part of the response
		return response;
	}
}
