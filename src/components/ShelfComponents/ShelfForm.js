import { useNavigate } from 'react-router-dom';

import classes from './ShelfForm.module.css';

function ShelfForm({ method, event }) {
	const navigate = useNavigate();
	function cancelHandler() {
		navigate('..');
	}
}

return (
	<form className={classes.form}>
		<p>
			<label htmlFor="title">Shelf Name</label>
			<input id="title" type="text" name="title" required />
		</p>
		<p>
			<label htmlFor="description">Description</label>
			<textarea id="description" name="description" rows="5" required />
		</p>
    <div className={classes.actions}>
        <button type="button" onClick={cancelHandler}>
          Cancel
        </button>
        <button>Save</button>
      </div>
	</form>
);
