import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import classes from './Comments.module.css';
import Comment from './Comment'
import CreateCommentSection from './CreateCommentSection'

const Comments = () => {
	const { bookId } = useParams();
	const dispatch = useDispatch();

	const numericBookId = Number(bookId);

	const book = useSelector((state) =>
		state.books.books.find((book) => book.id === numericBookId)
	);

	const status = useSelector((state) => state.books.status);
	const error = useSelector((state) => state.books.error);

		return (
			<div className={classes.commentsContainer}>
				<h2>Comments</h2>
				<ul>
					{book.review.comments.map((comment) => (
						<li key={comment.id} className={classes.commentContent}>
							{<Comment bookId={bookId} commentId={comment.id} />}
						</li>
					))}
				</ul>
				{<CreateCommentSection bookId={bookId} />}
			</div>
		);
};

export default Comments;
