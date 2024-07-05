import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchBook } from '../../features/bookSlice';
import BookItem from '../../components/BookComponents/BookItem';

const BookDetailPage = () => {
  const { bookId } = useParams();
  const dispatch = useDispatch();

  const book = useSelector((state) =>
    state.books.books.find((book) => book.id === parseInt(bookId))
  );
  const status = useSelector((state) => state.books.status);
  const error = useSelector((state) => state.books.error);

  useEffect(() => {
    if (!book) {
      dispatch(fetchBook(bookId));
    }
  }, [dispatch, bookId, book]);

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  if (status === 'failed') {
    return <p>{error}</p>;
  }

  return (
    <div>
      {book && <BookItem book={book} />}
    </div>
  );
};

export default BookDetailPage;
