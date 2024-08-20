import { useRef } from 'react';
import debounce from 'lodash.debounce';
import React from 'react';
import BookScanner from '../components/BookSearchComponents/BookScanner';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axiosInstance from '../axiosInstance';
import { useNavigate } from 'react-router-dom';
import { isValidISBN } from '../utils/validation';
import ImageWithLoading from '../components/ImageWithLoading';
import { Link } from 'react-router-dom';

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
        <>
            <div className='row center-align'>
                <article className='no-padding'>
                    <BookScanner onDetected={handleDetected} />

                </article>

            </div>


            {loading && <progress></progress>}
            {error && <p className='error'>{error}</p>}

            <div className='grid'>
                {searchResults.map((book, index) => (
                    <div key={book.book?.isbn} className='s12 m6 l4' >
                        <article className='no-padding'>
                            <ImageWithLoading src={book.book?.image} alt={book.book?.title} />
                            <div className='padding' >
                                <h5>{book.book?.title}</h5>
                                <p>{book.book?.author}</p>
                                <p>{book.book?.isbn}</p>

                            </div>
                            <div className='padding'>
                                {book.type === 'local' ? (

                                    <Link to={`/books/${book.book.id}`} className='responsive'>
                                        <button className='responsive'>
                                            <i>link</i>
                                            <span>Go to book</span>
                                        </button>
                                    </Link>) : (
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

export default ScanContainer;
