import { useRef } from 'react';
import debounce from 'lodash.debounce';
import React from 'react';
import BookScanner from '../components/BookSearchComponents/BookScanner';
import { fetchBooks } from '../features/bookSlice'; // Import the searchBook thunk
import classes from './ScanContainer.module.css'; // Import the CSS module
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axiosInstance from '../axiosInstance';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { isValidISBN } from '../utils/validation';

const ScanContainer = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const status = useSelector((state) => state.books.status);
    const books = useSelector((state) => state.books.books);
    const lastDetectedTime = useRef(0);

	const handleDetected = debounce((data) => {
		const code = data.codeResult.code;
		console.log(code);
	
		const now = Date.now();
		if (now - lastDetectedTime.current < 2000) {
			return; // Ignore if within cooldown period
		}
		lastDetectedTime.current = now;
	
		if (!isValidISBN(code)) {
			console.log("not an isbn");
			return;
		}
	
		setError(null);
	
		const local_results = books
			.filter((book) => book.isbn === code)
			.map((b) => {
				return { type: 'local', book: b };
			});
	
		setSearchResults(local_results);
	
		if (!loading) {
			setLoading(true);
	
			axiosInstance
				.get(`/books/search/`, { params: { isbn: code } })
				.then((response) => {
					if (response && response.data) {
						const remote_results = response.data
                        .filter(remoteBook => !local_results.some(localResult => localResult.book.isbn === remoteBook.isbn))
                        .map((book) => {
                            return { type: 'remote', book: book };
                        });
						setSearchResults(local_results.concat(remote_results));
						console.log("successfully got result");
					} else {
						console.error('Invalid response format', response);
						setError('Received unexpected data from the server.');
					}
					setLoading(false);
				})
				.catch((err) => {
					console.error('Error during API call', err);
					setError('An error occurred while fetching the search results.');
					setLoading(false);
				});
		}
	}, 1000); // Debounce interval in milliseconds
	
    const handleExternalBookClick = (book) => {
        navigate('/books/new', { state: { bookPrototype: book } });
    };

    return (
        <div className={classes.ScanContainer}>
            <h1>Scan Book</h1>
            <BookScanner onDetected={handleDetected} />
            {error && <div className={classes.feedbackMessage}>Error: {error}</div>}
            {loading && <div className={classes.loadingIndicator}>Loading...</div>}
            <ul className={classes.results}>
                {searchResults.map((book, index) => (
                    <li key={index} className={classes.bookItem}>
                        {book.book?.image && (
                            <img src={book.book.image} alt={book.book.title} />
                        )}
                        {book.book?.title} by {book.book?.author}
                        <p>{book.type}</p>
                        {book.type === 'local' ? (
                            <a href={`/books/${book.book.id}`}>Go to book</a>
                        ) : (
                            <button onClick={() => handleExternalBookClick(book.book)}>
                                Add to Library
                            </button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ScanContainer;
