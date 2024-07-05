import React from 'react';
import { Link, Outlet } from 'react-router-dom';

const BookNavigation = () => {
  return (
    <div>
      <nav>
        <ul>
          <li>
            <Link to="/books/new">Add New Book</Link>
          </li>
        </ul>
      </nav>
      <Outlet />
    </div>
  );
};

export default BookNavigation;
