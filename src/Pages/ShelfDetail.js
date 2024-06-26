import { useParams, Link } from 'react-router-dom';

function ProductDetailPage() {
	const params = useParams();

	return (
		<>
			<h1>Shelf Detail</h1>
			<p>{params.shelfId}</p>
			{/* ".." go back */}
			<p>
				<Link to=".." relative="path">
					Back
				</Link>
			</p>
		</>
	);
}
export default ProductDetailPage;
