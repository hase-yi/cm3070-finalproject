import React, { useState, useEffect } from 'react';
import axiosInstance from '../../axiosInstance';


function SharedReviews({ username }) {
    const [readingProgresses, setReadingProgresses] = useState([]);
    const [loadingReadingProgresses, setLoadingReadingProgresses] = useState(false);
    const [errorReadingProgresses, setErrorReadingProgresses] = useState(null);

    useEffect(() => {
        if (username) {
            setLoadingReadingProgresses(true);
            setErrorReadingProgresses(null);

            axiosInstance.get(`/reading/`, { params: { username: username } })
                .then((response) => {
                    setReadingProgresses(response.data);
                    setLoadingReadingProgresses(false);
                })
                .catch((err) => {
                    setErrorReadingProgresses('An error occurred while fetching the reviews.');
                    setLoadingReadingProgresses(false);
                });
        }
    }, [username]);

    return (
        <div style={{ background: "white", color: "black" }}>
            <h2>Recent Reviews</h2>
            {loadingReadingProgresses && <p>Loading...</p>}
            {errorReadingProgresses && <p>{errorReadingProgresses}</p>}
            <ul>
                {readingProgresses.map((review) => (
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