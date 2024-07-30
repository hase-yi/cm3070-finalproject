import { useNavigate, useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Input from '../Input';
import FormButtons from '../FormButtons';
import classes from './Comments.module.css';
import { createComment, updateComment } from '../../features/bookSlice';

const Comments = () => {
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

	console.log('comments are:', book?.review?.comments);

	const [formData, setFormData] = useState({
		comment: {
			text: book?.review?.comments?.text || '',
		},
	});



	const handleSubmit = async (event) => {
		event.preventDefault();
		setIsSubmitting(true);
		const commentData = {
      review:book.review.id,
			book: bookId,
			text: formData.comment.text,
		};

    console.log('review in commentData is: ', commentData.review)

		try {
			const bookData = {
        review:{
          comment: { ...commentData },
        }
			};
			console.log('bookData :', bookData);
      if(!book?.review?.comment){
        dispatch(createComment(bookData)).unwrap();
      }else {
        bookData.comment.id = book.review.comment.id;
        dispatch(updateComment(bookData)).unwrap();
      }
		} catch (err) {
			console.error('Fail to save book', err);
		}
    setIsSubmitting(false);
    setIsEditing(false);
	};


	const handleCommentChange = (event) => {
		const { name, value } = event.target;
		setFormData((prevData) => ({
			...prevData,
			comment: {
				...prevData.comment,
				[name]: value,
			},
		}));
	};

	const handleEdit = (e) => {
		setIsEditing(!isEditing);
	};

	if (book?.review?.comments) {
		return (
			<>
				{isEditing ? (
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
							<FormButtons
								label="Cancel"
								type="button"
								onClick={handleEdit}
								className={classes.cancelButton}
							/>
						</div>
					</form>
				) : (
					<div className={classes.commentsContainer}>
						<h2>Comments List</h2>
						<ul>
							{book.review.comments.map((comment) => (
								<li key={comment.id} className={classes.commentContent}>
									<p>{comment.text}</p>
								</li>
							))}
						</ul>
					</div>
				)}
				{!isEditing && (
					<div className={classes.commentActions}>
						<FormButtons
							label="Add Comment"
							type="button"
							onClick={handleEdit}
						/>
					</div>
				)}
			</>
		);
	}

	return <p>There is no Comments</p>;
};

export default Comments;
