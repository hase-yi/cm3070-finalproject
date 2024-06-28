import classes from './ShelfItem.module.css'

import { Link, useSubmit } from 'react-router-dom';

function ShelfItem({shelf}){
  const submit = useSubmit();//submit function

  function startDeleteHandler(){
    const proceed = window.confirm('Are you sure?')//boolean
    if (proceed){
submit(null, {method: 'DELETE'});
    }
  }

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