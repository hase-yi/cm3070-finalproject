import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FormButtons from '../FormButtons';
import classes from './Comments.module.css';
import { createComment } from '../../features/bookSlice';

const CreateCommentSection = ({ bookId }) => {
	const [isSubmitting, setIsSubmitting] = useState(false);

	const dispatch = useDispatch();

	const numericBookId = Number(bookId);

	const book = useSelector((state) =>
		state.books.books.find((book) => book.id === numericBookId)
	);

	const status = useSelector((state) => state.books.status);
	const error = useSelector((state) => state.books.error);

	const [formData, setFormData] = useState({
		comment: {
			text: book?.review?.comments?.text || '',
		},
	});

	const handleSubmit = async (event) => {
		event.preventDefault();

		setIsSubmitting(true);

		// Validate that book.id exists and is a number
		if (!book || typeof book.id !== 'number' || !Number.isInteger(book.id)) {
			console.error('Book ID is either missing or not a valid number');
			setIsSubmitting(false);
			return; // Exit the function early if book.id is invalid
		}

		const commentData = {
			review: book.review.id,
			book: book.id,
			text: formData.comment.text,
		};

		console.log('Review in commentData is: ', commentData.review);

		try {
			const bookData = {
				review: {
					comment: { ...commentData },
				},
			};

			// Await the dispatch to ensure completion
			await dispatch(createComment(bookData)).unwrap();
      formData.comment.text = ""
		} catch (err) {
			console.error('Failed to save book:', err);
		} finally {
			// Reset the states regardless of success or failure
			setIsSubmitting(false);
		}
	};

	const handleCommentChange = (e) => {
		const { name, value } = e.target;
		setFormData((prevData) => ({
			...prevData,
			comment: {
				...prevData.comment,
				[name]: value,
			},
		}));
	};

	return (
		<form className={classes.addCommentContainer} onSubmit={handleSubmit}>
			<label htmlFor="text">Review</label>
			<textarea
				id="text"
				name="text"
				rows="5"
				value={formData.comment.text}
				placeholder="Write your comment here..."
				onChange={handleCommentChange}
				required
				className={classes.addCommentInput}
			/>
			<div className={classes.commentActions}>
				<FormButtons
					label={isSubmitting ? 'Submitting' : 'Add Comment'}
					type="submit"
					disabled={isSubmitting}
				/>
			</div>
		</form>
	);
};

export default CreateCommentSection;
