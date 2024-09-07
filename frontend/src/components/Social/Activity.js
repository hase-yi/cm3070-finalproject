import React, { useState, useEffect } from 'react';
import axiosInstance from '../../axiosInstance';  // Axios instance for making API requests
import { useSelector } from 'react-redux';  // Hook to access the Redux store
import { formatDate } from '../../utils/misc';  // Utility function to format dates

function Activity() {
    const [activities, setActivities] = useState([]);  // State to store fetched activities
    const [loadingActivities, setLoadingActivities] = useState(false);  // State to track loading status
    const [errorActivities, setErrorActivities] = useState(null);  // State to store any errors during fetching

    const followedUsers = useSelector((state) => state.following.followedUsers);  // Get the list of followed users from the Redux store

    // useEffect hook to fetch activities when the list of followed users changes
    useEffect(() => {
        if (followedUsers) {
            setLoadingActivities(true);  // Start loading when fetching begins
            setErrorActivities(null);  // Clear any previous errors

            // Fetch activities from the API
            axiosInstance.get(`/activities/`)
                .then((response) => {
                    setActivities(response.data);  // Set the fetched activities in state
                    setLoadingActivities(false);  // Stop loading once data is received
                })
                .catch((err) => {
                    setErrorActivities('An error occurred while fetching the activities.');  // Handle any errors during the API call
                    setLoadingActivities(false);  // Stop loading in case of an error
                });
        }
    }, [followedUsers]);  // Dependency: re-run the effect when the list of followed users changes

    // If no activities were fetched, return nothing
    if (activities.length === 0) {
        return null;
    }

    return (
        <article>
            <h5>Recent Activity</h5>
            {/* Display a loading indicator while activities are being fetched */}
            {loadingActivities && <progress className="circle"></progress>}
            {/* Display an error message if there was an issue fetching activities */}
            {errorActivities && <p className='error'>{errorActivities}</p>}
            {/* Display the fetched activities */}
            {activities.map((activity) => (
                <a className='row wave' key={activity.id} href={`/books/${activity.book.id}`}>  {/* Link to the book's detail page */}
                    <div className='max'>
                        {activity.text}  {/* Display the activity text */}
                    </div>
                    <div>
                        {formatDate(activity.timestamp)}  {/* Format and display the activity timestamp */}
                    </div>
                </a>
            ))}
        </article>
    );
}

export default Activity;  // Export the component as the default export
