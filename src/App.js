// src/App.js
import React from 'react';
import {
	createBrowserRouter,
	createRoutesFromElements,
	RouterProvider,
	Route,
} from 'react-router-dom';

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


const routeDefinitions = createRoutesFromElements(
	// path dependent wrapper Route
	<Route path="/" element={<RootLayout />} errorElement={<ErrorPage />}>
		<Route element={<NavigationLayout />}>
			<Route index element={<HomePage />} />
			<Route path="shelves" element={<ShelfRootLayout />}>
				<Route index element={<ShelvesPage />} />
				<Route path=":shelfId">
					<Route index element={<ShelfDetailPage />} />
					<Route path="edit" element={<EditShelfPage />} />
				</Route>
				<Route path="new" element={<NewShelfPage />} />
			</Route>
			<Route path="books" element={<BookRoot />}>
				<Route index element={<BooksPage />} />
				<Route path=":bookId">
					<Route index element={<BookDetailPage />} />
					<Route path="edit" element={<EditBookPage />} />
				</Route>
				<Route path="new" element={<NewBookPage />} />
			</Route>
			<Route path="auth" element={<AuthenticationPage />}></Route>
			<Route path="search" element={<SearchPage />} />
			<Route path="scan" element={<ScanPage />} />
			<Route path="searchpeople" element={<PeopleSearchPage />} />
			<Route path="profiles/:username" element={<HomePage />} />
		</Route>
	</Route>
);

const router = createBrowserRouter(routeDefinitions);

function App() {
	return <RouterProvider router={router} />;
}

export default App;
