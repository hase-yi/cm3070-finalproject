import React from 'react';
import { useSelector } from 'react-redux';  // Hook to access the Redux store

import ShelfList from '../../components/ShelfComponents/ShelfList';  // Component to display a list of shelves

function ShelvesPage() {
	const shelves = useSelector((state) => state.shelves.shelves);  // Get the list of shelves from the Redux store
	const status = useSelector((state) => state.shelves.status);  // Get the loading status of shelves
	const error = useSelector((state) => state.shelves.error);  // Get any errors related to fetching shelves

	// If the shelves data is still loading, display a loading message
	if (status === 'loading')
		return <p style={{ textAlign: 'center' }}>Loading...</p>;

	// If there was an error fetching shelves, display the error message
	if (status === 'failed')
		return <p style={{ textAlign: 'center' }}>{error}</p>;

	// If the shelves are successfully loaded, render the ShelfList component
	return <ShelfList shelves={shelves} />;
}

export default ShelvesPage;  // Export the ShelvesPage component as the default export
