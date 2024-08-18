import { useNavigate, useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Input from '../Input';
import FormButtons from '../FormButtons';
import { createComment, deleteComment, updateComment } from '../../features/bookSlice';

const Comment = ({ bookId, commentId }) => {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isEditing, setIsEditing] = useState(false);

	const dispatch = useDispatch();

	const numericBookId = Number(bookId);

	const user = useSelector((state) => state.auth.user);

	const book = useSelector((state) =>
		state.books.books.find((book) => book.id === numericBookId)
	);

	const comment = useSelector((state) => {
		const book = state.books.books.find((book) => book.id === numericBookId);
		return book?.review?.comments?.find((comment) => comment.id === commentId);
	});

	const status = useSelector((state) => state.books.status);
	const error = useSelector((state) => state.books.error);

	const [formData, setFormData] = useState({
		comment: {
			text: comment.text || '',
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

			// Ensure that comment.id exists and is set correctly
			if (comment && comment.id) {
				bookData.review.comment.id = comment.id;
			} else {
				console.error('Comment ID is missing');
				throw new Error('Comment ID is missing');
			}

			// Await the dispatch to ensure completion
			await dispatch(updateComment(bookData)).unwrap();

		} catch (err) {
			console.error('Failed to save book:', err);
		} finally {
			// Reset the states regardless of success or failure
			setIsSubmitting(false);
			setIsEditing(false);
		}
	};


	const handleCommentChange = (e, commentId) => {
		const { name, value } = e.target;
		setFormData((prevData) => ({
			...prevData,
			comment: {
				...prevData.comment,
				[name]: value,
			},
		}));
	};

	const handleEdit = () => {
		setIsEditing(!isEditing);
	};

	const handleDelete = async (event) => {
		event.preventDefault();

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

		const commentData = {
			review: book.review.id,
			book: book.id,
		};

		try {
			const bookData = {
				review: {
					comment: { ...commentData },
				},
			};

			// Ensure that comment.id exists and is set correctly
			if (comment && comment.id) {
				bookData.review.comment.id = comment.id;
			} else {
				console.error('Comment ID is missing');
				throw new Error('Comment ID is missing');
			}

			// Await the dispatch to ensure completion
			await dispatch(deleteComment(bookData)).unwrap();

		} catch (err) {
			console.error('Failed to save book:', err);
		} finally {
			// Reset the states regardless of success or failure
			setIsSubmitting(false);
			setIsEditing(false);
		}
	};

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
								value={formData.comment.text}
								onChange={handleCommentChange}
								required
							></textarea>
						</div>
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

	return (
		<article className="round">
			<div className='row'>
				<div className='max'>
					<p>{comment.text}</p>
				</div>
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

export default Comment;
