import { useDispatch, useSelector } from 'react-redux';  // Hooks to dispatch actions and access the Redux store
import { Link } from 'react-router-dom';  // Link component for navigation
import { deleteBook } from '../../features/bookSlice';  // Redux action to delete a book
import ImageWithLoading from '../ImageWithLoading';  // Component to display an image with a loading state

const BookList = ({ shelfId, readingListStatus }) => {
	const dispatch = useDispatch();  // Hook to dispatch actions

	// Get the list of books, loading status, and any errors from the Redux store
	const books = useSelector((state) => state.books.books);
	const status = useSelector((state) => state.books.status);
	const error = useSelector((state) => state.books.error);

	// Filter books based on reading_progress.status if the readingListStatus query parameter is provided
	let filteredBooks = books;
	if (readingListStatus) {
		filteredBooks = books.filter(
			(book) =>
				book.reading_progress &&  // Ensure the book has reading progress
				book.reading_progress.status === readingListStatus  // Match the reading progress status
		);
	}

	// Further filter books based on the shelfId if provided
	if (shelfId) {
		filteredBooks = books.filter((book) => book.shelf === Number(shelfId));  // Filter books by shelf ID
	}

	// Show loading state while books are being fetched
	if (status === 'loading') {
		return <div className='row center-align'><progress className="circle"></progress></div>;
	}

	// Show error message if fetching books failed
	if (status === 'failed') {
		return <div>Error...{error}</div>;
	}

	// Show a message if no books were found
	if (!books) {
		return <div>Books not found</div>;
	}

	// Handle the deletion of a book by dispatching the deleteBook action
	const handleDelete = (book) => {
		dispatch(deleteBook(book));  // Dispatch the delete action with the book data
	};

	return (
		<div className='grid'>
			{/* Loop through the filtered books and display each one */}
			{filteredBooks.map((book) => (
				<div key={book.id} className='s12 m6 l3'>
					{/* Link to the book's detail page */}
					<Link to={`/books/${book.id}`}>
						<article className='no-padding'>
							{/* Display the book's image with a loading state */}
							<ImageWithLoading src={book.image} alt={book.title}/>
							<div className='padding'>
								<h5>{book.title}</h5>  {/* Display the book's title */}
								<p>{book.author}</p>  {/* Display the book's author */}
							</div>
						</article>
					</Link>
				</div>
			))}
		</div>
	);
};

export default BookList;  // Export the BookList component as the default export
