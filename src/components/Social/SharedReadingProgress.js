import React, { useState, useEffect } from 'react';
import axiosInstance from '../../axiosInstance';


function SharedReadingProgress({ username }) {
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
        <article>
            <h5>Recent Reading Progress</h5>
            {loadingReadingProgresses &&  <progress className="circle"></progress>}
            {errorReadingProgresses && <p className='error'>{errorReadingProgresses}</p>}
            <ul>
                {readingProgresses.map((progress) => (
                    <li key={progress.id}>
                        <a href={`/books/${progress.book.id}`}>{progress.book.title}</a>
                    </li>
                ))}
            </ul>
        </article>
    )
}

export default SharedReadingProgress;