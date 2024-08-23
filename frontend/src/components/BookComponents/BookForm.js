import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';  // Hooks to interact with Redux store
import { useNavigate } from 'react-router-dom';  // Hook for navigation
import { createBook, updateBook } from '../../features/bookSlice';  // Redux actions to create and update a book
import { isValidISBN } from '../../utils/validation';  // Utility function to validate ISBN
import axiosInstance from '../../axiosInstance';  // Axios instance for making HTTP requests
import { useLocation } from 'react-router-dom';  // Hook to access current location state

const BookForm = ({ method, bookId }) => {
	const location = useLocation();  // Access the current location and state passed from navigation
	const bookPrototype = location.state?.bookPrototype;  // Retrieve prefilled data from navigation state

	// If bookPrototype exists, we are creating a new book
	if (bookPrototype) {
		method = "POST";  // Set method to POST for creating a new book
	}

	const numericBookId = Number(bookId);  // Convert bookId from string to number

	// Get book, status, and other necessary data from Redux store
	const book = useSelector((state) =>
		state.books.books.find((book) => book.id === numericBookId)
	);
	const status = useSelector((state) => state.books.status);
	const error = useSelector((state) => state.books.error);
	const validationErrors = useSelector((state) => state.books.validationErrors);
	const shelves = useSelector((state) => state.shelves.shelves);  // Get list of shelves from Redux store

	const dispatch = useDispatch();  // Hook to dispatch actions
	const navigate = useNavigate();  // Hook to programmatically navigate between routes

	// Initialize state for form data and other variables
	const [formData, setFormData] = useState({
		title: book?.title || bookPrototype?.title || '',  // Prefill form with existing or prototype data
		author: book?.author || bookPrototype?.author || '',
		isbn: book?.isbn || bookPrototype?.isbn || '',
		totalPages: book?.total_pages || bookPrototype?.total_pages || '',
		releaseYear: book?.release_year || bookPrototype?.release_year || '',
		shelf: book?.shelf || '',
		image: book?.image || bookPrototype?.image || '',
	});

	const [isbnError, setISBNError] = useState('');  // State to store ISBN validation errors
	const [isSubmitting, setIsSubmitting] = useState(false);  // Track form submission state
	const [imageFile, setImageFile] = useState(null);  // State to hold selected image file
	const [previewImage, setPreviewImage] = useState(book?.image || bookPrototype?.image || null);  // Image preview state

	// Effect to update form fields if the book data changes
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
			setPreviewImage(book.image || null);  // Set preview image if available
		}
	}, [book]);

	// Handle form input changes
	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prevData) => ({
			...prevData,
			[name]: value,  // Update form data based on input field name and value
		}));
	};

	// Handle status change in reading progress (if applicable)
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

	// Handle image file selection
	const handleFileChange = (file) => {
		setImageFile(file);  // Set the selected image file
		setPreviewImage(URL.createObjectURL(file));  // Create a URL for the preview image
	};

	// Validate form inputs, especially ISBN and release year
	const validateForm = () => {
		let isValid = true;

		if (!isValidISBN(formData.isbn)) {
			setISBNError('Invalid ISBN. Please check and try again.');  // Set ISBN error if invalid
			isValid = false;
		} else {
			setISBNError('');  // Clear ISBN error if valid
		}

		if (isNaN(parseInt(formData.releaseYear, 10))) {
			alert('Please enter a valid year.');
			isValid = false;
		}

		return isValid;  // Return true if the form is valid
	};

	// Handle form submission
	const handleSubmit = async (event) => {
		event.preventDefault();
		if (!validateForm()) return;  // If validation fails, exit early

		setIsSubmitting(true);  // Set submitting state to true

		// Prepare book data for submission
		const bookData = {
			id: book?.id,
			title: formData.title,
			author: formData.author,
			shelf: formData.shelf,
			image: formData.image,
			total_pages: parseInt(formData.totalPages, 10) || null,
			release_year: parseInt(formData.releaseYear, 10),
			isbn: formData.isbn.replace(/[-\s]/g, ''),  // Remove any hyphens or spaces from the ISBN
		};

		try {
			let response;
			if (method === 'POST') {
				response = await dispatch(createBook(bookData)).unwrap();  // Dispatch createBook action for POST method
			} else if (method === 'PUT' && book) {
				response = await dispatch(updateBook(bookData)).unwrap();  // Dispatch updateBook action for PUT method
			}

			const bookId = response.id || book.id;  // Get the ID of the newly created or updated book

			// If an image file is selected, upload it
			if (imageFile && bookId) {
				const imageUrl = await uploadImage(bookId);  // Upload image and get the URL
				const updatedBookData = {
					...bookData,
					id: bookId,
					image: imageUrl,
				};
				await updateBookWithImage(updatedBookData);  // Update the book with the new image URL
			}

			navigate(`/books/${bookId}`);  // Navigate to the book's detail page after submission
		} catch (err) {
			console.error('Failed to save book:', err);  // Log any errors during submission
		} finally {
			setIsSubmitting(false);  // Reset submitting state
		}
	};

	// Handle image upload to the server
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
			return response.data.file;  // Return the image URL after successful upload
		} catch (err) {
			console.error('Failed to upload image:', err);  // Log any errors during image upload
			throw err;
		}
	};

	// Update the book with the new image URL after the image is uploaded
	const updateBookWithImage = async (updatedBookData) => {
		try {
			await dispatch(
				updateBook(updatedBookData)  // Dispatch the updateBook action with the updated book data
			).unwrap();
		} catch (err) {
			console.error('Failed to update book with image URL:', err);  // Log any errors during the update
		}
	};

	// Render the form
	return (
		<form onSubmit={handleSubmit}>
			<div className='grid'>
				<div className='s12 m6 l5'>
					<article className='no-padding'>
						{previewImage && (
							<div>
								<img src={previewImage} alt="Image Preview" className='responsive' />  {/* Show image preview */}
							</div>
						)}

						<div className='padding'>
							<div className="field label prefix border">
								<i>attach_file</i>
								<input
									id="imageUpload"
									type="file"
									accept="image/*"
									onChange={(e) => handleFileChange(e.target.files[0])}  // Handle image selection
								/>
								<input type="text" />
								<label>Upload Image</label>
							</div>
						</div>
					</article>
				</div>

				<div className='s12 m6 l7'>
					{error && <p className="error">{error}</p>}  {/* Display error message if available */}
					{validationErrors && (
						<ul>
							{/* Display validation errors */}
							{Object.entries(validationErrors).map(([field, errors]) =>
								errors.map((error, index) => (
									<li key={`${field}-${index}`}>{`${field}: ${error}`}</li>
								))
							)}
						</ul>
					)}
					{isbnError && <p className="error">{isbnError}</p>}  {/* Display ISBN validation error */}

					<article className='fill'>
						{/* Form fields for book details */}
						<div className="field label border responsive">
							<input
								type="text"
								id="title"
								name="title"
								required
								value={formData.title}
								onChange={handleInputChange}
							/>
							<label>Title</label>
						</div>

						<div className="field label border responsive">
							<input
								type="text"
								id="author"
								name="author"
								required
								value={formData.author}
								onChange={handleInputChange}
							/>
							<label>Author</label>
						</div>

						<div className="field label border responsive">
							<input
								type="number"
								id="release_year"
								name="releaseYear"
								value={formData.releaseYear}
								onChange={handleInputChange}
							/>
							<label>Release Year</label>
						</div>

						<div className="field label border responsive">
							<input
								type="number"
								id="totalPages"
								name="totalPages"
								value={formData.totalPages}
								onChange={handleInputChange}
							/>
							<label>Total Pages</label>
						</div>

						<div className="field label border responsive">
							<input
								type="text"
								id="isbn"
								name="isbn"
								required
								value={formData.isbn}
								onChange={handleInputChange}
							/>
							<label>ISBN</label>
						</div>

						{/* Buttons for submitting or canceling the form */}
						<div className='row'>
							<div className='max'></div>

							<button
								type="button"
								onClick={() => navigate('..')}  // Navigate back on cancel
								disabled={isSubmitting}
							>
								<i>undo</i>
								<span>Cancel</span>
							</button>

							<button
								type="submit"
								disabled={isSubmitting}  // Disable button while submitting
							>
								<i>save</i>
								<span>{isSubmitting ? 'Submitting' : 'Save'}</span>
							</button>
						</div>
					</article>

					<article className='fill'>
						{/* Shelf selection */}
						<div className="field suffix border">
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
							<i>arrow_drop_down</i>
							<span className="helper">Shelf</span>
						</div>
					</article>
				</div>
			</div>
		</form>
	);
};

export default BookForm;  // Export the BookForm component as the default export
