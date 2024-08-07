import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  createBook,
  createReadingProgress,
  updateBook,
  updateReadingProgress,
} from '../../features/bookSlice';
import { fetchShelves } from '../../features/shelfSlice';
import classes from './BookForm.module.css';
import Input from '../Input';
import FormButtons from '../FormButtons';
import { isValidISBN } from '../../utils/validation';
import axiosInstance from '../../axiosInstance'; // Import axios instance

const BookForm = ({ method, bookId }) => {
  const numericBookId = Number(bookId);

  const book = useSelector((state) =>
    state.books.books.find((book) => book.id === numericBookId)
  );
  const status = useSelector((state) => state.books.status);
  const error = useSelector((state) => state.books.error);
  const validationErrors = useSelector((state) => state.books.validationErrors);
  const shelves = useSelector((state) => state.shelves.shelves);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: book?.title || '',
    author: book?.author || '',
    isbn: book?.isbn || '',
    totalPages: book?.total_pages || '',
    releaseYear: book?.release_year || '',
    shelf: book?.shelf || '',
    image: book?.image || '',
    reading_progress: {
      currentPage: book?.reading_progress?.current_page || 1,
      status: book?.reading_progress?.status || 'W',
      shared: book?.reading_progress?.shared || false,
    },
  });

  const [isbnError, setISBNError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(book?.image || null);

  const isReading = formData.reading_progress.status === 'R';

  // Fetch shelves on mount
  useEffect(() => {
    dispatch(fetchShelves()).then((response) => {
      console.log('Shelves fetched:', response);
    });
  }, [dispatch]);

  // Update form fields if the book changes
  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title || '',
        author: book.author || '',
        isbn: book.isbn || '',
        totalPages: book.total_pages || '',
        releaseYear: book.release_year || '',
        shelf: book.shelf || '',
        image: book.image || '',
        reading_progress: {
          currentPage: book.reading_progress?.current_page || 1,
          status: book.reading_progress?.status || 'W',
          shared: book?.reading_progress?.shared || false,
        },
      });
      setPreviewImage(book.image || null);
    }
  }, [book]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleReadingProgressChange = (e) => {
		const { name, value, type, checked } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      reading_progress: {
        ...prevData.reading_progress,
				[name]: type === 'checkbox' ? checked : value,
      },
    }));
  };

  const handleStatusChange = (event) => {
    const status = event.target.value;
    setFormData((prevData) => ({
      ...prevData,
      reading_progress: {
        ...prevData.reading_progress,
        status,
      },
    }));
  };

  const handleFileChange = (file) => {
    setImageFile(file); // Set the selected image file
    setPreviewImage(URL.createObjectURL(file)); // Set the preview image URL
  };

  const validateForm = () => {
    let isValid = true;

    if (!isValidISBN(formData.isbn)) {
      setISBNError('Invalid ISBN. Please check and try again.');
      isValid = false;
    } else {
      setISBNError('');
    }

    if (isNaN(parseInt(formData.releaseYear, 10))) {
      alert('Please enter a valid year.');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    const bookData = {
      id: book?.id,
      title: formData.title,
      author: formData.author,
      shelf: formData.shelf,
      image: formData.image,
      total_pages: parseInt(formData.totalPages, 10) || null,
      release_year: parseInt(formData.releaseYear, 10),
      isbn: formData.isbn.replace(/[-\s]/g, ''),
      reading_progress: {
        book: book?.id,
        current_page: parseInt(formData.reading_progress.currentPage, 10) || 0,
        status: formData.reading_progress.status || 'W',
        shared: formData.reading_progress.shared === "on" || false,
      },
    };

    try {
      let bookId;
      let response;
      if (method === 'POST') {
        response = await dispatch(createBook(bookData)).unwrap();
        bookId = response.id;

        bookData.reading_progress.book = bookId;

        await dispatch(createReadingProgress(bookData)).unwrap();
      } else if (method === 'PUT' && book) {
        response = await dispatch(updateBook(bookData)).unwrap();
        bookId = response.id;

        bookData.reading_progress.id = book.reading_progress.id;

        await dispatch(updateReadingProgress(bookData)).unwrap();
      }

      if (imageFile) {
        const imageUrl = await uploadImage(bookId || book.id); // Upload image after form submission
        const updatedBookData = {
          ...bookData,
          image: imageUrl,
        };
        await updateBookWithImage(bookId || book.id, updatedBookData); // Update book with the image URL
      }

      navigate(`/books/${bookId}`);
    } catch (err) {
      console.error('Failed to save book:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const uploadImage = async (bookId) => {
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('book', bookId);

    try {
      const response = await axiosInstance.post('/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.file; // Assuming the image URL is returned in the `file` field
    } catch (err) {
      console.error('Failed to upload image:', err);
      throw err;
    }
  };

  const updateBookWithImage = async (bookId, updatedBookData) => {
    try {
      await dispatch(
        updateBook({
          id: bookId,
          ...updatedBookData, // Spread the full book data with the new image URL
        })
      ).unwrap();
    } catch (err) {
      console.error('Failed to update book with image URL:', err);
    }
  };

  return (
    <form className={classes.form} onSubmit={handleSubmit}>
      {error && <p className="error">{error}</p>}
      {validationErrors && (
        <ul>
          {Object.entries(validationErrors).map(([field, errors]) =>
            errors.map((error, index) => (
              <li key={`${field}-${index}`}>{`${field}: ${error}`}</li>
            ))
          )}
        </ul>
      )}

      {isbnError && <p className={classes.error}>{isbnError}</p>}
      <Input
        label="ISBN"
        id="isbn"
        name="isbn"
        required
        value={formData.isbn}
        onChange={handleInputChange}
      />

      <Input
        label="Title"
        id="title"
        name="title"
        required
        value={formData.title}
        onChange={handleInputChange}
      />

      <Input
        label="Author"
        id="author"
        name="author"
        required
        value={formData.author}
        onChange={handleInputChange}
      />

      <Input
        label="Total Pages"
        id="totalPages"
        name="totalPages"
        type="number"
        value={formData.totalPages}
        onChange={handleInputChange}
      />

      <div className={classes['status-current-page-container']}>
        <Input
          label="Sharing"
          id="shared"
          name="shared"
          type="checkbox"
          checked={formData.reading_progress.shared}
          onChange={handleReadingProgressChange}
        />

        <label htmlFor="status">Reading Status:</label>
        <select
          id="status"
          name="status"
          value={formData.reading_progress.status}
          onChange={handleStatusChange}
        >
          <option value="W">Want to Read</option>
          <option value="R">Is Reading</option>
          <option value="F">Finished Reading</option>
          <option value="N">Not to Finish</option>
        </select>

        {isReading && (
          <Input
            label="Current Page"
            id="current_page"
            name="currentPage"
            type="number"
            value={formData.reading_progress.currentPage}
            onChange={handleReadingProgressChange}
          />
        )}
      </div>

      <Input
        label="Release Year"
        id="release_year"
        name="releaseYear"
        type="number"
        value={formData.releaseYear}
        onChange={handleInputChange}
      />

      <label htmlFor="shelf">Shelf:</label>
      <select
        id="shelf"
        name="shelf"
        required
        value={formData.shelf}
        onChange={handleInputChange}
      >
        <option value="">Select Shelf</option>
        {shelves.map((shelf) => (
          <option key={shelf.id} value={shelf.id}>
            {shelf.title}
          </option>
        ))}
      </select>

      <label htmlFor="imageUpload">Upload Image</label>
      <input
        id="imageUpload"
        type="file"
        accept="image/*"
        onChange={(e) => handleFileChange(e.target.files[0])}
      />
      {previewImage && (
        <div className={classes.imagePreview}>
          <img src={previewImage} alt="Image Preview" />
        </div>
      )}

      <div className={classes.actions}>
        <FormButtons
          label="Cancel"
          type="button"
          onClick={() => navigate('..')}
          disabled={isSubmitting}
        />
        <FormButtons
          type="submit"
          disabled={isSubmitting}
          label={isSubmitting ? 'Submitting' : 'Save'}
        />
      </div>
    </form>
  );
};

export default BookForm;
