import { Outlet } from 'react-router-dom';

import MainNavigation from '../components/MainNavigation'

function RootLayout() {
	return (
		<>
			<MainNavigation />
			<main className='responsive'>
				<div className="large-space l m"></div>
				<div className="medium-space s"></div>
				<Outlet />
			</main>
		</>
	);
}
export default RootLayout;
