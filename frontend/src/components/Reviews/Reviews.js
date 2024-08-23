import { useParams } from 'react-router-dom';  // Hook to access route parameters
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';  // Hooks to dispatch actions and access the Redux store
import { createReview, deleteReview, updateReview } from '../../features/bookSlice';  // Redux actions for managing reviews
import { formatDate } from '../../utils/misc';  // Utility function to format dates

const Reviews = () => {
	const [isSubmitting, setIsSubmitting] = useState(false);  // State to track form submission status
	const [isEditing, setIsEditing] = useState(false);  // State to track whether the user is editing the review

	const { bookId } = useParams();  // Get the bookId from the URL parameters
	const dispatch = useDispatch();  // Hook to dispatch actions

	const numericBookId = Number(bookId);  // Convert bookId to a number

	// Get the book and its review from the Redux store
	const book = useSelector((state) =>
		state.books.books.find((book) => book.id === numericBookId)
	);

	const user = useSelector((state) => state.auth.user);  // Get the current logged-in user

	// Initialize form data with the review's existing data (if available) or default values
	const [formData, setFormData] = useState({
		review: {
			text: book?.review?.text || '',
			shared: book?.review?.shared || false,
		},
	});

	// Handle form submission for creating or updating a review
	const handleSubmit = async (event) => {
		event.preventDefault();
		setIsSubmitting(true);

		const reviewData = {
			book: bookId,
			text: formData.review.text,
			shared: formData.review.shared,
		};

		try {
			const bookData = { review: { ...reviewData } };

			if (!book?.review) {
				// Create a new review if it doesn't exist
				await dispatch(createReview(bookData)).unwrap();
			} else {
				// Update the existing review
				bookData.review.id = book.review.id;
				await dispatch(updateReview(bookData)).unwrap();
			}
		} catch (err) {
			console.error('Failed to save book', err);
		} finally {
			setIsSubmitting(false);
			setIsEditing(false);  // Exit edit mode after saving
		}
	};

	// Toggle between editing and non-editing modes
	const handleEdit = () => {
		if (isEditing) {
			// If canceling editing, reset the form data to the current review's values
			setFormData({
				review: {
					text: book?.review?.text || '',
					shared: book?.review?.shared || false,
				},
			});
		}
		setIsEditing(!isEditing);  // Toggle the editing state
	};

	// Handle changes to the form input fields
	const handleReviewChange = (e) => {
		const { name, value, type, checked } = e.target;

		setFormData((prevData) => ({
			...prevData,
			review: {
				...prevData.review,
				[name]: type === 'checkbox' ? checked : value,  // Handle checkbox and text input types
			},
		}));
	};

	// Handle review deletion
	const handleDelete = async () => {
		const proceed = window.confirm('Are you sure?');  // Confirm deletion with the user
		if (!proceed) return;

		setIsSubmitting(true);

		try {
			if (book?.review?.id) {
				// Delete the review
				await dispatch(deleteReview({ book: book.id, review: { id: book.review.id } })).unwrap();
			} else {
				throw new Error('Review ID is missing');  // Handle missing review ID
			}
		} catch (err) {
			console.error('Failed to delete review:', err);
		} finally {
			setIsSubmitting(false);
			setIsEditing(false);  // Exit edit mode after deletion
		}
	};

	// Render the review form if the user is editing
	if (isEditing) {
		return (
			<form onSubmit={handleSubmit}>
				<label className="checkbox">
					<input
						id="shared"
						name="shared"
						type="checkbox"
						checked={formData.review.shared}  // Bind the checkbox to the shared state
						onChange={handleReviewChange}
					/>
					<span>Share this review</span>
				</label>
				<div className='row'>
					<div className='field textarea border max'>
						<textarea
							id="text"
							name="text"
							rows="5"
							value={formData.review.text}  // Bind the textarea to the review text state
							onChange={handleReviewChange}
							required
						></textarea>
					</div>

					<div>
						{/* Button to cancel editing */}
						<button
							onClick={handleEdit}
							disabled={isSubmitting}
						>
							<i>undo</i>
							<span>Cancel</span>
						</button>
						{/* Button to save the review */}
						<button
							type="submit"
							disabled={isSubmitting}
						>
							<i>save</i>
							<span>{isSubmitting ? 'Submitting' : 'Save'}</span>
						</button>
					</div>
				</div>
			</form>
		);
	}

	// Render the review if it exists
	if (book?.review) {
		return (
			<div>
				<div className='row'>
					<div className='max'>
						<blockquote>
							<p className="italic">{formatDate(book.review.date)}</p>  {/* Display the review date */}
							{formData.review.text}  {/* Display the review text */}
						</blockquote>
					</div>
					{/* Show edit and delete buttons only for the review author */}
					{user === book?.user && (
						<div>
							{/* Button to edit the review */}
							<button onClick={handleEdit}>
								<i>edit</i>
								<span>Edit Review</span>
							</button>

							{/* Button to delete the review */}
							<button
								className='error'
								onClick={handleDelete}
							>
								<i>delete</i>
								<span>Delete</span>
							</button>
						</div>
					)}
				</div>
			</div>
		);
	}

	// Render a button to allow the user to write a new review if no review exists
	return (
		<div className='row center-align'>
			{user === book?.user &&
				<button onClick={handleEdit}>
					<i>edit</i>
					<span>Write Review</span>
				</button>}
		</div>
	);
};

export default Reviews;
