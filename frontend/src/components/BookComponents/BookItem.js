import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';  // Hooks to dispatch actions and access the Redux store
import { useNavigate, useParams, Link } from 'react-router-dom';  // Hooks for navigation and managing URL parameters
import { deleteBook } from '../../features/bookSlice';  // Redux action to delete a book
import ImageWithLoading from '../ImageWithLoading';  // Component to display an image with a loading state

import ReadingProgressForm from './ReadingProgressForm';  // Form to manage reading progress for the book

function BookItem() {
	const { bookId } = useParams();  // Get the bookId from the URL
	const dispatch = useDispatch();  // Hook to dispatch actions
	const navigate = useNavigate();  // Hook to programmatically navigate between routes

	const numericBookId = Number(bookId);  // Convert the bookId from a string to a number

	// Get the specific book from the Redux store
	const book = useSelector((state) =>
		state.books.books.find((book) => book.id === numericBookId)
	);
	const user = useSelector((state) => state.auth.user);  // Get the current logged-in user

	const status = useSelector((state) => state.books.status);  // Get the loading status of books
	const error = useSelector((state) => state.books.error);  // Get any errors related to fetching books

	// Handle the deletion of a book
	const startDeleteHandler = () => {
		const proceed = window.confirm('Are you sure?');  // Ask for confirmation before deletion
		if (proceed) {
			// After deletion, navigate to the shelf page where the book was located
			navigate(`/shelves/${book.shelf}`, { replace: true });

			// Dispatch the deleteBook action
			dispatch(deleteBook(book)).then((result) => {
				if (result.meta.requestStatus === 'fulfilled') {
					// console.log('Book deleted successfully, navigating to shelf');  // Debug log (optional)
				} else {
					// console.error('Failed to delete the book:', result.error.message);  // Error log (optional)
				}
			});
		}
	};

	// Show loading indicator while fetching book data
	if (status === 'loading') {
		return <progress className="circle"></progress>;
	}

	// Show error message if fetching book data fails
	if (status === 'failed') {
		return <p className='error'>{error}</p>;
	}

	// Show a message if the book was not found
	if (!book) {
		return <div>Book not found</div>;
	}

	// Display the book information and actions
	return (
		<div className='grid'>
			{/* Left side: Book image */}
			<div className='s12 m6 l5'>
				<article className='no-padding'>
					<ImageWithLoading src={book.image} alt={book.title} height={'large-height'} />  {/* Book cover image */}
				</article>
			</div>
			
			{/* Right side: Book details and actions */}
			<div className='s12 m6 l7'>
				<article className='fill'>
					<h3>{book.title}</h3>  {/* Book title */}
					<h5>{book.author}</h5>  {/* Book author */}
					<p>Released {book.release_year}, page count {book.total_pages}</p>  {/* Book release year and page count */}
					<p>ISBN: {book.isbn}</p>  {/* Book ISBN */}

					{/* Show edit and delete buttons only if the current user is the owner of the book */}
					{user === book.user && (
						<div className='row'>
							<div className='max'></div>
							{/* Link to edit the book */}
							<Link to="edit">
								<button>
									<i>edit</i>
									<span>Edit</span>
								</button>
							</Link>

							{/* Button to delete the book */}
							<button onClick={startDeleteHandler} className='error'>
								<i>delete</i>
								<span>Delete</span>
							</button>
						</div>
					)}
				</article>

				{/* Reading Progress Form */}
				<article className='fill'>
					{<ReadingProgressForm bookId={bookId} />}  {/* Component to manage reading progress */}
				</article>
			</div>
		</div>
	);
}

export default BookItem;  // Export the BookItem component as the default export
