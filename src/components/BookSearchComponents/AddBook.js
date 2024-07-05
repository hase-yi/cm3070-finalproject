import React from 'react';
import { useDispatch } from 'react-redux';
import { addBook } from '../../features/searchSlice';
import classes from './AddBook.module.css';

const AddBook = ({ book, shelfId }) => {
  const dispatch = useDispatch();

  const handleAddBook = () => {
    dispatch(addBook({ newBook: book, shelfId }));
  };

  return (
    <button className={classes.addButton} onClick={handleAddBook}>Add to Shelf</button>
  );
};

export default AddBook;
