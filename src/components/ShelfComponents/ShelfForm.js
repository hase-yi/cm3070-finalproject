import { Form, useNavigate, useNavigation} from 'react-router-dom';

import classes from './ShelfForm.module.css';

function ShelfForm({ method, shelf }) {
  const navigate = useNavigate();
	function cancelHandler() {
		navigate('..')
	}
	return (
    // This request is send to action
		<Form method='POST' className={classes.form}>
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
					required
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
				<button type="button" onClick={cancelHandler}>
					Cancel
				</button>
				<button>Save</button>
			</div>
		</Form>
	);
}

export default ShelfForm;
