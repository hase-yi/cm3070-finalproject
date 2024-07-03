import { useRouteLoaderData, json, redirect } from 'react-router-dom';

import ShelfItem from '../../components/ShelfComponents/ShelfItem';

function ShelfDetailPage() {
	const data = useRouteLoaderData('shelf-detail');

	return <ShelfItem shelf={data} />;
}

export default ShelfDetailPage;

export async function loader({ request, params }) {
	const id = params.shelfId;
	const response = await fetch('http://127.0.0.1:8000/api/shelves/' + id);

	if (!response.ok) {
		throw json(
			{ message: 'Could not fetch details for selected shelf' },
			{ status: 500 }
		);
	} else {
		return response;
	}
}

// Deleting shelf
export async function action({ request, params }) {
	const id = params.shelfId;

	// get token
	const response = await fetch('http://127.0.0.1:8000/api/shelves/' + id, {
		method:request.method,//method used by submit function by useSubmit hook
		credentials: 'include',
	});
	 console.log(response)
	if (!response.ok) {
		throw json({ message: 'Could not delete shelf' }, { status: 500 });
	} 
		return redirect('/shelves');
}
