import React, { useState, useEffect } from 'react';
import axiosInstance from '../../axiosInstance';  // Axios instance for making API requests
import { formatDate } from '../../utils/misc';  // Utility function to format dates

function SharedReviews({ username }) {
    const [reviews, setReviews] = useState([]);  // State to store fetched reviews
    const [loadingReviews, setLoadingReviews] = useState(false);  // State to track whether reviews are being loaded
    const [errorReviews, setErrorReviews] = useState(null);  // State to store any errors during the fetching process

    // useEffect hook to fetch reviews whenever the 'username' changes
    useEffect(() => {
        if (username) {
            setLoadingReviews(true);  // Set loading to true when the fetching process starts
            setErrorReviews(null);  // Clear any previous errors

            // Fetch reviews from the API for the given username
            axiosInstance.get(`/reviews/`, { params: { username: username } })
                .then((response) => {
                    setReviews(response.data);  // Set the fetched reviews in state
                    setLoadingReviews(false);  // Stop loading once data is received
                })
                .catch((err) => {
                    setErrorReviews('An error occurred while fetching the reviews.');  // Handle any errors that occur during the API call
                    setLoadingReviews(false);  // Stop loading in case of an error
                });
        }
    }, [username]);  // Dependency: fetch reviews when the 'username' changes

    return (
        <article>
            <h5>Recent Reviews</h5>
            {/* Display a loading indicator while reviews are being fetched */}
            {loadingReviews && <progress className="circle"></progress>}
            {/* Display an error message if there was an error fetching reviews */}
            {errorReviews && <p className='error'>{errorReviews}</p>}
            {/* Display the fetched reviews */}
            {reviews.map((review) => (
                <a className='row wave' key={review.id} href={`/books/${review.book.id}`}>  {/* Link to the book's detail page */}
                    <div className='max'>
                        {review.book.title}  {/* Display the book title */}
                    </div>
                    <div>
                        {formatDate(review.date)}  {/* Format and display the review date */}
                    </div>
                </a>
            ))}
        </article>
    );
}

export default SharedReviews;  // Export the component as the default export
