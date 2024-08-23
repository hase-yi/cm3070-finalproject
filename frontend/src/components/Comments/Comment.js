import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';  // Hooks to dispatch actions and access the Redux store
import { deleteComment, updateComment } from '../../features/bookSlice';  // Redux actions for updating and deleting comments
import { formatDate } from '../../utils/misc';  // Utility function to format dates

const Comment = ({ bookId, commentId }) => {
	const [isSubmitting, setIsSubmitting] = useState(false);  // State to track form submission
	const [isEditing, setIsEditing] = useState(false);  // State to track whether the comment is in editing mode

	const dispatch = useDispatch();  // Hook to dispatch actions

	const numericBookId = Number(bookId);  // Convert bookId to a number

	const user = useSelector((state) => state.auth.user);  // Get the current logged-in user

	// Get the specific book and comment from the Redux store
	const book = useSelector((state) =>
		state.books.books.find((book) => book.id === numericBookId)
	);

	const comment = useSelector((state) => {
		const book = state.books.books.find((book) => book.id === numericBookId);
		return book?.review?.comments?.find((comment) => comment.id === commentId);  // Get the comment based on commentId
	});

	const status = useSelector((state) => state.books.status);  // Get the loading status of books
	const error = useSelector((state) => state.books.error);  // Get any errors related to fetching books

	// Initialize form data for editing the comment
	const [formData, setFormData] = useState({
		comment: {
			text: comment.text || '',  // Set the initial value for comment text
		},
	});

	// Handle form submission for updating a comment
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
			text: formData.comment.text,  // Get the updated comment text
		};

		try {
			const bookData = {
				review: {
					comment: { ...commentData },  // Include the updated comment data
				},
			};

			// Ensure that comment ID exists before proceeding
			if (comment && comment.id) {
				bookData.review.comment.id = comment.id;
			} else {
				console.error('Comment ID is missing');
				throw new Error('Comment ID is missing');
			}

			// Dispatch the updateComment action
			await dispatch(updateComment(bookData)).unwrap();

		} catch (err) {
			console.error('Failed to save book:', err);
		} finally {
			// Reset the states regardless of success or failure
			setIsSubmitting(false);
			setIsEditing(false);
		}
	};

	// Handle changes to the comment text field
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

	// Toggle between editing and viewing modes
	const handleEdit = () => {
		setIsEditing(!isEditing);
	};

	// Handle the deletion of a comment
	const handleDelete = async (event) => {
		event.preventDefault();

		const proceed = window.confirm('Are you sure?');  // Confirm with the user before deletion
		if (!proceed) {
			return;
		}

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
		};

		try {
			const bookData = {
				review: {
					comment: { ...commentData },  // Include the comment data for deletion
				},
			};

			// Ensure that comment ID exists before proceeding
			if (comment && comment.id) {
				bookData.review.comment.id = comment.id;
			} else {
				console.error('Comment ID is missing');
				throw new Error('Comment ID is missing');
			}

			// Dispatch the deleteComment action
			await dispatch(deleteComment(bookData)).unwrap();

		} catch (err) {
			console.error('Failed to delete comment:', err);
		} finally {
			// Reset the states regardless of success or failure
			setIsSubmitting(false);
			setIsEditing(false);
		}
	};

	// Render the edit form if the user is in editing mode
	if (isEditing) {
		return (
			<article className="round">
				<form onSubmit={handleSubmit}>
					<div className='row'>
						<div className='max field textarea border'>
							<textarea
								id="text"
								name="text"
								rows="5"
								value={formData.comment.text}  // Bind the textarea to the comment text state
								onChange={handleCommentChange}
								required
							></textarea>
						</div>
						{/* Show save and cancel buttons if the user is the author of the comment */}
						{user === comment.user && (
							<div >
								<button
									type="submit"
									disabled={isSubmitting}
								>
									<i>save</i>
									<span>{isSubmitting ? 'Submitting' : 'Save'}</span>
								</button>
								<button
									onClick={handleEdit}
								>
									<i>undo</i>
									<span>Cancel</span>
								</button>
							</div>
						)}
					</div>
				</form>
			</article>
		);
	}

	// Render the comment in view mode if not editing
	return (
		<article className="round">
			<div className='row'>
				<div className='max'>
					<p>{formatDate(comment.date)} by <a href={`/profiles/${comment.user}`}>{comment.user}</a></p>
					<p>{comment.text}</p>  {/* Display the comment text */}
				</div>
				{/* Show edit and delete buttons if the user is the author of the comment */}
				{user === comment.user && (
					<div >
						<button
							onClick={handleEdit}>
							<i>edit</i>
							<span>Edit</span>
						</button>
						<button
							onClick={handleDelete}
							className='error'
						>
							<i>delete</i>
							<span>Delete</span>
						</button>
					</div>
				)}
			</div>
		</article>
	);
};

export default Comment;  // Export the Comment component as the default export
