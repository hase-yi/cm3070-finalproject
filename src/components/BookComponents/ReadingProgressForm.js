import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';  // Hooks to dispatch actions and access the Redux store
import {
	createReadingProgress,  // Redux action for creating a new reading progress entry
	updateReadingProgress,  // Redux action for updating an existing reading progress entry
} from '../../features/bookSlice';

const ReadingProgressForm = ({ bookId }) => {
	const dispatch = useDispatch();  // Hook to dispatch actions

	// Get the specific book from the Redux store
	const book = useSelector((state) =>
		state.books.books.find((book) => book.id === Number(bookId))
	);

	const user = useSelector((state) => state.auth.user);  // Get the current logged-in user

	// Initialize state for reading progress
	const [readingProgress, setReadingProgress] = useState({
		currentPage: book?.reading_progress?.current_page || 1,  // Set the initial current page or default to 1
		status: book?.reading_progress?.status || 'W',  // Set the initial reading status or default to 'W' (Want to Read)
		shared: book?.reading_progress?.shared || false,  // Set the initial shared status or default to false
	});

	const isReading = readingProgress.status === 'R';  // Determine if the user is currently reading the book

	// Update the reading progress state whenever the book data changes
	useEffect(() => {
		if (book) {
			setReadingProgress({
				currentPage: book.reading_progress?.current_page || 1,
				status: book.reading_progress?.status || 'W',
				shared: book.reading_progress?.shared || false,
			});
		}
	}, [book]);

	// Convert reading status code to a human-readable string
	const readingStatusToString = (s) => {
		switch (s) {
			case "W": return "Want to Read";
			case "R": return "Is Reading";
			case "F": return "Finished Reading";
			case "N": return "Not to Finish";
			default: return "";
		}
	}

	// Handle input changes in the form
	const handleInputChange = (e) => {
		const { name, value, type, checked } = e.target;
		setReadingProgress((prevData) => ({
			...prevData,
			[name]: type === 'checkbox' ? checked : value,  // Update form data based on input type (checkbox/text)
		}));
	};

	// Handle form submission for creating or updating reading progress
	const handleSubmit = async (event) => {
		event.preventDefault();

		// Prepare reading progress data for submission
		const readingProgressData = {
			reading_progress: {
				book: book?.id || bookId,  // Use the book ID or fallback to the passed bookId
				current_page: parseInt(readingProgress.currentPage, 10) || 0,  // Ensure the current page is a valid number
				status: readingProgress.status || 'W',  // Default to 'Want to Read' status if not set
				shared: readingProgress.shared,  // Share status
			},
		};

		try {
			// If reading progress exists, update it; otherwise, create a new one
			if (book.reading_progress?.id) {
				readingProgressData.reading_progress.id = book.reading_progress.id;  // Include the reading progress ID for updates
				await dispatch(updateReadingProgress(readingProgressData)).unwrap();  // Dispatch the update action
			} else {
				await dispatch(createReadingProgress(readingProgressData)).unwrap();  // Dispatch the create action
			}
		} catch (err) {
			console.error('Failed to save reading progress:', err);  // Log any errors during saving
		}
	};

	// If the current user is not the book owner, display their reading progress only
	if (user !== book.user) {
		return (
			<>
				<h6>{book.user}'s Reading Progress</h6>  {/* Show the user's reading progress */}
				<p>{readingStatusToString(readingProgress.status)}</p>  {/* Show the readable reading status */}
				<progress value={`${book.reading_progress.current_page}`} max={`${book.total_pages}`}></progress>  {/* Show progress bar */}
				<p>Page {book.reading_progress.current_page} of {book.total_pages}</p>  {/* Show the current page and total pages */}
			</>
		);
	}

	return (
		<form onSubmit={handleSubmit}>
			<h6>Reading Progress</h6>
			<div className='space'></div>
			
			{/* Checkbox to mark whether the reading progress should be shared */}
			<label className="checkbox">
				<input
					id="shared"
					name="shared"
					type="checkbox"
					checked={readingProgress.shared}  // Bind the checkbox to the shared state
					onChange={handleInputChange}
				/>
				<span>Share this reading progress</span>
			</label>

			{/* Dropdown to select the reading status */}
			<div className="field suffix border responsive">
				<select
					id="status"
					name="status"
					value={readingProgress.status}  // Bind the select field to the reading status
					onChange={handleInputChange}
				>
					<option value="W">Want to Read</option>
					<option value="R">Is Reading</option>
					<option value="F">Finished Reading</option>
					<option value="N">Not to Finish</option>
				</select>
				<i>arrow_drop_down</i>
				<span className="helper">Reading List</span>
			</div>

			{/* Progress bar showing the current page out of total pages */}
			{book?.reading_progress && (
				<progress value={`${book.reading_progress.current_page}`} max={`${book.total_pages}`}></progress>
			)}

			{/* Input field for current page if the user is actively reading */}
			{isReading && (
				<div className="field label border responsive">
					<input
						label="Current Page"
						id="current_page"
						name="currentPage"
						type="number"
						value={readingProgress.currentPage}  // Bind the input field to the current page
						onChange={handleInputChange}
					/>
					<label>Current Page</label>
				</div>
			)}

			{/* Submit button to save reading progress */}
			<div className='row'>
				<div className='max'></div>
				<button type="submit">
					<i>save</i>
					<span>Save</span>
				</button>
			</div>
		</form>
	);
};

export default ReadingProgressForm;  // Export the ReadingProgressForm component as the default export
