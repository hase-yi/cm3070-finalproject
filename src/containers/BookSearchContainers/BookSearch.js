import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setQuery, clearSelectedBook, searchBooks, addBook } from '../../features/searchSlice';
import BookModal from '../../components/BookSearchComponents/BookModal';
import BookItem from '../../components/BookComponents/BookItem';
import AddBook from '../../components/BookSearchComponents/AddBook';
import debounce from 'lodash.debounce';
import classes from './BookSearch.module.css';

const BookSearch = ({ shelfId }) => {
  const dispatch = useDispatch();
  const query = useSelector((state) => state.search.query);
  const results = useSelector((state) => state.search.results);
  const selectedBook = useSelector((state) => state.search.selectedBook);
  const showModal = useSelector((state) => state.search.showModal);
  const feedbackMessage = useSelector((state) => state.search.feedbackMessage);
  const loading = useSelector((state) => state.search.loading);

  const handleChange = (e) => {
    const query = e.target.value;
    dispatch(setQuery(query));
  };

  const debouncedSearch = debounce(() => {
    dispatch(searchBooks(query));
  }, 300);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      debouncedSearch();
    }
  };

  return (
    <div className={classes.bookSearch}>
      <h1>Search Books</h1>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyPress}
        placeholder="Search for books"
        className={classes.input}
      />
      <button onClick={debouncedSearch} className={classes.button}>Search</button>
      {feedbackMessage && (
        <div className={classes.feedbackMessage}>{feedbackMessage}</div>
      )}
      {loading && (
        <div className={classes.loadingIndicator}>Loading...</div>
      )}
      <ul className={classes.results}>
        {results.map((book) => (
          <li key={book.key} className={classes.bookItem}>
            <BookItem book={book} />
            <AddBook book={book} shelfId={shelfId} />
          </li>
        ))}
      </ul>
      <BookModal
        show={showModal}
        book={selectedBook}
        onAddBook={() => dispatch(addBook({ newBook: selectedBook, shelfId }))}
        onClose={() => dispatch(clearSelectedBook())}
      />
    </div>
  );
};

export default BookSearch;
