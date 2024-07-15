import {useState} from 'react'
import { useDispatch, useSelector } from 'react-redux';
import classes from './BookSearch.module.css';
import { searchBook } from '../../features/bookSlice';

const BookSearch = () => {
	const [title, setTitle] = useState('');
	const [isbn, setIsbn] = useState('');
	const dispatch = useDispatch();
	const { books, loading, error } = useSelector((state) => state.books);

	const handleSearch = () => {
		dispatch(searchBook({ title, isbn }));
	};

	return (
		<div className={classes.bookSearch}>
			<input
				type="text"
				value={title}
				onChange={(e) => setTitle(e.target.value)}
				placeholder="Search by title"
        className={classes.input}
			/>
			<input
				type="text"
				value={isbn}
				onChange={(e) => setIsbn(e.target.value)}
				placeholder="Search by ISBN"
        className={classes.input}
			/>
			<button onClick={handleSearch} disabled={loading} className={classes.button}>
				Search
			</button>

			{loading && <p className={classes.loadingIndictor}>Loading...</p>}
			{error && <p className={classes.feedbackMessage}>Error:{error}</p>}
			<ul className={classes.results}>
				{books.map((book, index) => (
					<li key={index} className={classes.bookItem}>
            <img src={book.book.image} alt={book.book.title}/>
						{book.type === 'local' ? 'Local: ' : 'External: '}
						{book.book.title} by {book.book.author}
					</li>
				))}
			</ul>
		</div>
	);
};

export default BookSearch;
