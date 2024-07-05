import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setQuery, setSelectedBook, clearSelectedBook, searchBooks, addBook } from '../../features/searchSlice';
import BookModal from '../../components/BookModal/BookModal';
import Scanner from '../../components/Scanner/Scanner';
import BookItem from '../../components/BookItem/BookItem';
import debounce from 'lodash.debounce';
import './BookSearch.css';

const BookSearch = () => {
  const dispatch = useDispatch();
  const query = useSelector((state) => state.search.query);
  const results = useSelector((state) => state.search.results);
  const selectedBook = useSelector((state) => state.search.selectedBook);
  const showModal = useSelector((state) => state.search.showModal);
  const feedbackMessage = useSelector((state) => state.search.feedbackMessage);
  const loading = useSelector((state) => state.search.loading);

  const handleDetected = (data) => {
    const query = data.codeResult.code;
    if (query.length < 13) return;
    dispatch(setQuery(query));
    dispatch(searchBooks(query));
  };

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

  const handleAddBook = (book) => {
    dispatch(addBook(book));
  };

  return (
    <div className="BookSearch">
      <h1>Search Books</h1>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyPress}
        placeholder="Search for books"
      />
      <button onClick={debouncedSearch}>Search</button>
      {feedbackMessage && (
        <div className="feedback-message">{feedbackMessage}</div>
      )}
      {loading && (
        <div className="loading-indicator">Loading...</div>
      )}
      <Scanner onDetected={handleDetected} />
      <ul className="results">
        {results.map((book) => (
          <BookItem key={book.key} book={book} />
        ))}
      </ul>
      <BookModal
        show={showModal}
        book={selectedBook}
        onAddBook={handleAddBook}
        onClose={() => dispatch(clearSelectedBook())}
      />
    </div>
  );
};

export default BookSearch;
