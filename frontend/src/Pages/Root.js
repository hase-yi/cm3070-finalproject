import { Outlet } from 'react-router-dom';

import MainNavigation from '../components/MainNavigation'

function RootLayout() {
	return (
		<>
			<MainNavigation />
			<main className='responsive'>
				<div className="large-space l m"></div> {/* Larger deadzone for l and m devices */}
				<div className="medium-space s"></div> {/* Smaller deadzone for s devices */}
				<Outlet />
			</main>
		</>
	);
}
export default RootLayout;
