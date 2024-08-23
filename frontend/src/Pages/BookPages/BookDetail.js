import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';  // Redux hooks for dispatching actions and selecting state
import { useParams } from 'react-router-dom';  // Hook to access URL parameters
import { fetchBook } from '../../features/bookSlice';  // Action to fetch a specific book from the Redux store
import BookItem from '../../components/BookComponents/BookItem';  // Component to display detailed information about a book
import Reviews from '../../components/Reviews/Reviews';  // Component to display reviews related to the book
import Comments from '../../components/Comments/Comments';  // Component to display comments related to the book's review

const BookDetailPage = () => {
  const { bookId } = useParams();  // Retrieve the bookId from the URL parameters
  const dispatch = useDispatch();  // Hook to dispatch actions

  // Select the specific book from the Redux store based on the bookId
  const book = useSelector((state) =>
    state.books.books.find((book) => book.id === parseInt(bookId))
  );
  const status = useSelector((state) => state.books.status);  // Get the loading status of books
  const error = useSelector((state) => state.books.error);  // Get any errors related to fetching books

  // useEffect hook to fetch the book data if it is not already loaded
  useEffect(() => {
    if (!book) {
      dispatch(fetchBook(bookId));  // Dispatch the action to fetch the book details
    }
  }, [dispatch, bookId, book]);  // Dependencies: run the effect when dispatch, bookId, or book changes

  // Display a loading indicator if the book data is still being fetched
  if (status === 'loading') {
    return <progress className="circle"></progress>;
  }

  // Display an error message if there was an issue fetching the book data
  if (status === 'failed') {
    return <p className='error'>{error}</p>;
  }

  return (
    <div>
      {/* Render the BookItem component to display detailed information about the book */}
      {<BookItem />}
      <hr className='large' />  {/* Horizontal rule to separate sections */}
      
      {/* Render the Reviews component to display reviews related to the book */}
      {<Reviews />}
      <hr className='large' />  {/* Horizontal rule to separate sections */}

      {/* If the book has a review, render the Comments component to display comments related to the review */}
      {book?.review && <Comments />}
    </div>
  );
};

export default BookDetailPage;  // Export the BookDetailPage component as the default export
