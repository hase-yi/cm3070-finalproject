import { useLoaderData } from 'react-router-dom';

import ShelfList from '../../components/ShelfComponents/ShelfList';

function ShelvesPage() {
	const shelves = useLoaderData();
	return <ShelfList shelves={shelves} />;
}

export default ShelvesPage;

