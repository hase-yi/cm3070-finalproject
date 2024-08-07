import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
	createReadingProgress,
	updateReadingProgress,
} from '../../features/bookSlice';
import Input from '../Input';
import FormButtons from '../FormButtons';
import classes from './ReadingStatusForm.module.css';

const ReadingStatusForm = ({ bookId }) => {
	const dispatch = useDispatch();

	const book = useSelector((state) =>
		state.books.books.find((book) => book.id === Number(bookId))
	);

	const [readingProgress, setReadingProgress] = useState({
		currentPage: book?.reading_progress?.current_page || 1,
		status: book?.reading_progress?.status || 'W',
		shared: book?.reading_progress?.shared || false,
	});

	const isReading = readingProgress.status === 'R';

	useEffect(() => {
		if (book) {
			setReadingProgress({
				currentPage: book.reading_progress?.current_page || 1,
				status: book.reading_progress?.status || 'W',
				shared: book.reading_progress?.shared || false,
			});
		}
	}, [book]);

	const handleInputChange = (e) => {
		const { name, value, type, checked } = e.target;
		setReadingProgress((prevData) => ({
			...prevData,
			[name]: type === 'checkbox' ? checked : value,
		}));
	};

	const handleSubmit = async (event) => {
		event.preventDefault();

		const readingProgressData = {
			reading_progress: {
				book: book?.id || bookId,
				current_page: parseInt(readingProgress.currentPage, 10) || 0,
				status: readingProgress.status || 'W',
				shared: readingProgress.shared,
			},
		};

		console.log('book again', book);
		console.log('form', readingProgressData);

		try {
			if (book.reading_progress?.id) {
				readingProgressData.reading_progress.id = book.reading_progress.id;
				await dispatch(updateReadingProgress(readingProgressData)).unwrap();
			} else {
				await dispatch(createReadingProgress(readingProgressData)).unwrap();
			}
		} catch (err) {
			console.error('Failed to save reading progress:', err);
		}
	};

	return (
		<form className={classes.form} onSubmit={handleSubmit}>
			<Input
				label="Sharing"
				id="shared"
				name="shared"
				type="checkbox"
				checked={readingProgress.shared}
				onChange={handleInputChange}
			/>

			<label htmlFor="status">Reading Status:</label>
			<select
				id="status"
				name="status"
				value={readingProgress.status}
				onChange={handleInputChange}
			>
				<option value="W">Want to Read</option>
				<option value="R">Is Reading</option>
				<option value="F">Finished Reading</option>
				<option value="N">Not to Finish</option>
			</select>

			{isReading && (
				<Input
					label="Current Page"
					id="current_page"
					name="currentPage"
					type="number"
					value={readingProgress.currentPage}
					onChange={handleInputChange}
				/>
			)}

			<FormButtons type="submit" label="Save" />
		</form>
	);
};

export default ReadingStatusForm;
