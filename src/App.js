// src/App.js
import React from 'react';
import {
	createBrowserRouter,
	createRoutesFromElements,
	RouterProvider,
	Route,
} from 'react-router-dom';  // Import necessary components from react-router-dom for routing

// Importing various pages used in the application
import HomePage from './Pages/Home';
import ShelvesPage from './Pages/ShelfPages/Shelves';
import RootLayout from './Pages/Root';
import ErrorPage from './Pages/Error';
import ShelfDetailPage from './Pages/ShelfPages/ShelfDetail';
import NewShelfPage from './Pages/ShelfPages/NewShelf';
import EditShelfPage from './Pages/ShelfPages/EditShelf';
import PeopleSearchPage from './Pages/PeopleSearchPage';
import ShelfRootLayout from './Pages/ShelfPages/ShelfRoot';

import BookRoot from './Pages/BookPages/BookRoot';
import NewBookPage from './Pages/BookPages/NewBook';
import EditBookPage from './Pages/BookPages/EditBook';
import BooksPage from './Pages/BookPages/Books';
import BookDetailPage from './Pages/BookPages/BookDetail';

import AuthenticationPage from './Pages/Authentication';
import SearchPage from './Pages/BookSearchPage';
import NavigationLayout from './NavigationLayout';
import ScanPage from './Pages/BookScanPage';

// Define the route structure for the application using createRoutesFromElements and Route components
const routeDefinitions = createRoutesFromElements(
	// Root route with RootLayout as the base layout and ErrorPage for handling any errors
	<Route path="/" element={<RootLayout />} errorElement={<ErrorPage />}>
		{/* Nested routes under the NavigationLayout, which includes the main navigation for the app */}
		<Route element={<NavigationLayout />}>
			{/* Home page route */}
			<Route index element={<HomePage />} />

			{/* Shelves-related routes */}
			<Route path="shelves" element={<ShelfRootLayout />}>
				<Route index element={<ShelvesPage />} />  {/* List all shelves */}
				<Route path=":shelfId">
					<Route index element={<ShelfDetailPage />} />  {/* Display details of a specific shelf */}
					<Route path="edit" element={<EditShelfPage />} />  {/* Edit shelf details */}
				</Route>
				<Route path="new" element={<NewShelfPage />} />  {/* Create a new shelf */}
			</Route>

			{/* Books-related routes */}
			<Route path="books" element={<BookRoot />}>
				<Route index element={<BooksPage />} />  {/* List all books */}
				<Route path=":bookId">
					<Route index element={<BookDetailPage />} />  {/* Display details of a specific book */}
					<Route path="edit" element={<EditBookPage />} />  {/* Edit book details */}
				</Route>
				<Route path="new" element={<NewBookPage />} />  {/* Create a new book */}
			</Route>

			{/* Authentication page route */}
			<Route path="auth" element={<AuthenticationPage />} />

			{/* Book search page route */}
			<Route path="search" element={<SearchPage />} />

			{/* Book scan page route */}
			<Route path="scan" element={<ScanPage />} />

			{/* People search page route */}
			<Route path="searchpeople" element={<PeopleSearchPage />} />

			{/* User profile page route */}
			<Route path="profiles/:username" element={<HomePage />} />
		</Route>
	</Route>
);

// Create a router instance with the defined routes
const router = createBrowserRouter(routeDefinitions);

function App() {
	// The RouterProvider component provides the router instance to the entire application
	return <RouterProvider router={router} />;
}

export default App;  // Export the App component as the default export
