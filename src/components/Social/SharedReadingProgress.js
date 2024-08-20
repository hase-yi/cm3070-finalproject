import React, { useState, useEffect } from 'react';
import axiosInstance from '../../axiosInstance';
import { formatDate } from '../../utils/misc';

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
            {loadingReadingProgresses && <progress className="circle"></progress>}
            {errorReadingProgresses && <p className='error'>{errorReadingProgresses}</p>}
            {readingProgresses.map((progress) => (
                <a className='row wave' key={progress.id} href={`/books/${progress.book.id}`}>
                    <div className='max'>
                        {progress.book.title}
                    </div>
                    <div>
                        {formatDate(progress.timestamp)}
                    </div>
                </a>
            ))}
        </article>
    )
}

export default SharedReadingProgress;