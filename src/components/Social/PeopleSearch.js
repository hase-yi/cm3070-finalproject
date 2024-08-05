import { useSearchParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import axiosInstance from '../../axiosInstance';

function PeopleSearch() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const search = searchParams.get('search');

    useEffect(() => {
        if (search) {
            setLoading(true);
            setError(null);

            axiosInstance.get(`/users/`, { params: { search: search } })
                .then((response) => {
                    setSearchResults(response.data);
                    setLoading(false);
                })
                .catch((err) => {
                    setError('An error occurred while fetching the search results.');
                    setLoading(false);
                });
        }
    }, [search]);

    const handleSearch = (e) => {
        const newQuery = e.target.value;
        setSearchParams({ search: newQuery });
    };

    return (
        <div style={{color: "red"}}>
            <input
                type="text"
                placeholder="Search..."
                value={search || ''}
                onChange={handleSearch}
            />
            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}
            <ul>
                {searchResults.map((result) => (
                    <li key={result.username}>
                        <a href={`/profiles/${result.username}`}>{result.username}</a>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default PeopleSearch;
