import { useNavigate, useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Input from '../Input';
import FormButtons from '../FormButtons';
import classes from './Reviews.module.css';
import { createReview, updateReview } from '../../features/bookSlice';

const Reviews = () => {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isEditing, setIsEditing] = useState(false);

	const { bookId } = useParams();
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const numericBookId = Number(bookId);

	const book = useSelector((state) =>
		state.books.books.find((book) => book.id === numericBookId)
	);

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

			console.log('bookData :', bookData);
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
		)
  }

	return (
			<>
				<p>{formData.review.text}</p>
				<button onClick={handleEdit}>Edit</button>
			</>
		);
	
};

export default Reviews;
