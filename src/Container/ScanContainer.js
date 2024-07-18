import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import BookScanner from '../components/BookSearchComponents/BookScanner';
import { searchBook } from '../features/bookSlice'; // Import the searchBook thunk
import classes from './ScanContainer.module.css'; // Import the CSS module

const ScanContainer = () => {
  const dispatch = useDispatch();
  const { books, loading, error } = useSelector((state) => state.books); // Get state from Redux

  const handleDetected = (data) => {
    const code = data.codeResult.code;
    console.log(code);

    // ISBN-13 is 13 digits long, so ensure the code has 13 digits
    if (code.length !== 13 || isNaN(code)) {
      alert('Invalid ISBN detected.');
      return;
    }
    handleSearch(code);
  };

  const handleSearch = (isbn) => {
    dispatch(searchBook({ isbn })); // Dispatch the thunk with the ISBN
  };

  return (
    <div className={classes.ScanContainer}>
      <h1>Scan Book</h1>
      <BookScanner onDetected={handleDetected} />
      {error && <div className={classes.feedbackMessage}>Error: {error}</div>}
      {loading && <div className={classes.loadingIndicator}>Loading...</div>}
      <div className={classes.results}>
        {books.map((book) => (
          <div key={book.key} className={classes.bookItem}>
            <h3>{book.title}</h3>
            <p>{book.author_name ? book.author_name[0] : 'Unknown'}</p>
            {book.cover_i && (
              <img
                src={`https://covers.openlibrary.org/b/id/${book.cover_i}-S.jpg`}
                alt={`${book.title} cover`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScanContainer;
