import React from 'react';
import { useSelector } from 'react-redux';  // Hook to access the Redux store
import { useLocation } from 'react-router-dom';  // Hook to access the current URL location

import BookList from '../../components/BookComponents/BookList';  // Component to display a list of books

const BooksPage = () => {

  const location = useLocation();  // Get the current location object from React Router
  const queryParams = new URLSearchParams(location.search);  // Parse the query parameters from the URL
  const readingListStatus = queryParams.get('list');  // Get the 'list' parameter from the query string

  const status = useSelector((state) => state.books.status);  // Get the loading status of books from the Redux store
  const error = useSelector((state) => state.books.error);  // Get any error related to fetching books

  // If the books are still loading, display a loading message
  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  // If fetching the books failed, display the error message
  if (status === 'failed') {
    return <p>{error}</p>;
  }

  return (
    <div>
      {/* Render the BookList component, passing the readingListStatus from the query string */}
      <BookList readingListStatus={readingListStatus} />
    </div>
  );
};

export default BooksPage;  // Export the BooksPage component as the default export
