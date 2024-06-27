// src/App.js
import React from 'react';
import {
	createBrowserRouter,
	createRoutesFromElements,
	RouterProvider,
	Route,
} from 'react-router-dom';

import HomePage from './Pages/Home';
import ShelvesPage from './Pages/Shelves/Shelves';
import RootLayout from './Pages/Root';
import ErrorPage from './Pages/Error';
import ShelfDetailPage from './Pages/Shelves/ShelfDetail';
import NewShelfPage from './Pages/Shelves/NewShelf';
import EditShelfPage from './Pages/Shelves/EditShelf';
import ShelfRootLayout from './Pages/Shelves/ShelfRoot';

const routeDefinitions = createRoutesFromElements(
	// path dependent wrapper Route
	<Route path="/" element={<RootLayout />} errorElement={<ErrorPage />}>
		<Route index element={<HomePage />} />
		<Route path="shelves" element={<ShelfRootLayout />}>
			<Route index element={<ShelvesPage />} />
			<Route path=":shelfId" element={<ShelfDetailPage />} />
			<Route path="new" element={<NewShelfPage />} />
			<Route path=":shelfId/edit" element={<EditShelfPage />} />
		</Route>
	</Route>
);

const router = createBrowserRouter(routeDefinitions);

function App() {
	return <RouterProvider router={router} />;
}

export default App;
