import { Link } from 'react-router-dom';
import classes from './BookList.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { fetchBooksForShelf,deleteBook } from '../../features/bookSlice';

const BookList = ({ shelfId, readingListStatus }) => {
	const dispatch = useDispatch();

	// TODO: Introduce global hot loading
	useEffect(() => {
		if (shelfId) {
			dispatch(fetchBooksForShelf(shelfId));
		}
	}, [dispatch, shelfId]);

	const books = useSelector((state) => state.books.books);
	const status = useSelector((state) => state.books.status);
	const error = useSelector((state) => state.books.error);

	// Filter books based on reading_progress.status if the query parameter exists
	let filteredBooks = books
	if (readingListStatus) {
		filteredBooks =  books.filter(
						(book) =>
								book.reading_progress &&
								book.reading_progress.status === readingListStatus
				)
	}

	if (shelfId) {
		filteredBooks =  books.filter(
						(book) =>
								book.shelf === shelfId
				)
	}
		

	if (status === 'loading') {
		return <div>Loading...</div>;
	}
	if (status === 'failed') {
		return <div>Error...{error}</div>;
	}
	if (!books) {
		return <div>Books not found</div>;
	}

	const handleDelete = (book) => {
		dispatch(deleteBook(book));
	};

	return (
		<div className={classes.books}>
			<ul className={classes.list}>
				{filteredBooks.map((book) => (
					<li key={book.id} className={classes.item}>
						<Link to={`/books/${book.id}`}>
							<img src={book.image} alt={book.title} />
							<div className={classes.content}>
								<h2>{book.title}</h2>
							</div>
						</Link>
						<div className={classes.actions}>
							<Link to={`/books/${book.id}/edit`} ><button>Edit</button></Link>
							<button onClick={() => handleDelete(book)}>Delete</button>
						</div>
					</li>
				))}
			</ul>
		</div>
	);
};

export default BookList;
