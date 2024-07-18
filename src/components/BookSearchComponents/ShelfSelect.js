// ShelfSelect.js
import {useEffect}from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {fetchShelves} from '../../features/shelfSlice'
import { fetchBooksForShelf } from '../../features/bookSlice';
import classes from './ShelfSelect.module.css';

const ShelfSelect = ({ book}) => {
	const dispatch = useDispatch();
	const { shelves,status} = useSelector((state) => state.shelves);

  useEffect(() => {

      // console.log('Fetching shelves...');
      dispatch(fetchShelves()).then((response) => {
        // console.log('Shelves fetched:', response);
      });

	}, [dispatch]);

	const handleShelfChange = (e) => {
		const shelfId = e.target.value;
		dispatch(fetchBooksForShelf({ book, shelfId }));
	};

  if(!book){
    return null;
  }
  const currentShelf = shelves.find((shelf) => shelf.id === book.shelf_id);
  // console.log(currentShelf);

  if (status==='idle') {
    return <p>Loading shelves...</p>;
  }else
	return (
    <div>

      <select
        className={classes.shelfSelect}
        onChange={handleShelfChange}
        defaultValue={book.shelf_id || ""}
      >
        <option value="" disabled>
          Select shelf
        </option>
        {shelves.map((shelf) => (
          <option key={shelf.id} value={shelf.id}>
            {shelf.title}
          </option>
        ))}
      </select>
       {book.type === 'local' && book.shelf_id(
        <p>Current Shelf: {currentShelf?.title || 'No shelf assigned'}</p>
    )}
    </div>
	);
};

export default ShelfSelect;
