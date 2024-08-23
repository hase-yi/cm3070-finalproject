import React, { useState, useEffect } from 'react';
import axiosInstance from '../../axiosInstance';  // Axios instance for making API requests
import { formatDate } from '../../utils/misc';  // Utility function to format dates

function SharedReadingProgress({ username }) {
    const [readingProgresses, setReadingProgresses] = useState([]);  // State to store fetched reading progress data
    const [loadingReadingProgresses, setLoadingReadingProgresses] = useState(false);  // State to track loading status
    const [errorReadingProgresses, setErrorReadingProgresses] = useState(null);  // State to store any errors during fetching

    // useEffect hook to fetch reading progress whenever the 'username' changes
    useEffect(() => {
        if (username) {
            setLoadingReadingProgresses(true);  // Start loading when fetching begins
            setErrorReadingProgresses(null);  // Clear any previous errors

            // Fetch reading progress from the API for the given username
            axiosInstance.get(`/reading/`, { params: { username: username } })
                .then((response) => {
                    setReadingProgresses(response.data);  // Set the fetched reading progress in state
                    setLoadingReadingProgresses(false);  // Stop loading once data is received
                })
                .catch((err) => {
                    setErrorReadingProgresses('An error occurred while fetching the reading progress.');  // Handle any errors during the API call
                    setLoadingReadingProgresses(false);  // Stop loading in case of an error
                });
        }
    }, [username]);  // Dependency: fetch data when the 'username' changes

    return (
        <article>
            <h5>Recent Reading Progress</h5>
            {/* Display a loading indicator while data is being fetched */}
            {loadingReadingProgresses && <progress className="circle"></progress>}
            {/* Display an error message if there was an issue fetching the data */}
            {errorReadingProgresses && <p className='error'>{errorReadingProgresses}</p>}
            {/* Display the fetched reading progress entries */}
            {readingProgresses.map((progress) => (
                <a className='row wave' key={progress.id} href={`/books/${progress.book.id}`}>  {/* Link to the book's detail page */}
                    <div className='max'>
                        {progress.book.title}  {/* Display the book title */}
                    </div>
                    <div>
                        {formatDate(progress.timestamp)}  {/* Format and display the progress timestamp */}
                    </div>
                </a>
            ))}
        </article>
    );
}

export default SharedReadingProgress;  // Export the component as the default export
