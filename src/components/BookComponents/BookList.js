import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { deleteBook } from '../../features/bookSlice';
import ImageWithLoading from '../ImageWithLoading';

const BookList = ({ shelfId, readingListStatus }) => {
	const dispatch = useDispatch();

	const books = useSelector((state) => state.books.books);
	const status = useSelector((state) => state.books.status);
	const error = useSelector((state) => state.books.error);

	// Filter books based on reading_progress.status if the query parameter exists
	let filteredBooks = books;
	if (readingListStatus) {
		filteredBooks = books.filter(
			(book) =>
				book.reading_progress &&
				book.reading_progress.status === readingListStatus
		);
	}

	if (shelfId) {
		filteredBooks = books.filter((book) => book.shelf === Number(shelfId));
	}

	if (status === 'loading') {
		return <div className='row center-align'><progress className="circle"></progress></div>;
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
		<div className='grid' >
			{filteredBooks.map((book) => (
				<div key={book.id} className='s12 m6 l3' >
					<Link to={`/books/${book.id}`}>
						<article className='no-padding'>
							<ImageWithLoading src={book.image} alt={book.title}/>
							<div className='padding' >
								<h5>{book.title}</h5>
								<p>{book.author}</p>
							</div>
						</article>
					</Link>
				</div>
			))}
		</div>

	);
};

export default BookList;
