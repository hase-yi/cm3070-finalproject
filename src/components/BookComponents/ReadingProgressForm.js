import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
	createReadingProgress,
	updateReadingProgress,
} from '../../features/bookSlice';
import Input from '../Input';
import FormButtons from '../FormButtons';

const ReadingProgressForm = ({ bookId }) => {
	const dispatch = useDispatch();

	const book = useSelector((state) =>
		state.books.books.find((book) => book.id === Number(bookId))
	);

	const user = useSelector((state) => state.auth.user);


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

	const readingStatusToString = (s) => {
		switch (s) {
			case "W": return "Want to Read";
			case "R": return "Is Reading";
			case "F": return "Finished Reading";
			case "N": return "Not to Finish"
		}
	}

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

	if (user !== book.user) {
		return (
			<>
				<h6>{book.user}'s Reading Progress</h6>
				<p>{readingStatusToString(readingProgress.status)}</p>
				<progress value={`${book.reading_progress.current_page}`} max={`${book.total_pages}`}></progress>
				<p>Page {book.reading_progress.current_page} of {book.total_pages}</p>

			</>
		)
	}

	return (
		<form onSubmit={handleSubmit}>
			<h6>Reading Progress</h6>
			<div className='space'></div>
			<label class="checkbox">
				<input
					id="shared"
					name="shared"
					type="checkbox"
					checked={readingProgress.shared}
					onChange={handleInputChange}
				/>
				<span>Share this reading progress</span>
			</label>

			<div class="field suffix border responsive">
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
				<i>arrow_drop_down</i>
				<span class="helper">Reading List</span>
			</div>

			<progress value={`${book.reading_progress.current_page}`} max={`${book.total_pages}`}></progress>


			{isReading && (
				<div class="field label border responsive">
					<input
						label="Current Page"
						id="current_page"
						name="currentPage"
						type="number"
						value={readingProgress.currentPage}
						onChange={handleInputChange}
					/>
					<label>Number</label>
				</div>

			)}


			<div className='row'>
				<div className='max'>
				</div>
				<button type="submit" >
					<i>save</i>
					<span>Save</span>
				</button>
			</div>
		</form>
	);
};

export default ReadingProgressForm;
