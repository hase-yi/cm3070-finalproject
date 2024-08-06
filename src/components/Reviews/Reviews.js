import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Input from '../Input';
import FormButtons from '../FormButtons';
import classes from './Reviews.module.css';
import { createReview, deleteReview, updateReview } from '../../features/bookSlice';

const Reviews = () => {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isEditing, setIsEditing] = useState(false);

	const { bookId } = useParams();
	const dispatch = useDispatch();

	const numericBookId = Number(bookId);

	const book = useSelector((state) =>
		state.books.books.find((book) => book.id === numericBookId)
	);

	const user = useSelector((state) => state.auth.user);


	const status = useSelector((state) => state.books.status);
	const error = useSelector((state) => state.books.error);

	const [formData, setFormData] = useState({
		review: {
			text: book?.review?.text || '',
			shared: book?.review?.shared || false,
		},
	});

	const handleSubmit = async (event) => {
		event.preventDefault();
		setIsSubmitting(true);
		const reviewData = {
			book: bookId,
			text: formData.review.text,
			shared: formData.review.shared,
		};

		try {
			const bookData = {
				review: { ...reviewData },
			};

			// console.log('bookData :', bookData);
			if (!book?.review) {
				dispatch(createReview(bookData)).unwrap();
			} else {
				bookData.review.id = book.review.id;
				dispatch(updateReview(bookData)).unwrap();
			}
		} catch (err) {
			console.error('Fail to save book', err);
		}

		setIsSubmitting(false);
		setIsEditing(false);
	};

	const handleEdit = (e) => {
		setIsEditing(!isEditing);
	};

	const handleReviewChange = (e) => {
		const { name, value } = e.target;
		setFormData((prevData) => ({
			...prevData,
			review: {
				...prevData.review,
				[name]: value,
			},
		}));
	};

	const handleDelete = async (event) => {
		const proceed = window.confirm('Are you sure?');
		if (!proceed) {
			return
		}

		setIsSubmitting(true);
	
		// Validate that book.id exists and is a number
		if (!book || typeof book.id !== 'number' || !Number.isInteger(book.id)) {
			console.error('Book ID is either missing or not a valid number');
			setIsSubmitting(false);
			return; // Exit the function early if book.id is invalid
		}
	
		const reviewData = {
			book: book.id,
		};
		
		console.log(reviewData)

		try {
			const bookData = {
				review:{
					...reviewData
				}
			};
	
			// Ensure that comment.id exists and is set correctly
			if (book.review && book.review.id) {
				bookData.review.id = book.review.id;
			} else {
				console.error('Review ID is missing');
				throw new Error('Review ID is missing');
			}
	
			// Await the dispatch to ensure completion
			await dispatch(deleteReview(bookData)).unwrap();
	
		} catch (err) {
			console.error('Failed to save book:', err);
		} finally {
			// Reset the states regardless of success or failure
			setIsSubmitting(false);
			setIsEditing(false);
		}
	}

	if (book?.review) {
		return (
			<div>
				<p>{formData.review.text}</p>
				{user === book.user &&
					<button onClick={handleEdit}>Edit</button>}
			</div>
		);
	}

	if (isEditing) {
		return (
			<form className={classes.reviewContainer} onSubmit={handleSubmit}>
				<div>
					<label htmlFor="text">Review</label>
					<textarea
						id="text"
						name="text"
						rows="5"
						value={formData.review.text}
						onChange={handleReviewChange}
						required
					/>
					<Input
						label="Sharing"
						id="shared"
						name="shared"
						type="checkbox"
						checked={formData.review.shared}
						onChange={handleReviewChange}
					/>
				</div>

				<div className={classes.actions}>
					<FormButtons label="Delete" type="button" onClick={handleDelete} />
					<FormButtons
						label="Cancel"
						type="button"
						onClick={handleEdit}
						disabled={isSubmitting}
					/>
					<FormButtons
						type="submit"
						disabled={isSubmitting}
						label={isSubmitting ? 'Submitting' : 'Save'}
					/>
				</div>
			</form>
		);
	}


	
	return (
		<div>
			<button onClick={handleEdit}>Write Review</button>
		</div>
	);
};

export default Reviews;
