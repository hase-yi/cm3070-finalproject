import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchShelf, deleteShelf } from '../../features/shelfSlice';
import classes from './ShelfItem.module.css';

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
          // console.log('Shelf deleted successfully, navigating to /shelves'); // Debug log
        } else {
          // console.error('Failed to delete the shelf:', result.error.message);
        }
      });
    }
  };

  console.log('ShelfItem render:', shelf); // Debug log

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'failed') {
    return <div>Error: {error}</div>;
  }

  if (!shelf) {
    return <div>Shelf not found</div>;
  }

  return (
    <article className={classes.shelf}>
      <img src={shelf.image} alt={shelf.title} />
      <h1>{shelf.title}</h1>
      <p>{shelf.description}</p>
      <menu className={classes.actions}>
        <Link to="edit">Edit</Link>
        <button onClick={startDeleteHandler}>Delete</button>
      </menu>
    </article>
  );
}

export default ShelfItem;
