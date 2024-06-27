import { useParams, Link } from 'react-router-dom';

function ShelfDetailPage() {
	const params = useParams();

	return (
		<>
			<h1>Shelf Detail</h1>
			<p>Shelf ID: {params.shelfId}</p>
			{/* ".." go back */}
			<p>
				<Link to=".." relative="path">
					Back
				</Link>
			</p>
		</>
	);
}
export default ShelfDetailPage;
