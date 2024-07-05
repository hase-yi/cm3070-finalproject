import React from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import BookForm from '../../components/BookComponents/BookForm';

const EditBookPage = () => {
  const { bookId } = useParams();
  const book = useSelector((state) =>
    state.books.books.find((book) => book.id === parseInt(bookId))
  );

  return (
    <div>
      <h1>Edit Book</h1>
      {book && <BookForm method="PATCH" book={book} />}
    </div>
  );
};

export default EditBookPage;
