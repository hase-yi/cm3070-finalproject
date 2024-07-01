import { useLoaderData, json, defer, Await } from 'react-router-dom';

import ShelfList from '../../components/ShelfComponents/ShelfList';
import { Suspense } from 'react';

function ShelvesPage() {
	const { shelves } = useLoaderData(); //Object deconstruct	shelves.shelves from defer function

	// if (shelves.isError) {
	// 	return <p>{shelves.message}</p>;
	// }
	// return <ShelfList shelves={shelves} />;
	return (
		<Suspense fallback={<p style={{textAlign:'center'}}>Loading...</p>}>
			<Await resolve={shelves}>
				{(loadedShelves) => <ShelfList shelves={loadedShelves} />}
			</Await>
		</Suspense>
	);
}

export default ShelvesPage;

export async function loadShelf() {
	const response = await fetch('http://127.0.0.1:8000/api/shelves/');
	if (!response.ok) {
		// return {isError:true, message:'Could not fetch events.'}

		return json({ message: 'Could not fetch shelves' }, { status: 500 });
	} else {
		// useLoaderData gives the data that is part of the response
		// return response;
		const resData = await response.json();
		return resData;
	}
}

export function loader() {
	return defer({
		shelves: loadShelf(), //store promise under shelves key
	});
}
