import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import classes from './BookSearch.module.css';
// import {fetchShelves} from '../../features/shelfSlice'
import { searchBook } from '../../features/bookSlice';
import Input from '../Input';
import FormButtons from '../FormButtons';
import ShelfSelect from './ShelfSelect';



const BookSearch = () => {
	const [title, setTitle] = useState('');
	const dispatch = useDispatch();
	const { books, loading, error } = useSelector((state) => state.books);


	const handleSearch = () => {
		dispatch(searchBook({ title }));
	};

	return (
		<div className={classes.form}>
			<div className={classes.input}>
				<Input
					type="text"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					placeholder="Search by title"
				/>
			</div>

			<FormButtons
				className={classes.actions}
				label="Search"
				onClick={handleSearch}
				disabled={loading}
			/>

			{loading && <p className={classes.loadingIndictor}>Loading...</p>}
			{error && <p className={classes.feedbackMessage}>Error:{error}</p>}
			<ul className={classes.results}>
				{books.map((book, index) => (
					<li key={index} className={classes.bookItem}>
						<ShelfSelect book={book.book}/>
						{book.book?.image &&  <img src={book.book.image} alt={book.book.title}/>}
						{book.book?.title} by {book.book?.author}				
					</li>
				))}
			</ul>
		</div>
	);
};

export default BookSearch;
