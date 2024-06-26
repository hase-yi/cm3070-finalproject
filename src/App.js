// src/App.js
import React from 'react';
import {
	createBrowserRouter,
	createRoutesFromElements,
	RouterProvider,
	Route,
} from 'react-router-dom';

import HomePage from './Pages/Home';
import ShelvesPage from './Pages/Shelves';
import RootLayout from './Pages/Root';

const routeDefinitions = createRoutesFromElements(
	// path dependent wrapper Route
	<Route path="/" element={<RootLayout />}>
		<Route path="/" element={<HomePage />} />
		<Route path="/shelves" element={<ShelvesPage />} />
	</Route>
);

const router = createBrowserRouter(routeDefinitions);

function App() {
	return <RouterProvider router={router} />;
}

export default App;
