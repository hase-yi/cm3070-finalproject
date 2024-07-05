import React from 'react';
import classes from './BookModal.module.css';

const BookModal = ({ show, book, onAddBook, onClose }) => {
  if (!show) {
    return null;
  }

  const handleAddBook = () => {
    onAddBook(book);
  };

  return (
    <div className={classes.modal}>
      <div className={classes.modalContent}>
        <span className={classes.close} onClick={onClose}>&times;</span>
        <h2>{book.title}</h2>
        <p>{book.author_name ? book.author_name[0] : 'Unknown'}</p>
        {book.cover_i && (
          <img
            src={`https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`}
            alt={`${book.title} cover`}
          />
        )}
        <button onClick={handleAddBook}>Add to Shelf</button>
      </div>
    </div>
  );
};

export default BookModal;
