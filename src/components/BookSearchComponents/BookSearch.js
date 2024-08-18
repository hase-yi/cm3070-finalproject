import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axiosInstance from '../../axiosInstance';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ImageWithLoading from '../ImageWithLoading';
import { Link } from 'react-router-dom';

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

	// Handle navigation to /books/new withbook data as state
	const handleExternalBookClick = (book) => {
		navigate('/books/new', { state: { bookPrototype: book } });
	};

	return (
		<>
			<div class="field large prefix round fill">
				<i class="front">search</i>
				<input
					type="text"
					placeholder="Search by title"
					value={searchTerm || ''}
					onChange={handleSearch}
				/>
							

			</div>

			{loading && <progress></progress>
							}
			{error && <p className='error'>{error}</p>}
			<div className='grid'>
				{searchResults.map((book, index) => (
					<div key={book.book?.isbn} className='s12 m6 l4' >
						<article className='no-padding'>
							<ImageWithLoading src={book.book?.image} alt={book.book?.title} />
							<div className='padding' >
								<h5>{book.book?.title}</h5>
								<p>{book.book?.author}</p>
								<p>{book.book?.isbn}</p>

							</div>
							<div className='padding'>
								{book.type === 'local' ? (

									<Link to={`/books/${book.book.id}`} className='responsive'>
										<button className='responsive'>
											<i>link</i>
											<span>Go to book</span>
										</button>
									</Link>) : (
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

export default BookSearch;
