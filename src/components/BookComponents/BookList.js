import { Link } from 'react-router-dom';
import classes from './BookList.module.css';


const BookList = ({ books }) => {
	return (
		<div className={classes.shelves}>
			<h1>All books</h1>
			<ul className={classes.list}>
				{books.map((book) => (
					<li key={book.id} className={classes.item}>
						<Link to={`${book.id}`}>
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
