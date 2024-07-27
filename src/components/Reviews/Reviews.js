import { useNavigate, useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { useDispatch,useSelector } from 'react-redux';
import Input from '../Input'
import FormButtons from '../FormButtons';
import classes from './Reviews.module.css'



const Reviews=()=>{
const [isSubmitting, setIsSubmitting] = useState(false);
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

const [formData, setFormData] = useState({
  review:{
    text:book?.review?.text || '',
    shared: book?.review?.shared || false
  }
})


  const handleEdit=(e)=>{
    setIsEditing (!isEditing);
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      review: {
        ...prevData.review,
        [name]: value,
      },
    }));
  };


  return (
    <>
      {isEditing ?
      <div>
      <label htmlFor="text">Description</label>
				<textarea
					id="text"
					name="text"
					rows="5"
          value = {formData.review.text}
          onChange = {handleChange}
					required
				/>
      </div> : <p>{formData.review.text}</p>}
      <button onClick = {handleEdit}  >Edit</button>
      <div className={classes.actions}>
        <FormButtons
          label="Cancel"
          type="button"
          onClick={() => navigate('..')}
          disabled={isSubmitting}
        />
        <FormButtons
          type="submit"
          disabled={isSubmitting}
          label={isSubmitting ? 'Submitting' : 'Save'}
        />
      </div>
    </>
  );
}

export default Reviews