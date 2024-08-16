import React from 'react';
import { Outlet } from 'react-router-dom';

import { NavLink } from 'react-router-dom';

const BookRoot = () => {
  return (
    <div>
<NavLink
								to="new"
								end
							>
								New Book
							</NavLink>      <Outlet />
    </div>
  );
};

export default BookRoot;
