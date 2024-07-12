import {  useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import ShelfItem from '../../components/ShelfComponents/ShelfItem';
import BookList from '../../components/BookComponents/BookList';

function ShelfDetailPage() {
  const params = useParams();
  const {shelfId} = params;

    // Log params and shelfId to ensure they are correct
    // console.log('params:', params);
    // console.log('shelfId:', shelfId);

    const parsedShelfId = parseInt(shelfId, 10);
    // console.log('parsedShelfId:', parsedShelfId);

  const shelf = useSelector((state) =>
    state.shelves.shelves.find((shelf) => shelf.id === parsedShelfId)
  );

   // Log the entire shelves state and the result of the find function
  // const shelvesState = useSelector((state) => state.shelves);
  // console.log('shelvesState:', shelvesState);
  // console.log('shelf:', shelf);

  return (
    <div>
      {shelf && <ShelfItem shelf={shelf} />}
      <h2>Books in {shelf.title}</h2>
      <BookList shelfId={shelfId} />
    </div>
  );
}

export default ShelfDetailPage;
