import { Link } from 'react-router-dom';
import { NavLink } from 'react-router-dom';

function ShelfList({ shelves }) {
	return (
		<>
			<div className='row'>
				<h3 className='max'>All Shelves</h3>
				<NavLink to="new" end>
					<button>
						<i>add</i>
						<span>Add new shelf</span>
					</button>
				</NavLink>
			</div>

			<div className='grid' >
				{shelves.map((shelf) => (
					<div className='s12 m6 l3' >
						<Link to={`${shelf.id}`}>
							<article key={shelf.id} className='no-padding'>
								<img src={shelf.image} alt={shelf.title}  className='responsive medium-height' />
								<div className='padding' >
									<h5>{shelf.title}</h5>
									<p>{shelf.description}</p>
								</div>
							</article>
						</Link>
					</div>
				))}
			</div>
		</>
	);
}

export default ShelfList;
