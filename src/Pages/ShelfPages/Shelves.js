import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchShelves } from '../../features/shelfSlice';

import ShelfList from '../../components/ShelfComponents/ShelfList';

function ShelvesPage() {
	const dispatch = useDispatch();
	const shelves = useSelector((state) => state.shelves.shelves);
	const status = useSelector((state) => state.shelves.status);
	const error = useSelector((state) => state.shelves.error);

	useEffect(() => {
		if (status === 'idle') {
			dispatch(fetchShelves());
		}
	}, [dispatch, status]);

	if (status === 'loading')
		return <p style={{ textAlign: 'center' }}>Loading...</p>;
	if (status === 'failed')
		return <p style={{ textAlign: 'center' }}>{error}</p>;

	return <ShelfList shelves={shelves} />;
}

export default ShelvesPage;
