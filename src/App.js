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

import BookRoot from './Pages/Books/BookRoot';
import NewBookPage from './Pages/Books/NewBook';
import EditBookPage from './Pages/Books/EditBook';
import BooksPage from './Pages/Books/Books';
import BookDetailPage from './Pages/Books/BookDetail';

import AuthenticationPage from './Pages/Authentication'


const routeDefinitions = createRoutesFromElements(
	// path dependent wrapper Route
	<Route path="/" element={<RootLayout />} errorElement={<ErrorPage />}>
		<Route index element={<HomePage />} />
		<Route path="shelves" element={<ShelfRootLayout />}>
			<Route index element={<ShelvesPage />}  />
			<Route path=":shelfId" id="shelf-detail" >
				<Route index element={<ShelfDetailPage />}  />
				<Route
					path="edit"
					element={<EditShelfPage />}
				/>
			</Route>
			<Route
				path="new"
				element={<NewShelfPage />}
			/>
		</Route>
		<Route path="auth" element={<AuthenticationPage/>}></Route>
		<Route path="books" element={<BookRoot />}>
      <Route index element={<BooksPage />} />
      <Route path="new" element={<NewBookPage />} />
      <Route path=":bookId" element={<BookDetailPage />} />
      <Route path=":bookId/edit" element={<EditBookPage />} />
    </Route>
	</Route>
);

const router = createBrowserRouter(routeDefinitions);

function App() {
	return <RouterProvider router={router} />;
}

export default App;
