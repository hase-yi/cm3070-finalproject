import { Link } from 'react-router-dom';

import classes from './ShelfList.module.css';

function ShelfList({ shelves }) {
	return (
		<div className={classes.shelves}>
			<h1>All Shelves</h1>
			<ul className={classes.list}>
				{shelves.map((shelf) => (
					<li key={shelf.id} className={classes.item}>
						<Link to={`${shelf.id}`}>
							<img src={shelf.image} alt={shelf.title} />
							<div className={classes.content}>
								<h2>{shelf.title}</h2>
							</div>
						</Link>
			<div className={classes.actions}>
							<Link to={`/shelves/${shelf.id}/edit`} ><button>Edit</button></Link>
						</div>
					</li>
				))}
			</ul>
		</div>
	);
}

export default ShelfList;
