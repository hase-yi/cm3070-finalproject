import { useNavigate, useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Input from '../Input';
import FormButtons from '../FormButtons';
import classes from './Comments.module.css';
import { createComment, updateComment } from '../../features/bookSlice';

const Comments = () => {
	
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
					
									) : null}
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


};

export default Comments;
