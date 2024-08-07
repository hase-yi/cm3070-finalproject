import classes from './ReadingProgress.module.css';
import React from 'react';
import { useSelector } from 'react-redux';

const ReadingProgress = ({ bookId }) => {
	const book = useSelector((state) =>
		state.books.books.find((book) => book.id === Number(bookId))
	);

	const progressPercentage = book?.total_pages
		? (book.reading_progress.current_page / book.total_pages) * 100
		: 0;

	return (
		<div className={classes.progressContainer}>
			<h2>Reading Progress</h2>
			{book?.reading_progress ? (
				<>
					<p>Current Page: {book.reading_progress.current_page}</p>
					<div className={classes.progressBar}>
						<div
							className={classes.progress}
							style={{ width: `${progressPercentage}%` }}
						></div>
					</div>
				</>
			) : (
				<p>No reading progress available</p>
			)}
		</div>
	);
};

export default ReadingProgress;
