import React from 'react';
import BookForm from '../../components/BookComponents/BookForm';

const NewBookPage = () => {
  return (
    <div>
      <h1>Add New Book</h1>
      <BookForm method="POST" />
    </div>
  );
};

export default NewBookPage;
