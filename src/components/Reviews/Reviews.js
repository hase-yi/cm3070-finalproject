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
			const bookData = { review: { ...reviewData } };

			if (!book?.review) {
				await dispatch(createReview(bookData)).unwrap();
			} else {
				bookData.review.id = book.review.id;
				await dispatch(updateReview(bookData)).unwrap();
			}
		} catch (err) {
			console.error('Failed to save book', err);
		} finally {
			setIsSubmitting(false);
			setIsEditing(false);
		}
	};

	const handleEdit = () => {
		if (isEditing) {
			setFormData({
				review: {
					text: book?.review?.text || '',
					shared: book?.review?.shared || false,
				},
			});
		}
		setIsEditing(!isEditing);
	};

	const handleReviewChange = (e) => {
		const { name, value, type, checked } = e.target;

		setFormData((prevData) => ({
			...prevData,
			review: {
				...prevData.review,
				[name]: type === 'checkbox' ? checked : value,
			},
		}));
	};

	const handleDelete = async () => {
		const proceed = window.confirm('Are you sure?');
		if (!proceed) return;

		setIsSubmitting(true);

		try {
			if (book?.review?.id) {
				await dispatch(deleteReview({ book: book.id, review: { id: book.review.id } })).unwrap();
			} else {
				throw new Error('Review ID is missing');
			}
		} catch (err) {
			console.error('Failed to delete review:', err);
		} finally {
			setIsSubmitting(false);
			setIsEditing(false);
		}
	};

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

	if (book?.review) {
		return (
			<div>
				<p>{formData.review.text}</p>
				{user === book?.user && (
					<button onClick={handleEdit}>Edit</button>
				)}
			</div>
		);
	}

	return (
		<div>
			{user === book?.user && <button onClick={handleEdit}>Write Review</button>}
		</div>
	);
};

export default Reviews;
