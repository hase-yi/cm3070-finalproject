import React from 'react';
import classes from './FormButtons.module.css';

const FormButtons = ({ disabled, onClick, label, type }) => {
	return (
		<div className={classes.actions}>
			<button
				type={type || 'button'}
				onClick={onClick}
				disabled={disabled}
			>
				{label}
			</button>
		</div>
	);
};

export default FormButtons;
