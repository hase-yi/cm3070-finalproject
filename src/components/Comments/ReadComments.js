import { useNavigate, useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Input from '../Input';
import FormButtons from '../FormButtons';
import classes from './Comments.module.css';
import { createComment, updateComment } from '../../features/bookSlice';

const ReadComments = () => {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isEditing, setIsEditing] = useState(false);

	const { bookId } = useParams();
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const numericBookId = Number(bookId);

	const user = useSelector((state) => state.auth.user);

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
		const commentData = {
			review: book.review.id,
			book: bookId,
			text: formData.comment.text,
		};

		console.log('review in commentData is: ', commentData.review);

		try {
			const bookData = {
				review: {
					comment: { ...commentData },
				},
			};
			console.log('bookData :', bookData);
			if (!book?.review?.comment) {
				dispatch(createComment(bookData)).unwrap();
			} else {
				bookData.comment.id = book.review.comment.id;
				dispatch(updateComment(bookData)).unwrap();
			}
		} catch (err) {
			console.error('Fail to save book', err);
		}
		setIsSubmitting(false);
		setIsEditing(false);
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

	const handleEdit = (commentId) => {
		setIsEditing((prevEditing) => ({
			...prevEditing,
			[commentId]: !prevEditing[commentId],
		}));
		setIsEditing(!isEditing);
	};

	const handleDelete=()=>{
		
	}

	if (book?.review?.comments && book.review.comments.length > 0) {
		return (
			<div className={classes.commentsContainer}>
				<h2>Comments List</h2>
				<ul>
					{book.review.comments.map((comment) => (
						<li key={comment.id} className={classes.commentContent}>
							{isEditing[comment.id] ? (
								<>
									<label htmlFor={`text-${comment.id}`}>Review</label>
									<textarea
										id={`text-${comment.id}`}
										name="text"
										rows="5"
										value={formData[comment.id]?.text || comment.text}
										placeholder="Write your comment here..."
										onChange={(e) => handleCommentChange(e, comment.id)}
										required
										className={classes.addCommentInput}
									/>
								</>
							) : (
								<p>{comment.text}</p>
							)}
							{user === comment.user && (
								<div className={classes.commentActions}>
									<FormButtons
										label="Edit"
										type="button"
										onClick={() => handleEdit(comment.id)}
									/>
									<FormButtons
										label="Delete"
										type="button"
										onClick={() => handleDelete(comment.id)}
									/>
								</div>
							)}
						</li>
					))}
				</ul>
			</div>
		);
	} else {
		return <p>There are no comments.</p>;
	}
};

export default ReadComments;
