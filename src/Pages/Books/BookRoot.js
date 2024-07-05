import React from 'react';
import { Outlet } from 'react-router-dom';

import BookNavigation from '../../components/BookComponents/BookNavigation';

const BookRoot = () => {
  return (
    <div>
      <BookNavigation/>
      <Outlet />
    </div>
  );
};

export default BookRoot;
