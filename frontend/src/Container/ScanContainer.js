import { useRef } from 'react';
import debounce from 'lodash.debounce';  // Utility to limit the rate of function calls
import React from 'react';
import BookScanner from '../components/BookSearchComponents/BookScanner';  // Component for scanning books (e.g., via barcode)
import { useState } from 'react';
import { useSelector } from 'react-redux';  // Redux hooks for selecting state
import axiosInstance from '../axiosInstance';  // Axios instance for making API requests
import { useNavigate } from 'react-router-dom';  // Hook to programmatically navigate between routes
import { isValidISBN } from '../utils/validation';  // Utility function to validate ISBN codes
import ImageWithLoading from '../components/ImageWithLoading';  // Component to display an image with a loading indicator
import { Link } from 'react-router-dom';  // Component for navigation links

const ScanContainer = () => {
    const navigate = useNavigate();  // Hook to programmatically navigate
    const [searchResults, setSearchResults] = useState([]);  // State to store search results
    const [loading, setLoading] = useState(false);  // State to track loading status
    const [error, setError] = useState(null);  // State to store any errors

    const books = useSelector((state) => state.books.books);  // Select the list of books from Redux
    const lastDetectedTime = useRef(0);  // Ref to store the timestamp of the last detected scan

    // Function to handle the detection of a barcode, debounced to prevent multiple detections in quick succession
    const handleDetected = debounce((data) => {
        const code = data.codeResult.code;  // Extract the detected code (e.g., ISBN)
        console.log(code);

        const now = Date.now();
        if (now - lastDetectedTime.current < 2000) {
            return;  // Ignore detection if it occurs within a 2-second cooldown period
        }
        lastDetectedTime.current = now;

        if (!isValidISBN(code)) {
            console.log("not an isbn");  // Ignore the detected code if it's not a valid ISBN
            return;
        }

        setError(null);  // Clear any existing errors

        // Search for the book locally in the Redux store
        const local_results = books
            .filter((book) => book.isbn === code)
            .map((b) => {
                return { type: 'local', book: b };  // Tag the result as 'local'
            });

        setSearchResults(local_results);  // Update search results with local matches

        if (!loading) {
            setLoading(true);  // Set loading to true while fetching remote data

            // Fetch books from the server based on the detected ISBN
            axiosInstance
                .get(`/books/search/`, { params: { isbn: code } })
                .then((response) => {
                    if (response && response.data) {
                        // Filter out local results from remote results
                        const remote_results = response.data
                            .filter(remoteBook => !local_results.some(localResult => localResult.book.isbn === remoteBook.isbn))
                            .map((book) => {
                                return { type: 'remote', book: book };  // Tag the result as 'remote'
                            });
                        setSearchResults(local_results.concat(remote_results));  // Combine local and remote results
                        console.log("successfully got result");
                    } else {
                        console.error('Invalid response format', response);
                        setError('Received unexpected data from the server.');  // Set an error message if the response is invalid
                    }
                    setLoading(false);  // Stop loading
                })
                .catch((err) => {
                    console.error('Error during API call', err);
                    setError('An error occurred while fetching the search results.');  // Handle API call errors
                    setLoading(false);  // Stop loading
                });
        }
    }, 1000);  // Debounce the function with a 1-second interval to limit scan frequency

    // Handle the event when a user clicks to add an external book to the library
    const handleExternalBookClick = (book) => {
        navigate('/books/new', { state: { bookPrototype: book } });  // Navigate to the "new book" page, passing the book data
    };

    return (
        <>
            {/* Scanner section */}
            <div className='row center-align'>
                <article className='no-padding'>
                    <BookScanner onDetected={handleDetected} />  {/* BookScanner component for detecting barcodes */}
                </article>
            </div>

            {/* Loading and error messages */}
            {loading && <progress></progress>}
            {error && <p className='error'>{error}</p>}

            {/* Display search results */}
            <div className='grid'>
                {searchResults.map((book, index) => (
                    <div key={book.book?.isbn} className='s12 m6 l4'>
                        <article className='no-padding'>
                            {/* Display book cover image */}
                            <ImageWithLoading src={book.book?.image} alt={book.book?.title} />
                            <div className='padding'>
                                <h5>{book.book?.title}</h5>  {/* Display book title */}
                                <p>{book.book?.author}</p>  {/* Display book author */}
                                <p>{book.book?.isbn}</p>  {/* Display book ISBN */}
                            </div>

                            <div className='padding'>
                                {/* If the book is local, link to its details page; otherwise, provide an option to add it to the library */}
                                {book.type === 'local' ? (
                                    <Link to={`/books/${book.book.id}`} className='responsive'>
                                        <button className='responsive'>
                                            <i>link</i>
                                            <span>Go to book</span>
                                        </button>
                                    </Link>
                                ) : (
                                    <button onClick={() => handleExternalBookClick(book.book)} className='responsive'>
                                        <i>add</i>
                                        <span>Add to Library</span>
                                    </button>
                                )}
                            </div>
                        </article>
                    </div>
                ))}
            </div>
        </>
    );
};

export default ScanContainer;  // Export the ScanContainer component as the default export
