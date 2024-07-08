import React from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { deleteShelf } from '../../features/shelfSlice';
import classes from './ShelfItem.module.css';

function ShelfItem({shelf}){
const dispatch = useDispatch();
const navigate = useNavigate();

const startDeleteHandler = () => {
  const proceed = window.confirm('Are you sure?');
  if (proceed) {
    dispatch(deleteShelf(shelf.id)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        navigate('/shelves');
      } else {
        // Handle the error case
        console.error('Failed to delete the shelf:', result.error.message);
      }
    });
  }
};


  return(

    <article className={classes.shelf}>
      <img src={shelf.image} alt={shelf.title}/>
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