import React from 'react';
import BookForm from '../../containers/BookContainers/BookForm';

const NewBookPage = () => {
  return (
    <div>
      <h1>Add New Book</h1>
      <BookForm method="POST" />
    </div>
  );
};

export default NewBookPage;
