import React, { useState, useEffect } from 'react';
import axiosInstance from '../../axiosInstance';
import { useSelector } from 'react-redux';


function Activity() {
    const [activities, setActivities] = useState([]);
    const [loadingActivities, setLoadingActivities] = useState(false);
    const [errorActivities, setErrorActivities] = useState(null);

    const followedUsers = useSelector((state) => state.following.followedUsers);

    useEffect(() => {
        if (followedUsers) {
            setLoadingActivities(true);
            setErrorActivities(null);

            axiosInstance.get(`/activities/`)
                .then((response) => {
                    setActivities(response.data);
                    setLoadingActivities(false);
                })
                .catch((err) => {
                    setErrorActivities('An error occurred while fetching the activities.');
                    setLoadingActivities(false);
                });
        }
    }, [followedUsers]);

    return (
        <div style={{ background: "white", color: "black" }}>
            <h2>Recent Activity</h2>
            {loadingActivities && <p>Loading...</p>}
            {errorActivities && <p>{errorActivities}</p>}
            <ul>
                {activities.map((activity) => (
                    <li key={activity.id}>
                        <a href={`${activity.backlink}`}>{activity.text}</a>
                    </li>
                ))}
            </ul>
            {/* TODO: Load more button */}
        </div>
    )
}

export default Activity;