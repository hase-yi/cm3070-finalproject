import { useSearchParams } from 'react-router-dom';  // Hook to manage the search query in the URL
import React, { useState, useEffect } from 'react';
import axiosInstance from '../../axiosInstance';  // Axios instance for making API requests
import { Link } from 'react-router-dom';  // Component for navigation links
import FollowUnfollowButton from './FollowUnfollowButton';  // Component to follow/unfollow users
import { useSelector } from 'react-redux';  // Hook to access the Redux store

function PeopleSearch() {
    const [searchParams, setSearchParams] = useSearchParams();  // Get and set URL search parameters
    const [searchResults, setSearchResults] = useState([]);  // State to store search results
    const [loading, setLoading] = useState(false);  // State to track loading status
    const [error, setError] = useState(null);  // State to store any errors

    const search = searchParams.get('search');  // Extract the 'search' query parameter from the URL

    // Effect to perform the search when the 'search' query parameter changes
    useEffect(() => {
        if (search) {
            setLoading(true);  // Set loading to true when starting the search
            setError(null);  // Clear any previous errors

            // Make an API call to search for users based on the query parameter
            axiosInstance.get(`/users/`, { params: { search: search } })
                .then((response) => {
                    const users = response.data.filter((u) => u.username !== user);  // Filter out the current logged-in user
                    setSearchResults(users);  // Set the search results in the state
                    setLoading(false);  // Stop loading after fetching data
                })
                .catch((err) => {
                    setError('An error occurred while fetching the search results.');  // Handle any API errors
                    setLoading(false);  // Stop loading in case of an error
                });
        }
    }, [search]);  // Dependency: re-run the effect when the 'search' query parameter changes

    // Handle search input changes and update the URL search parameter
    const handleSearch = (e) => {
        const newQuery = e.target.value;  // Get the new search query
        setSearchParams({ search: newQuery });  // Update the URL with the new search query
    };

    const user = useSelector((state) => state.auth.user);  // Get the logged-in user from the Redux store

    return (
        <>
            {/* Search input field */}
            <div className="field large prefix round fill">
                <i className="front">search</i>
                <input
                    type="text"
                    placeholder="Search users"
                    value={search || ''}  // Bind the search input to the current search query
                    onChange={handleSearch}  // Update the search query on input change
                />
            </div>

            {/* Display a loading indicator while search results are being fetched */}
            {loading && <progress></progress>}

            {/* Display an error message if there was an issue fetching the search results */}
            {error && <p className='error'>{error}</p>}

            {/* Display search results */}
            <div className='grid'>
                {searchResults.map((result) => (
                    <div key={result.username} className='s12 m6 l4'>
                        <article>
                            <h4>{result.username}</h4>
                            <div className='grid'>
                                <div className='s6 m6 l6'>
                                    {/* Link to the user's profile */}
                                    <Link to={`/profiles/${result.username}`} className='responsive'>
                                        <button className='responsive'>
                                            <span>Go To Profile</span>
                                        </button>
                                    </Link>
                                </div>
                                <div className='s6 m6 l6'>
                                    {/* Display the follow/unfollow button for users other than the current logged-in user */}
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

export default PeopleSearch;  // Export the component as the default export
