import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';  // Hooks for navigation and retrieving URL parameters
import { deleteShelf } from '../../features/shelfSlice';  // Action to delete a shelf

function ShelfItem() {
  const { shelfId } = useParams();  // Retrieve the shelfId from the URL parameters
  const dispatch = useDispatch();  // Hook to dispatch actions
  const navigate = useNavigate();  // Hook to navigate programmatically

  const numericShelfId = parseInt(shelfId, 10);  // Ensure shelfId is converted to a number

  // Select the specific shelf from the Redux store based on the shelfId
  const shelf = useSelector((state) =>
    state.shelves.shelves.find((shelf) => shelf.id === numericShelfId)
  );
  const status = useSelector((state) => state.shelves.status);  // Get the loading status of shelves
  const error = useSelector((state) => state.shelves.error);  // Get any errors related to fetching shelves

  // Handle the deletion of the shelf
  const startDeleteHandler = () => {
    const proceed = window.confirm('Are you sure?');  // Ask for confirmation before deletion
    if (proceed) {
      // Navigate away from the shelf details before deleting
      navigate('/shelves');

      // Dispatch the action to delete the shelf
      dispatch(deleteShelf(numericShelfId)).then((result) => {
        if (result.meta.requestStatus === 'fulfilled') {
          // Shelf was successfully deleted, already navigated away
        } else {
          // Handle any errors that occur during the deletion
        }
      });
    }
  };

  // Display a loading indicator if the shelf is still being fetched
  if (status === 'loading') {
    return <progress className="circle"></progress>;
  }

  // Display an error message if there was an issue fetching the shelf
  if (status === 'failed') {
    return <div>Error: {error}</div>;
  }

  // Display a message if the shelf was not found
  if (!shelf) {
    return <div>Shelf not found</div>;
  }

  return (
    <article className='no-padding'>
      <div className='grid no-space'>
        <div className='s6'>
          {/* Display the shelf's image */}
          <img src={shelf.image} alt={shelf.title} className='responsive large-height' />
        </div>

        <div className='s6'>
          <div className='padding'>
            {/* Display the shelf's title and description */}
            <h3>{shelf.title}</h3>
            <p>{shelf.description}</p>
            <div className='medium-height'></div>
            <div className='row'>
              <div className='max'></div>
              {/* Link to edit the shelf */}
              <Link to="edit">
                <button>
                  <i>edit</i>
                  <span>Edit</span>
                </button>
              </Link>

              {/* Button to delete the shelf */}
              <button onClick={startDeleteHandler} className='error'>
                <i>delete</i>
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default ShelfItem;  // Export the component as the default export
