// src/App.js
import React from 'react';
import {
	createBrowserRouter,
	createRoutesFromElements,
	RouterProvider,
	Route,
} from 'react-router-dom';

import HomePage from './Pages/Home';
import ShelvesPage, { loader as shelvesLoader } from './Pages/Shelves/Shelves';
import RootLayout from './Pages/Root';
import ErrorPage from './Pages/Error';
import ShelfDetailPage, {
	loader as shelfDetailLoader,
	action as deleteShelfAction,
} from './Pages/Shelves/ShelfDetail';
import NewShelfPage from './Pages/Shelves/NewShelf';
import EditShelfPage from './Pages/Shelves/EditShelf';
import ShelfRootLayout from './Pages/Shelves/ShelfRoot';
import { action as manipulateShelfAction } from './util/action';
import AuthenticationPage, {action as authAction} from './Pages/Authentication'


const routeDefinitions = createRoutesFromElements(
	// path dependent wrapper Route
	<Route path="/" element={<RootLayout />} errorElement={<ErrorPage />}>
		<Route index element={<HomePage />} />
		<Route path="shelves" element={<ShelfRootLayout />}>
			<Route index element={<ShelvesPage />} loader={shelvesLoader} />
			<Route path=":shelfId" id="shelf-detail" loader={shelfDetailLoader}>
				<Route index element={<ShelfDetailPage />} action={deleteShelfAction} />
				<Route
					path="edit"
					element={<EditShelfPage />}
					action={manipulateShelfAction}
				/>
			</Route>
			<Route
				path="new"
				element={<NewShelfPage />}
				action={manipulateShelfAction}
			/>
		</Route>
		<Route path="auth" element={<AuthenticationPage/>} action={authAction}></Route>
	</Route>
);

const router = createBrowserRouter(routeDefinitions);

function App() {
	return <RouterProvider router={router} />;
}

export default App;
