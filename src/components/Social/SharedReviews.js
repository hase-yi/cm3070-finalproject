import React, { useState, useEffect } from 'react';
import axiosInstance from '../../axiosInstance';


function SharedReviews({ username }) {
    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [errorReviews, setErrorreviews] = useState(null);

    useEffect(() => {
        if (username) {
            setLoadingReviews(true);
            setErrorreviews(null);

            axiosInstance.get(`/reviews/`, { params: { username: username } })
                .then((response) => {
                    setReviews(response.data);
                    setLoadingReviews(false);
                })
                .catch((err) => {
                    setErrorreviews('An error occurred while fetching the reviews.');
                    setLoadingReviews(false);
                });
        }
    }, [username]);

    return (
        <div style={{ background: "white", color: "black" }}>
            <h2>Recent Reviews</h2>
            {loadingReviews && <p>Loading...</p>}
            {errorReviews && <p>{errorReviews}</p>}
            <ul>
                {reviews.map((review) => (
                    <li key={review.id}>
                        <a href={`/books/${review.book.id}`}>{review.book.title}</a>
                    </li>
                ))}
            </ul>
            {/* TODO: Load more button */}
        </div>
    )
}

export default SharedReviews;