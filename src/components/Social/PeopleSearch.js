import { useSearchParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import axiosInstance from '../../axiosInstance';
import { Link } from 'react-router-dom';
import FollowUnfollowButton from './FollowUnfollowButton';
import { useSelector } from 'react-redux';

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
                    const users = response.data.filter((u) => u.username !== user)
                    setSearchResults(users);
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

    const user = useSelector((state) => state.auth.user);

    return (
        <>
            <div className="field large prefix round fill">
                <i className="front">search</i>
                <input
                    type="text"
                    placeholder="Search users"
                    value={search || ''}
                    onChange={handleSearch}
                />
            </div>
            {loading && <progress></progress>}
            {error && <p className='error'>{error}</p>}
            <div className='grid'>

                {searchResults.map((result) => (
                    <div key={result.username} className='s12 m6 l4' >
                        <article>
                            <h4>{result.username}</h4>
                            <div className='grid'>
                                <div className='s6 m6 l6'>
                                    <Link to={`/profiles/${result.username}`} className='responsive'>
                                        <button className='responsive'>
                                            <span>Go To Profile</span>
                                        </button>
                                    </Link>
                                </div>
                                <div className='s6 m6 l6'>
                                    {result.username !== user && <FollowUnfollowButton username={result.username} />}
                                </div>
                            </div>
                        </article>
                    </div>
                ))}
            </div>
        </>
    );
}

export default PeopleSearch;
