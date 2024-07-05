import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchShelf } from '../../features/shelfSlice';
import { fetchBooksForShelf } from '../../features/bookSlice';
import ShelfItem from '../../containers/ShelfContainers/ShelfItem';
import BookList from '../../components/BookComponents/BookList';

function ShelfDetailPage() {
  const { shelfId } = useParams();
  const dispatch = useDispatch();

  const shelf = useSelector((state) =>
    state.shelves.shelves.find((shelf) => shelf.id === parseInt(shelfId))
  );
  const books = useSelector((state) => state.books.books);
  const shelfStatus = useSelector((state) => state.shelves.status);
  const bookStatus = useSelector((state) => state.books.status);
  const error = useSelector((state) => state.shelves.error);

  useEffect(() => {
    if (!shelf) {
      dispatch(fetchShelf(shelfId));
    }
    dispatch(fetchBooksForShelf(shelfId));
  }, [dispatch, shelfId, shelf]);

  if (shelfStatus === 'loading' || bookStatus === 'loading') {
    return <p>Loading...</p>;
  }

  if (shelfStatus === 'failed') {
    return <p>{error}</p>;
  }

  return (
    <div>
      {shelf && <ShelfItem shelf={shelf} />}
      <h2>Books</h2>
      <BookList books={books.filter((book) => book.shelf === parseInt(shelfId))} />
    </div>
  );
}

export default ShelfDetailPage;
