import React, { useState, useEffect } from 'react';
import axiosInstance from '../../axiosInstance';


function SharedReviews({ username }) {
    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [errorReviews, setErrorReviews] = useState(null);

    useEffect(() => {
        if (username) {
            setLoadingReviews(true);
            setErrorReviews(null);

            axiosInstance.get(`/reviews/`, { params: { username: username } })
                .then((response) => {
                    setReviews(response.data);
                    setLoadingReviews(false);
                })
                .catch((err) => {
                    setErrorReviews('An error occurred while fetching the reviews.');
                    setLoadingReviews(false);
                });
        }
    }, [username]);

    return (
        <article>
            <h5>Recent Reviews</h5>
            {loadingReviews && <progress className="circle"></progress>}
            {errorReviews && <p className='error'>{errorReviews}</p>}
            <ul>
                {reviews.map((review) => (
                    <li key={review.id}>
                        <a href={`/books/${review.book.id}`}>{review.book.title}</a>
                    </li>
                ))}
            </ul>
            {/* TODO: Load more button */}
        </article>
    )
}

export default SharedReviews;