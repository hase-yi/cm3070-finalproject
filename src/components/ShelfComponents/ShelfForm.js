import { Form, useNavigate, useNavigation, useActionData} from 'react-router-dom';

import classes from './ShelfForm.module.css';

function ShelfForm({ method, shelf }) {
  const data = useActionData();
  const navigate = useNavigate();

  // Adding feedback for buttons 
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
	function cancelHandler() {
		navigate('..')
	}
	return (
    // This request is send to action
		<Form method={method} className={classes.form}>
      {/* Outputing validations errors from backend  */}
      {data && data.error && <ul>
        {Object.values(data.error).map(err=><li key={err}>{err}</li>)}
        </ul>}
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
				<button type="button" onClick={cancelHandler} disabled = {isSubmitting}>
					Cancel
				</button>
				<button disabled = {isSubmitting}>{isSubmitting ? 'Submitting': 'Save'}</button>
			</div>
		</Form>
	);
}

export default ShelfForm;
