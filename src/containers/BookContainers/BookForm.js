import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { createBook, fetchBook, updateBook } from '../../features/bookSlice';

const BookForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  
  // Initialize formData state to hold form field values
  const [formData, setFormData] = useState({
    isbn: '',
    title: '',
    author: '',
    total_pages: '',
    release_year: '',
    shelf: '',
    image: ''
  });

  // Get the book to edit if isEditing is true
  const book = useSelector((state) =>
    state.books.books.find((book) => book.id === parseInt(id))
  );
  
  // Fetch book data if editing
  useEffect(() => {
    if (isEditing) {
      if (!book) {
        dispatch(fetchBook(id));
      } else {
        setFormData({
          isbn: book.isbn,
          title: book.title,
          author: book.author,
          total_pages: book.total_pages || '',
          release_year: book.release_year || '',
          shelf: book.shelf ? book.shelf.id : '',
          image: book.image || ''
        });
      }
    }
  }, [isEditing, book, dispatch, id]);

  // Get shelves from state
  const shelves = useSelector((state) => state.shelves.shelves);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEditing) {
      await dispatch(updateBook({ id, updatedBook: formData }));
    } else {
      await dispatch(createBook(formData));
    }
    navigate('/books');
  };

  return (
    <div>
      <h2>{isEditing ? 'Edit Book' : 'Add New Book'}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="isbn">ISBN:</label>
          <input
            type="text"
            id="isbn"
            name="isbn"
            value={formData.isbn}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="author">Author:</label>
          <input
            type="text"
            id="author"
            name="author"
            value={formData.author}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="total_pages">Total Pages:</label>
          <input
            type="number"
            id="total_pages"
            name="total_pages"
            value={formData.total_pages}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="release_year">Release Year:</label>
          <input
            type="number"
            id="release_year"
            name="release_year"
            value={formData.release_year}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="shelf">Shelf:</label>
          <select
            id="shelf"
            name="shelf"
            value={formData.shelf}
            onChange={handleChange}
          >
            <option value="">Select Shelf</option>
            {shelves.map((shelf) => (
              <option key={shelf.id} value={shelf.id}>
                {shelf.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="image">Image URL:</label>
          <input
            type="text"
            id="image"
            name="image"
            value={formData.image}
            onChange={handleChange}
          />
        </div>
        <button type="submit">{isEditing ? 'Update' : 'Add'}</button>
      </form>
    </div>
  );
};

export default BookForm;
