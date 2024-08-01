import { useNavigate, useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Input from '../Input';
import FormButtons from '../FormButtons';
import classes from './Comments.module.css';
import { createComment, updateComment } from '../../features/bookSlice';
import Comment from './Comment'

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
			</div>
		);
};

export default Comments;
