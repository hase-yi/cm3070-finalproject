import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';  // Hooks to dispatch actions and access the Redux store
import { createComment } from '../../features/bookSlice';  // Redux action to create a comment

const CreateCommentSection = ({ bookId }) => {
	const [isSubmitting, setIsSubmitting] = useState(false);  // State to track form submission

	const dispatch = useDispatch();  // Hook to dispatch actions

	const numericBookId = Number(bookId);  // Convert bookId to a number

	// Get the specific book from the Redux store
	const book = useSelector((state) =>
		state.books.books.find((book) => book.id === numericBookId)
	);

	const status = useSelector((state) => state.books.status);  // Get the loading status of books
	const error = useSelector((state) => state.books.error);  // Get any errors related to fetching books

	// Initialize form data for creating a new comment
	const [formData, setFormData] = useState({
		comment: {
			text: book?.review?.comments?.text || '',  // Set initial value for comment text
		},
	});

	// Handle form submission for creating a new comment
	const handleSubmit = async (event) => {
		event.preventDefault();

		setIsSubmitting(true);

		// Validate that the book ID exists and is a number
		if (!book || typeof book.id !== 'number' || !Number.isInteger(book.id)) {
			console.error('Book ID is either missing or not a valid number');
			setIsSubmitting(false);
			return;  // Exit the function early if book ID is invalid
		}

		const commentData = {
			review: book.review.id,  // Associate the comment with the review ID
			book: book.id,  // Associate the comment with the book ID
			text: formData.comment.text,  // Get the comment text from the form
		};

		try {
			const bookData = {
				review: {
					comment: { ...commentData },  // Include the comment data
				},
			};

			// Dispatch the createComment action and wait for its completion
			await dispatch(createComment(bookData)).unwrap();

			// Clear the form after submission
			setFormData({
				comment: {
					text: '',  // Reset the comment text to an empty string
				},
			});
		} catch (err) {
			console.error('Failed to save comment:', err);
		} finally {
			// Reset the submission state
			setIsSubmitting(false);
		}
	};

	// Handle changes to the comment textarea input
	const handleCommentChange = (e) => {
		const { name, value } = e.target;
		setFormData((prevData) => ({
			...prevData,
			comment: {
				...prevData.comment,
				[name]: value,  // Update the comment text in the form data
			},
		}));
	};

	return (
		<article className="round">
			<form onSubmit={handleSubmit}>
				<div className='row'>
					<div className='max field textarea border'>
						{/* Comment textarea input */}
						<textarea
							id="text"
							name="text"
							rows="5"
							value={formData.comment.text}  // Bind the textarea to the comment text state
							placeholder="Write your comment here..."
							onChange={handleCommentChange}
							required
						></textarea>
					</div>
					<div>
						{/* Button to submit the comment form */}
						<button
							type="submit"
							disabled={isSubmitting}  // Disable the button while the form is submitting
						>
							<i>add</i>
							<span>{isSubmitting ? 'Submitting' : 'Add Comment'}</span>
						</button>
					</div>
				</div>
			</form>
		</article>
	);
};

export default CreateCommentSection;  // Export the CreateCommentSection component as the default export
