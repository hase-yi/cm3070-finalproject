import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchBook } from '../../features/bookSlice';
import BookItem from '../../components/BookComponents/BookItem';
import Reviews from '../../components/Reviews/Reviews';
import Comment from '../../components/Comments/Comment';
import Comments from '../../components/Comments/Comments';

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
    return <progress class="circle"></progress>;
  }

  if (status === 'failed') {
    return <p className='error'>{error}</p>;
  }

  return (
    <div>
      {<BookItem />}
      <hr className='large'></hr>
      {<Reviews />}
      <hr className='large'></hr>
      {book?.review && <Comments />}
    </div>
  );
};

export default BookDetailPage;
