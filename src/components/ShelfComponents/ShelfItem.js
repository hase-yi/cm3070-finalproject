import classes from './ShelfItem.module.css'

function ShelfItem({event}){
  function startDeleteHandler(){
    //...
  }

  return(
    <article className={classes.shelf}>
      <img src={shelf.image} alt={shelf.title}/>
      <h1>{shelf.title}</h1>
      <p>{shelf.description}</p>
      <menu className={classes.actions}>
        <a href="edit">Edit</a>
        <button onClick={startDeleteHandler}>Delete</button>
      </menu>
    </article>
  );

}

export default ShelfItem;