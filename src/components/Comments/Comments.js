import { useNavigate, useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Input from '../Input';
import FormButtons from '../FormButtons';

const Comments = () =>{

  const { bookId } = useParams();
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const numericBookId = Number(bookId);

	const book = useSelector((state) =>
		state.books.books.find((book) => book.id === numericBookId)
	);

	const status = useSelector((state) => state.books.status);
	const error = useSelector((state) => state.books.error);

 console.log ("comments are:", book?.review?.comments)

if (book?.review?.comments){
  return (
    <div>
    <h2>Comments List</h2>
    <ul>
      {book.review.comments.map(comment => (
        <li key={comment.id}>
          <p>{comment.text}</p>
        </li>
      ))}
    </ul>
  </div>
  )
} 

return (
  <p>There is no Comments</p>
)



  
 }
 
 
 export default Comments