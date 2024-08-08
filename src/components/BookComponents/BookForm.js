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
import ReadingStatusForm from './ReadingStatusForm';
import { useLocation } from 'react-router-dom';


const BookForm = ({ method, bookId }) => {
	const location = useLocation();
	const bookPrototype = location.state?.bookPrototype;

  if (bookPrototype) {
    method = "POST"
  }


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
		title: book?.title || bookPrototype?.title || '',
		author: book?.author || bookPrototype?.author || '',
		isbn: book?.isbn || bookPrototype?.isbn || '',
		totalPages: book?.total_pages || bookPrototype?.total_pages || '',
		releaseYear: book?.release_year || bookPrototype?.release_year || '',
		shelf: book?.shelf || '',
		image: book?.image || bookPrototype?.image || '',
	});

	const [isbnError, setISBNError] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [imageFile, setImageFile] = useState(null);
	const [previewImage, setPreviewImage] = useState(book?.image || bookPrototype?.image|| null);

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
		};

		try {
			let response;
			if (method === 'POST') {
				response = await dispatch(createBook(bookData)).unwrap();
			} else if (method === 'PUT' && book) {
				response = await dispatch(updateBook(bookData)).unwrap();
			}

			const bookId = response.id || book.id;
			console.log(bookId);

			if (imageFile && bookId) {
				// Ensure bookId is defined before attempting image upload
				const imageUrl = await uploadImage(bookId); // Upload image after form submission
				const updatedBookData = {
					...bookData,
					id: bookId,
					image: imageUrl,
				};
				await updateBookWithImage(updatedBookData); // Update book with the image URL
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

	const updateBookWithImage = async (updatedBookData) => {
		try {
			await dispatch(
				updateBook(
					updatedBookData // Spread the full book data with the new image URL
				)
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
