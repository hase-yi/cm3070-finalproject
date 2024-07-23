import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { fetchShelf } from '../../features/shelfSlice';
import { deleteBook } from '../../features/bookSlice';

import classes from './BookItem.module.css'; // Assuming you have CSS modules

import ReadingProgress from './ReadingProgress';
import ShelfSelect from '../BookSearchComponents/ShelfSelect';

function BookItem() {
	const { bookId } = useParams();
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const numericBookId = parseInt(bookId, 10); //Ensure bookId is a number

	const book = useSelector((state) =>
		state.books.books.find((book) => book.id === numericBookId)
	);

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

			dispatch(deleteBook(numericBookId)).then((result) => {
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
		return <div>Loading...</div>;
	}
	if (status === 'failed') {
		return <div>Error...{error}</div>;
	}
	if (!book) {
		return <div>Book not found</div>;
	}

	return (
		<article className={classes.book}>
			<section className={classes.bookDetails}>
			<div className={classes.imageAndProgress}>
          <img src={book.image} alt={book.title} />
          <div className={classes.readingProgress}>
            <ReadingProgress bookId={numericBookId}/>
          </div>
        </div>
				<div className={classes.bookInfo}>
					<h1>Title:{book.title}</h1>
					<h2>Author:{book.author}</h2>
					<h1>Total page number:{book.total_pages}</h1>
					<h1>Release Year: {book.release_year}</h1>
					<h1>ISBN: {book.isbn}</h1>
					<div className={classes.actions}>
						<Link to="edit">Edit</Link>
						<button onClick={startDeleteHandler}>Delete</button>
					</div>
					<ShelfSelect book={book} />
				</div>
			</section>
			<section className={classes.readingProgress}>

			</section>
		</article>
	);
}

export default BookItem;
