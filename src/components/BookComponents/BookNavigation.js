import React from 'react';
import { Link } from 'react-router-dom';

const BookNavigation = () => {
  return (
    <div>
      <nav>
        <ul>
          <li>
            <Link to="/books/new">Add New Book(to be changed)</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default BookNavigation;

