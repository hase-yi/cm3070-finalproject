import { useParams } from 'react-router-dom';  // Hook to access route parameters
import { useDispatch, useSelector } from 'react-redux';  // Hooks to dispatch actions and access the Redux store
import Comment from './Comment';  // Component to display a single comment
import CreateCommentSection from './CreateCommentSection';  // Component to create a new comment

const Comments = () => {
	const { bookId } = useParams();  // Get the bookId from the URL parameters
	const dispatch = useDispatch();  // Hook to dispatch actions

	const numericBookId = Number(bookId);  // Convert bookId to a number

	// Get the book and its review (and associated comments) from the Redux store
	const book = useSelector((state) =>
		state.books.books.find((book) => book.id === numericBookId)
	);

	const status = useSelector((state) => state.books.status);  // Get the loading status of books
	const error = useSelector((state) => state.books.error);  // Get any errors related to fetching books

	return (
		<div>
			<h5>Comments</h5>
			{/* If there are comments on the review, render each one */}
			{book.review?.comments &&
				book.review.comments.map((comment) => (
					<div key={comment.id}>
						<div className='small-space'></div>
						{/* Render the Comment component for each comment */}
						<Comment bookId={bookId} commentId={comment.id} />
					</div>
				))}

			{/* Render the CreateCommentSection component to allow users to add a new comment */}
			<CreateCommentSection bookId={bookId} />
		</div>
	);
};

export default Comments;  // Export the Comments component as the default export
