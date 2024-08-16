import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBooks } from '../../features/bookSlice';
import { useLocation } from 'react-router-dom';

import BookList from '../../components/BookComponents/BookList';

const BooksPage = () => {
  const dispatch = useDispatch();

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const readingListStatus = queryParams.get('list');

  const status = useSelector((state) => state.books.status);
  const error = useSelector((state) => state.books.error);

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  if (status === 'failed') {
    return <p>{error}</p>;
  }

  return (
    <div>
      {/* <h1>Books in</h1> */}
      <BookList readingListStatus={readingListStatus} />
    </div>
  );
};

export default BooksPage;
