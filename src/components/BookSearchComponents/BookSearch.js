import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import classes from './BookSearch.module.css';
import { fetchBooks } from '../../features/bookSlice';
import axiosInstance from '../../axiosInstance';
import { useSearchParams, useNavigate } from 'react-router-dom';

const BookSearch = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate()
	const [searchParams, setSearchParams] = useSearchParams();
	const [searchResults, setSearchResults] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [searchTerm, setSearchTerm] = useState(''); // State for the input value

	const status = useSelector((state) => state.books.status);
	const books = useSelector((state) => state.books.books);

	// Set searchTerm from URL search params on page load
	useEffect(() => {
		const search = searchParams.get('search');
		if (search) {
			setSearchTerm(search);
		}
	}, [searchParams]);

	// Debounced search effect
	useEffect(() => {
		if (searchTerm !== '') {
			const handler = setTimeout(() => {
				setLoading(true);
				setError(null);

				const local_results = books
					.filter((book) => book.title.toLowerCase().includes(searchTerm.toLowerCase()))
					.map((b) => {
						return { type: 'local', book: b };
					});

				setSearchResults(local_results);

				axiosInstance
					.get(`/books/search/`, { params: { title: searchTerm } })
					.then((response) => {
						const remote_results = response.data
                        .filter(remoteBook => !local_results.some(localResult => localResult.book.isbn === remoteBook.isbn))
                        .map((book) => {
                            return { type: 'remote', book: book };
                        });
						setSearchResults(local_results.concat(remote_results));
						setLoading(false);
					})
					.catch((err) => {
						setError('An error occurred while fetching the search results.');
						setLoading(false);
					});
			}, 500); // 500ms debounce delay

			return () => {
				clearTimeout(handler); // Cleanup the timeout if searchTerm changes
			};
		} else {
			setSearchResults([]); // Clear results if searchTerm is empty
		}
	}, [searchTerm, books]);

	const handleSearch = (e) => {
		const newQuery = e.target.value;
		setSearchTerm(newQuery);
		setSearchParams({ search: newQuery });
	};

		// Handle navigation to /books/new with book data as state
		const handleExternalBookClick = (book) => {
			navigate('/books/new', { state: { bookPrototype: book } });
		};

	return (
		<div className={classes.form}>
			<div className={classes.input}>
				<input
					type="text"
					placeholder="Search by title"
					value={searchTerm || ''}
					onChange={handleSearch}
				/>{' '}
			</div>

			{loading && <p className={classes.loadingIndictor}>Loading...</p>}
			{error && <p className={classes.feedbackMessage}>Error:{error}</p>}
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

export default BookSearch;
