import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchShelf, deleteShelf } from '../../features/shelfSlice';

function ShelfItem() {
  const { shelfId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const numericShelfId = parseInt(shelfId, 10); // Ensure shelfId is a number

  const shelf = useSelector((state) =>
    state.shelves.shelves.find((shelf) => shelf.id === numericShelfId)
  );
  const status = useSelector((state) => state.shelves.status);
  const error = useSelector((state) => state.shelves.error);



  useEffect(() => {
    if (status === 'idle' || (!shelf)) {
      dispatch(fetchShelf(numericShelfId));
    }
  }, [status, dispatch, numericShelfId, shelf]);

  const startDeleteHandler = () => {
    const proceed = window.confirm('Are you sure?');
    if (proceed) {
      // NOTE: Navigate away from details first...
      navigate('/shelves');

      // ... then delete
      dispatch(deleteShelf(numericShelfId)).then((result) => {
        if (result.meta.requestStatus === 'fulfilled') {
          // console.log('Shelf deleted successfully, navigating to /shelves'); 
        } else {
          // console.error('Failed to delete the shelf:', result.error.message);
        }
      });
    }
  };

  if (status === 'loading') {
    return <progress className="circle"></progress>;
  }

  if (status === 'failed') {
    return <div>Error: {error}</div>;
  }

  if (!shelf) {
    return <div>Shelf not found</div>;
  }

  return (
    <article className='no-padding'>
      <div className='grid no-space'>
        <div className='s6'>
          <img src={shelf.image} alt={shelf.title} className='responsive large-height' />
        </div>

        <div className='s6'>
          <div className='padding'>
            <h3>{shelf.title}</h3>
            <p>{shelf.description}</p>
            <div className='medium-height'></div>
            <div className='row'>
              <div className='max'></div>
              <Link to="edit">
                <button>
                  <i>edit</i>
                  <span>Edit</span>
                </button>
              </Link>

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

export default ShelfItem;
