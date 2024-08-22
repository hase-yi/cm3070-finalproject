import React from 'react';
import { useParams } from 'react-router-dom';  // Hook to access URL parameters
import { useSelector } from 'react-redux';  // Hook to access the Redux store
import BookForm from '../../components/BookComponents/BookForm';  // Component to handle the book form (editing or creating a book)

const EditBookPage = () => {
  const { bookId } = useParams();  // Get the bookId from the URL parameters

  // Select the specific book from the Redux store based on the bookId
  const book = useSelector((state) =>
    state.books.books.find((book) => book.id === parseInt(bookId))
  );

  return (
    <div>
      {/* Display the title of the book being edited */}
      <h3>Edit {book.title}</h3>
      
      {/* Render the BookForm component if the book data is available, passing the bookId and the method "PUT" for editing */}
      {book && <BookForm method="PUT" bookId={bookId} />}
    </div>
  );
};

export default EditBookPage;  // Export the EditBookPage component as the default export
