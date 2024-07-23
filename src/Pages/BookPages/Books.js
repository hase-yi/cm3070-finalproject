import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBooks } from '../../features/bookSlice';
import { useParams } from 'react-router-dom';

import BookList from '../../components/BookComponents/BookList';

const BooksPage = () => {
  const dispatch = useDispatch();
  const books = useSelector((state) => state.books.books);
  const status = useSelector((state) => state.books.status);
  const error = useSelector((state) => state.books.error);

  const params = useParams();
  // console.log("Params is " + params)

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchBooks());
    }
  }, [dispatch, status]);

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  if (status === 'failed') {
    return <p>{error}</p>;
  }

  return (
    <div>
      {/* <h1>Books in</h1> */}
      <BookList books={books} />
    </div>
  );
};

export default BooksPage;
