import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createBook, updateBook } from '../../features/bookSlice';
import classes from './BookForm.module.css';

const BookForm = ({ method, book }) => {
  const [title, setTitle] = useState(book ? book.title : '');
  const [author, setAuthor] = useState(book ? book.author : '');
  const [status, setStatus] = useState(book ? book.status : 'want_to_read');
  const [totalPages, setTotalPages] = useState(book ? book.total_pages : 0);
  const [currentPage, setCurrentPage] = useState(book ? book.current_page : 0);
  const [shelf, setShelf] = useState(book ? book.shelf : '');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isSubmitting = useSelector((state) => state.books.status === 'loading');
  const validationErrors = useSelector((state) => state.books.validationErrors);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const bookData = {
      title,
      author,
      status,
      total_pages: totalPages,
      current_page: currentPage,
      shelf,
    };

    try {
      if (method === 'POST') {
        await dispatch(createBook(bookData)).unwrap();
      } else if (method === 'PATCH' && book) {
        await dispatch(updateBook({ id: book.id, updatedBook: bookData })).unwrap();
      }
      navigate('/books');
    } catch (err) {
      console.error('Failed to save book:', err);
    }
  };

  return (
    <form className={classes.form} onSubmit={handleSubmit}>
      {validationErrors && (
        <ul>
          {Object.entries(validationErrors).map(([field, errors]) =>
            errors.map((error, index) => <li key={`${field}-${index}`}>{`${field}: ${error}`}</li>)
          )}
        </ul>
      )}
      <p>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </p>
      <p>
        <label htmlFor="author">Author</label>
        <input
          id="author"
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          required
        />
      </p>
      <p>
        <label htmlFor="status">Status</label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          required
        >
          <option value="want_to_read">Want to Read</option>
          <option value="is_reading">Is Reading</option>
          <option value="finished_reading">Finished Reading</option>
          <option value="not_to_finish">Not to Finish</option>
        </select>
      </p>
      <p>
        <label htmlFor="totalPages">Total Pages</label>
        <input
          id="totalPages"
          type="number"
          value={totalPages}
          onChange={(e) => setTotalPages(e.target.value)}
        />
      </p>
      <p>
        <label htmlFor="currentPage">Current Page</label>
        <input
          id="currentPage"
          type="number"
          value={currentPage}
          onChange={(e) => setCurrentPage(e.target.value)}
        />
      </p>
      <p>
        <label htmlFor="shelf">Shelf</label>
        <input
          id="shelf"
          type="text"
          value={shelf}
          onChange={(e) => setShelf(e.target.value)}
          required
        />
      </p>
      <div className={classes.actions}>
        <button type="button" onClick={() => navigate('/books')} disabled={isSubmitting}>
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting' : 'Save'}
        </button>
      </div>
    </form>
  );
};

export default BookForm;
