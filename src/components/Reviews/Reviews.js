import { useNavigate, useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { useDispatch,useSelector } from 'react-redux';
import Input from '../Input'


const Reviews=()=>{
const [ isEditing, setIsEditing]=useState(false);
  const { bookId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const numericBookId = Number(bookId);

  const book = useSelector((state) =>
    state.books.books.find((book) => book.id === numericBookId)
  );

  const status = useSelector((state) => state.books.status);
  const error = useSelector((state) => state.books.error);

  const handleEdit=(e)=>{
    setIsEditing (!isEditing);
  }

  return (
    <>
      {isEditing ?
      <div>
      <label htmlFor="description">Description</label>
				<textarea
					id="description"
					name="description"
					rows="5"
					required
					defaultValue=""
				/>
      </div> : <p>This is the review</p>}
      <button onClick = {handleEdit}  >Edit</button>
    </>
  );
}

export default Reviews