import {  useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import ShelfItem from '../../components/ShelfComponents/ShelfItem';
import BookList from '../../components/BookComponents/BookList';

function ShelfDetailPage() {
  const { shelfId } = useParams();
  const shelf = useSelector((state) =>
    state.shelves.shelves.find((shelf) => shelf.id === parseInt(shelfId))
  );
  const books = useSelector((state) => state.books.books);


  return (
    <div>
      {shelf && <ShelfItem shelf={shelf} />}
      <h2>Books</h2>
      <BookList books={books} />
    </div>
  );
}

export default ShelfDetailPage;
