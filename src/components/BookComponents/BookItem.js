import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { fetchShelf } from '../../features/shelfSlice';
import { deleteBook } from '../../features/bookSlice';
import ImageWithLoading from '../ImageWithLoading'

import ReadingProgressForm from './ReadingProgressForm';

function BookItem() {
	const { bookId } = useParams();
	const dispatch = useDispatch();
						
	const navigate = useNavigate();

	const numericBookId = Number(bookId);

	const book = useSelector((state) =>
		state.books.books.find((book) => book.id === numericBookId)
	);
	const user = useSelector((state) => state.auth.user);

	const status = useSelector((state) => state.books.status);
	const error = useSelector((state) => state.books.error);

	useEffect(() => {
		if (status === 'idle' || !book) {
			dispatch(fetchShelf(numericBookId));
		}
	}, [status, dispatch, numericBookId, book]);

	const startDeleteHandler = () => {
		const proceed = window.confirm('Are you sure?');
		if (proceed) {
			// TODO: Navigate to the shelf page which the books are relative
			navigate(`/shelves/${book.shelf}`, { replace: true });

			dispatch(deleteBook(book)).then((result) => {
				if (result.meta.requestStatus === 'fulfilled') {
					// console.log('Shelf deleted successfully, navigating to /shelves'); // Debug log
				} else {
					// console.error('Failed to delete the shelf:', result.error.message);
				}
			});
		}
	};

	// console.log('BookItem render:', book); // Debug log

	if (status === 'loading') {
		return <progress className="circle"></progress>;
	}
	if (status === 'failed') {
		return <p className='error'>{error}</p>;
	}
	if (!book) {
		return <div>Book not found</div>;
	}

	return (
		<div className='grid'>
			<div className='s12 m6 l5'>
				<article className='no-padding'>
					<ImageWithLoading src={book.image} alt={book.title} height={'large-height'} />
				</article>
			</div>
			<div className='s12 m6 l7'>
				<article>
					<h3>{book.title}</h3>
					<h5>{book.author}</h5>
					<p>Released {book.release_year}, page count {book.total_pages}</p>
					<p>ISBN: {book.isbn}</p>

					{user === book.user && (
						<div className='row'>
							<div className='max'></div>
							<Link to="edit">
								<button>
									<i>edit</i>
									<span>Edit</span>
								</button>
							</Link>
							<button onClick={startDeleteHandler} className='error'>
								<i>delete</i>
								<span>Delete</span>
							</button>
						</div>)}
				</article>
				<article>
					{<ReadingProgressForm bookId={bookId} />}
				</article>
			</div>
		</div>

	);
}

export default BookItem;
