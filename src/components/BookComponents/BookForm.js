import {useEffect} from 'react'
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

	const isSubmitting = status === 'loading';
	const shelves = useSelector((state) => state.shelves.shelves);

  useEffect(() => {
		dispatch(fetchShelves());
	}, [dispatch]);

	const handleSubmit = async (event) => {
		event.preventDefault();
		const formData = new FormData(event.target);
		const bookData = {
			isbn: formData.get('isbn'),
			title: formData.get('title'),
			author: formData.get('author'),
			total_pages: formData.get('total_pages'),
			release_year: formData.get('release_year'),
			shelf: formData.get('shelf'),
			image: formData.get('image'),
		};

		try {
			if (method === 'POST') {
				await dispatch(createBook(bookData)).unwrap();
			} else if (method === 'PATCH' && book) {
				await dispatch(
					updateBook({ id: book.id, updatedBook: bookData })
				).unwrap();
			}
			navigate('/books');
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
				<input type="text" id="isbn" name="isbn" required />
			</p>
			<p>
				<label htmlFor="title">Title:</label>
				<input type="text" id="title" name="title" required />
			</p>
			<p>
				<label htmlFor="author">Author:</label>
				<input type="text" id="author" name="author" required />
			</p>
			<p>
				<label htmlFor="total_pages">Total Pages:</label>
				<input type="number" id="total_pages" name="total_pages" />
			</p>
			<p>
				<label htmlFor="release_year">Release Year:</label>
				<input type="number" id="release_year" name="release_year" />
			</p>
			<p>
				<label htmlFor="shelf">Shelf:</label>
				<select id="shelf" name="shelf">
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
				<input type="text" id="image" name="image" />
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
