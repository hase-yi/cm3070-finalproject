import React from 'react';
import { useSelector } from 'react-redux';

import ShelfList from '../../components/ShelfComponents/ShelfList';

function ShelvesPage() {
	const shelves = useSelector((state) => state.shelves.shelves);
	const status = useSelector((state) => state.shelves.status);
	const error = useSelector((state) => state.shelves.error);

	if (status === 'loading')
		return <p style={{ textAlign: 'center' }}>Loading...</p>;
	if (status === 'failed')
		return <p style={{ textAlign: 'center' }}>{error}</p>;

	return <ShelfList shelves={shelves} />;
}

export default ShelvesPage;
