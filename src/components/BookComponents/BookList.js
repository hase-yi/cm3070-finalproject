import React from 'react';
import BookItem from './BookItem';

const BookList = ({ books }) => {
  return (
    <ul>
      {books.map((book) => (
        <BookItem key={book.id} book={book} />
      ))}
    </ul>
  );
};

export default BookList;
