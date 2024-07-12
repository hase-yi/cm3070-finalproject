import { Link } from 'react-router-dom';
import classes from './BookList.module.css';
import {useDispatch, useSelector} from 'react-redux'
import { useEffect } from 'react';
import { fetchBooksForShelf } from '../../features/bookSlice';

const BookList = ({ shelfId }) => {

const dispatch = useDispatch();

useEffect(()=>{
	if(shelfId){
		dispatch(fetchBooksForShelf(shelfId));
	}
},[dispatch, shelfId])

const books = useSelector((state)=>state.books.books);
const status = useSelector((state)=>state.books.status);
const error = useSelector((state)=>state.books.error);

if(status === 'loading'){
	return <div>Loading...</div>;
}
if(status === 'failed'){
	return <div>Error...{error}</div>;
}
if(!books){
	return <div>Books not found</div>;
}


	return (
		<div className={classes.books}>
			<ul className={classes.list}>
				{books.map((book) => (
					<li key={book.id} className={classes.item}>
						<Link to={`/books/${book.id}`}>
							<img src={book.image} alt={book.title} />
							<div className={classes.content}>
								<h2>{book.title}</h2>
							</div>
						</Link>
					</li>
				))}
			</ul>
		</div>
	);
};

export default BookList;
