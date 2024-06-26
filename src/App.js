// src/App.js
import React from 'react';
import { createBrowserRouter } from 'react-router-dom';

import HomePage from './Pages/Home';

createBrowserRouter([
    {path :'/', element:<HomePage/> },
    {}
]);

function App(){
    return<div></div>;
}

export default App;
