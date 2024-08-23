import { useSelector } from 'react-redux';  // Hook to access the Redux store
import { useParams } from 'react-router-dom';  // Hooks to access URL parameters
import ShelfItem from '../../components/ShelfComponents/ShelfItem';  // Component to display a single shelf item
import BookList from '../../components/BookComponents/BookList';  // Component to display a list of books in the shelf

function ShelfDetailPage() {
  const params = useParams();  // Hook to get URL parameters
  const { shelfId } = params;  // Extract shelfId from the URL parameters

  const parsedShelfId = parseInt(shelfId, 10);  // Parse shelfId to an integer

  // Get the specific shelf from the Redux store based on the parsed shelfId
  const shelf = useSelector((state) =>
    state.shelves.shelves.find((shelf) => shelf.id === parsedShelfId)
  );

  return (
    <div>
      {/* If the shelf exists, render the ShelfItem component to display the shelf's details */}
      {shelf && <ShelfItem shelf={shelf} />}
      <hr className="large" />  {/* Horizontal rule to separate the shelf details from the book list */}
      
      {/* Render the BookList component to display all books belonging to this shelf */}
      <BookList shelfId={shelfId} />
    </div>
  );
}

export default ShelfDetailPage;  // Export the ShelfDetailPage component as the default export
