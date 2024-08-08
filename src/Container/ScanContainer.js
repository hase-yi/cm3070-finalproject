import React from 'react';
import BookScanner from '../components/BookSearchComponents/BookScanner';
import { fetchBooks } from '../features/bookSlice'; // Import the searchBook thunk
import classes from './ScanContainer.module.css'; // Import the CSS module
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axiosInstance from '../axiosInstance';
import { useSearchParams, useNavigate } from 'react-router-dom';

const ScanContainer = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const [searchResults, setSearchResults] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [searchTerm, setSearchTerm] = useState(''); // State for the input value

	const status = useSelector((state) => state.books.status);
	const books = useSelector((state) => state.books.books);

	// Fetch books when the status is 'idle'
	useEffect(() => {
		if (status === 'idle') {
			dispatch(fetchBooks());
		}
	}, [dispatch, status]);

	const handleDetected = (data) => {
		const code = Number(data.codeResult.code);
		console.log(code);

		// TODO: Check if valid ISBN

		setLoading(true);
		setError(null);

		const local_results = books
			.filter((book) => book.isbn === code)
			.map((b) => {
				return { type: 'local', book: b };
			});

		setSearchResults(local_results);
      if (!loading) {
        		axiosInstance
			.get(`/books/search/`, { params: { isbn: code } })
			.then((response) => {
				const remote_results = response.data.map((book) => {
					return { type: 'remote', book: book };
				});
				setSearchResults(local_results.concat(remote_results));
				// setLoading(false);
			})
			.catch((err) => {
				setError('An error occurred while fetching the search results.');
				// setLoading(false);
			});
      }

	};

	// Handle navigation to /books/new with book data as state
	const handleExternalBookClick = (book) => {
		navigate('/books/new', { state: { bookPrototype: book } });
	};

	return (
		<div className={classes.ScanContainer}>
			<h1>Scan Book</h1>
			<BookScanner onDetected={handleDetected} />
			{error && <div className={classes.feedbackMessage}>Error: {error}</div>}
			{loading && <div className={classes.loadingIndicator}>Loading...</div>}
			<ul className={classes.results}>
				{searchResults.map((book, index) => (
					<li key={index} className={classes.bookItem}>
						{book.book?.image && (
							<img src={book.book.image} alt={book.book.title} />
						)}
						{book.book?.title} by {book.book?.author}
						<p>{book.type}</p>
						{book.type === 'local' ? (
							<a href={`/books/${book.book.id}`}>Go to book</a>
						) : (
							<button onClick={() => handleExternalBookClick(book.book)}>
								Add to Library
							</button>
						)}
					</li>
				))}
			</ul>
		</div>
	);
};

export default ScanContainer;
