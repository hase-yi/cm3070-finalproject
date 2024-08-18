import React from 'react';
import BookForm from '../../components/BookComponents/BookForm';

const NewBookPage = () => {
  return (
    <div>
      <h3>Add New Book</h3>
      <BookForm method="POST" />
    </div>
  );
};

export default NewBookPage;
