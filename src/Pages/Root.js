import { Outlet } from 'react-router-dom';

import classes from './Root.module.css'
import MainNavigation from '../components/MainNavigation'

function RootLayout() {
	return (
		<>
			<MainNavigation/>
      <main className={classes.content}>
			<Outlet />
      </main>
		</>
	);
}
export default RootLayout;
