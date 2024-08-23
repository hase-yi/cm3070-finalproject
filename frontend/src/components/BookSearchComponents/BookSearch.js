import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';  // Hooks to dispatch actions and access the Redux store
import axiosInstance from '../../axiosInstance';  // Axios instance for making API requests
import { useSearchParams, useNavigate } from 'react-router-dom';  // Hooks for managing URL search params and navigation
import ImageWithLoading from '../ImageWithLoading';  // Component for displaying images with loading states
import { Link } from 'react-router-dom';  // Link component for navigation

const BookSearch = () => {
	const dispatch = useDispatch();  // Hook to dispatch actions
	const navigate = useNavigate();  // Hook to programmatically navigate between routes
	const [searchParams, setSearchParams] = useSearchParams();  // Manage search parameters in the URL
	const [searchResults, setSearchResults] = useState([]);  // State to store search results
	const [loading, setLoading] = useState(false);  // State to track loading status
	const [error, setError] = useState(null);  // State to track errors
	const [searchTerm, setSearchTerm] = useState('');  // State to track the search term input

	const status = useSelector((state) => state.books.status);  // Get the loading status of books
	const books = useSelector((state) => state.books.books);  // Get the list of books from the Redux store

	// Set searchTerm from URL search params on page load
	useEffect(() => {
		const search = searchParams.get('search');
		if (search) {
			setSearchTerm(search);  // Initialize searchTerm from the URL parameter
		}
	}, [searchParams]);

	// Debounced search effect for better performance
	useEffect(() => {
		if (searchTerm !== '') {
			const handler = setTimeout(() => {
				setLoading(true);  // Set loading state to true when search starts
				setError(null);  // Reset error state

				// Filter local books based on the search term
				const local_results = books
					.filter((book) => book.title.toLowerCase().includes(searchTerm.toLowerCase()))
					.map((b) => {
						return { type: 'local', book: b };  // Mark the results as local
					});

				setSearchResults(local_results);  // Set local search results

				// Fetch remote search results from the server
				axiosInstance
					.get(`/books/search/`, { params: { title: searchTerm } })
					.then((response) => {
						// Filter out local results to avoid duplication
						const remote_results = response.data
							.filter(remoteBook => !local_results.some(localResult => localResult.book.isbn === remoteBook.isbn))
							.map((book) => {
								return { type: 'remote', book: book };  // Mark the results as remote
							});
						setSearchResults(local_results.concat(remote_results));  // Combine local and remote results
						setLoading(false);  // Stop loading after search completes
					})
					.catch((err) => {
						setError('An error occurred while fetching the search results.');  // Handle errors
						setLoading(false);  // Stop loading in case of an error
					});
			}, 500);  // 500ms debounce delay to reduce frequent API calls

			return () => {
				clearTimeout(handler);  // Cleanup the timeout if searchTerm changes before completion
			};
		} else {
			setSearchResults([]);  // Clear results if searchTerm is empty
		}
	}, [searchTerm, books]);

	// Handle changes to the search input
	const handleSearch = (e) => {
		const newQuery = e.target.value;
		setSearchTerm(newQuery);  // Update the search term
		setSearchParams({ search: newQuery });  // Update the URL with the new search query
	};

	// Handle navigation to /books/new with book data as state
	const handleExternalBookClick = (book) => {
		navigate('/books/new', { state: { bookPrototype: book } });  // Navigate to the new book creation page with the selected book data
	};

	return (
		<>
			{/* Search input field */}
			<div className="field large prefix round fill">
				<i className="front">search</i>
				<input
					type="text"
					placeholder="Search by title"
					value={searchTerm || ''}  // Bind the input value to the searchTerm state
					onChange={handleSearch}  // Update searchTerm on input change
				/>
			</div>

			{/* Display loading progress */}
			{loading && <progress></progress>}

			{/* Display error message if search fails */}
			{error && <p className='error'>{error}</p>}

			{/* Display search results */}
			<div className='grid'>
				{searchResults.map((book, index) => (
					<div key={book.book?.isbn} className='s12 m6 l4'>
						<article className='no-padding'>
							{/* Display book image with loading state */}
							<ImageWithLoading src={book.book?.image} alt={book.book?.title} />
							<div className='padding'>
								<h5>{book.book?.title}</h5>
								<p>{book.book?.author}</p>
								<p>{book.book?.isbn}</p>
							</div>
							<div className='padding'>
								{/* Conditionally render button/link based on the source of the book (local/remote) */}
								{book.type === 'local' ? (
									<Link to={`/books/${book.book.id}`} className='responsive'>
										<button className='responsive'>
											<i>link</i>
											<span>Go to book</span>
										</button>
									</Link>
								) : (
									<button onClick={() => handleExternalBookClick(book.book)} className='responsive'>
										<i>add</i>
										<span>Add to Library</span>
									</button>
								)}
							</div>
						</article>
					</div>
				))}
			</div>
		</>
	);
};

export default BookSearch;  // Export the BookSearch component as the default export
