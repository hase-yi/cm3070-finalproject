import React from 'react';

const BookItem = ({ book }) => {
  return (
    <div>
      <h3>{book.title}</h3>
      <p>Author: {book.author_name ? book.author_name[0] : 'Unknown'}</p>
      {book.cover_i && (
        <img
          src={`https://covers.openlibrary.org/b/id/${book.cover_i}-S.jpg`}
          alt={`${book.title} cover`}
        />
      )}
    </div>
  );
};

export default BookItem;

