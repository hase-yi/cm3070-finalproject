import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
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
		<div >
			<h5>Comments</h5>
			{book.review?.comments &&
				book.review.comments.map((comment) => (
					<div key={comment.id} >
						<div className='small-space'></div>
						{<Comment bookId={bookId} commentId={comment.id} />}
					</div>
				))}

			{<CreateCommentSection bookId={bookId} />}
		</div>
	);
};

export default Comments;
