import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';  // Redux hooks for dispatching actions and selecting state
import { useParams } from 'react-router-dom';  // Hook to access URL parameters
import { fetchShelf } from '../../features/shelfSlice';  // Action to fetch a specific shelf
import ShelfForm from '../../components/ShelfComponents/ShelfForm';  // Shelf form component for editing

function EditShelfPage() {
  const { shelfId } = useParams();  // Retrieve the shelfId from the URL parameters
  const dispatch = useDispatch();  // Hook to dispatch actions
  const shelf = useSelector((state) =>
    state.shelves.shelves.find((shelf) => shelf.id === parseInt(shelfId))
  );  // Select the specific shelf from the Redux store based on the shelfId

  const status = useSelector((state) => state.shelves.status);  // Select the loading status of the shelves
  const error = useSelector((state) => state.shelves.error);  // Select any errors related to fetching shelves

  // useEffect hook to fetch the shelf data if it is not already in the Redux store
  useEffect(() => {
    if (!shelf) {
      dispatch(fetchShelf(shelfId));  // Dispatch the action to fetch the shelf data if it hasn't been loaded
    }
  }, [dispatch, shelfId, shelf]);  // Dependencies: run this effect whenever dispatch, shelfId, or shelf changes

  // If the shelf data is still loading, display a loading indicator
  if (status === 'loading') return <progress className="circle"></progress>;

  // If fetching the shelf data failed, display an error message
  if (status === 'failed') return <p className='error'>{error}</p>;

  return (
    <div>
      {/* Display the title of the shelf and render the ShelfForm component for editing the shelf */}
      <h3>Edit {shelf.title}</h3>
      {/* Pass the existing shelf data to the ShelfForm component for editing */}
      {shelf && <ShelfForm method="PUT" shelf={shelf} />}
    </div>
  );
}

export default EditShelfPage;  // Export the EditShelfPage component as the default export
