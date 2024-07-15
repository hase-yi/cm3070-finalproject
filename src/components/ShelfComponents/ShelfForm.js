import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
	createShelf,
	updateShelf,
	deleteShelf,
} from '../../features/shelfSlice';
import classes from './ShelfForm.module.css';

function ShelfForm({ method, shelf }) {
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const status = useSelector((state) => state.shelves.status);
	const error = useSelector((state) => state.shelves.error);
	const validationErrors = useSelector(
		(state) => state.shelves.validationErrors
	);

	const isSubmitting = status === 'loading';

	const handleSubmit = async (event) => {
    // prevent the form automaticlly send a http request to server
		event.preventDefault();
		const formData = new FormData(event.target);
		const shelfData = {
			title: formData.get('title'),
			image: formData.get('image'),
			description: formData.get('description'),
		};

		try {
			if (method === 'POST') {
				await dispatch(createShelf(shelfData)).unwrap();
			} else if (method === 'PATCH' && shelf) {
				await dispatch(
					updateShelf({ id: shelf.id, updatedShelf: shelfData })
				).unwrap();
			}
			navigate('/shelves');
		} catch (err) {
			console.error('Failed to save shelf:', err);
		}
	};

	const handleDelete = async (shelfId) => {
    try{

      dispatch(deleteShelf(shelfId));
      navigate('/shelves');
    } catch (err){
      console.error('Failed to delete shelf:', err);
    }
	};


	return (
		<form className={classes.form} onSubmit={handleSubmit}>
			{error && <p className="error">{error}</p>}
			{validationErrors && (
				<ul>
					{Object.entries(validationErrors).map(([field, errors]) =>
						errors.map((error, index) => (
							<li key={`${field}-${index}`}>{`${field}: ${error}`}</li>
						))
					)}
				</ul>
			)}
			<p>
				<label htmlFor="title">Shelf Name</label>
				<input
					id="title"
					type="text"
					name="title"
					required
					defaultValue={shelf ? shelf.title : ''}
				/>
			</p>
			<p>
				<label htmlFor="image">Image</label>
				<input
					id="image"
					type="url"
					name="image"
					defaultValue={shelf ? shelf.image : ''}
				/>
			</p>
			<p>
				<label htmlFor="description">Description</label>
				<textarea
					id="description"
					name="description"
					rows="5"
					required
					defaultValue={shelf ? shelf.description : ''}
				/>
			</p>
			<div className={classes.actions}>
				<button onClick={() => handleDelete(shelf.id)}>Delete</button>
				<button
					type="button"
					onClick={() => navigate('..')}
					disabled={isSubmitting}
				>
					Cancel
				</button>
				<button type="submit" disabled={isSubmitting}>
					{isSubmitting ? 'Submitting' : 'Save'}
				</button>
			</div>
		</form>
	);
}

export default ShelfForm;
