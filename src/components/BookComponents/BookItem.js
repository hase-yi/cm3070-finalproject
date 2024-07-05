import React from 'react';

const BookItem = ({ book }) => {
  return (
    <li>
      <h3>{book.title}</h3>
      <p>Author: {book.author}</p>
      <p>Status: {book.status}</p>
      <p>Reading Progress: {book.reading_percentage}%</p>
    </li>
  );
};

export default BookItem;
