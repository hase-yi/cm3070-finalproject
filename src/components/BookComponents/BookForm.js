import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createBook, updateBook } from '../../features/bookSlice';
import { fetchShelves } from '../../features/shelfSlice';
import classes from './BookForm.module.css';

const BookForm = ({ method, book }) => {
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const status = useSelector((state) => state.books.status);
	const error = useSelector((state) => state.books.status);
	const validationErrors = useSelector((state) => state.books.validationErrors);
	const shelves = useSelector((state) => state.shelves.shelves);

	const isSubmitting = status === 'loading';

	// TODO: Called twice with strict mode during development!!!
	// TODO: https://stackoverflow.com/questions/72238175/why-useeffect-running-twice-and-how-to-handle-it-well-in-react/72238236#72238236
	useEffect(() => {
		console.log('Fetching shelves...');
		dispatch(fetchShelves()).then((response) => {
			console.log('Shelves fetched:', response);
		});
	}, [dispatch]);

	const handleSubmit = async (event) => {
		event.preventDefault();
		const formData = new FormData(event.target);
		const bookData = {
			isbn: formData.get('isbn'),
			title: formData.get('title'),
			author: formData.get('author'),
			shelf: formData.get('shelf'),
			image: formData.get('image'),
		};

		// Optional integers
		const totalPages = formData.get('total_pages');
		if (totalPages) {
			bookData.total_pages = totalPages;
		}

		const releaseYear = formData.get('release_year');
		if (releaseYear) {
			bookData.release_year = releaseYear;
		}

		console.log('Submitting book data:', bookData);

		try {
			let bookId;
			let response;
			if (method === 'POST') {
				response = await dispatch(createBook(bookData)).unwrap();
				bookId = response.id; // Extract the book ID from the response
				console.log('Book created successfully', response);
			} else if (method === 'PATCH' && book) {
				response = await dispatch(
					updateBook({ id: book.id, updatedBook: bookData })
				).unwrap();
				bookId = response.id; // Extract the book ID from the response
				console.log('Book updated successfully', response);
			}
			// Navigate to the specific book route
			navigate(`/books/${bookId}`);
		} catch (err) {
			console.error('Failed to save book:', err);
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
			<p>
				<label htmlFor="isbn">ISBN:</label>
				<input
					type="text"
					id="isbn"
					name="isbn"
					required
					defaultValue={book ? book.isbn : ''}
				/>
			</p>
			<p>
				<label htmlFor="title">Title:</label>
				<input
					type="text"
					id="title"
					name="title"
					required
					defaultValue={book ? book.title : ''}
				/>
			</p>
			<p>
				<label htmlFor="author">Author:</label>
				<input
					type="text"
					id="author"
					name="author"
					required
					defaultValue={book ? book.author : ''}
				/>
			</p>
			<p>
				<label htmlFor="total_pages">Total Pages:</label>
				<input
					type="number"
					id="total_pages"
					name="total_pages"
					defaultValue={book ? book.total_pages : ''}
				/>
			</p>
			<p>
				<label htmlFor="release_year">Release Year:</label>
				<input
					type="number"
					id="release_year"
					name="release_year"
					defaultValue={book ? book.release_year : ''}
				/>
			</p>
			<p>
				<label htmlFor="shelf">Shelf:</label>
				<select
					id="shelf"
					name="shelf"
					required
					defaultValue={book ? book.shelf : ''}
				>
					<option value="">Select Shelf</option>
					{shelves.map((shelf) => (
						<option key={shelf.id} value={shelf.id}>
							{shelf.title}
						</option>
					))}
				</select>
			</p>
			<p>
				<label htmlFor="image">Image URL:</label>
				<input
					type="text"
					id="image"
					name="image"
					defaultValue={book ? book.image : ''}
				/>
			</p>

			<div className={classes.actions}>
				<button
					type="button"
					onClick={() => navigate('..')}
					disabled={isSubmitting}
				>
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
