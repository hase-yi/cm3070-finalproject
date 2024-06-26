import { Link } from 'react-router-dom';

const SHELVES = [
	{ id: 's1', title: 'Shelf 1' },
	{ id: 's2', title: 'Shelf 2' },
	{ id: 's3', title: 'Shelf 3' },
];
function ShelvesPage() {
	return (
		<>
			<h1>The Shelves page</h1>
			<ul>
				{SHELVES.map((shelf) => (
					<li key={shelf.id}>
            {/* relative path */}
						<Link to={shelf.id} >{shelf.id}</Link>
					</li>
				))}
			</ul>
		</>
	);
}

export default ShelvesPage;
