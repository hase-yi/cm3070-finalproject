import NavigationLinks from './NavigationLinks';

function MainNavigation() {
	return (
		<>
		<nav className="l m left drawer">
			<div className="large-space"></div>

			<NavigationLinks />
		</nav>
		<nav className='s bottom'>
		<NavigationLinks />

		</nav>
		</>
		
	);
}

export default MainNavigation;
