import React, { useState, useEffect } from 'react';
import axiosInstance from '../../axiosInstance';
import { formatDate } from '../../utils/misc';

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
            {reviews.map((review) => (
                <a className='row wave' key={review.id} href={`/books/${review.book.id}`}>
                    <div className='max'>
                        {review.book.title}
                    </div>
                    <div>
                        {formatDate(review.date)}
                    </div>
                </a>
            ))}
        </article>
    )
}

export default SharedReviews;