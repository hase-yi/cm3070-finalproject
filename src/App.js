// src/App.js
import React from 'react';
import { createBrowserRouter , RouterProvider} from 'react-router-dom';

import HomePage from './Pages/Home';

const router = createBrowserRouter([
    {path :'/', element:<HomePage/> },
    {}
]);

function App(){
    return <RouterProvider router={router}/>;
}

export default App;
