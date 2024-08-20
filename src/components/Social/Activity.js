import React, { useState, useEffect } from 'react';
import axiosInstance from '../../axiosInstance';
import { useSelector } from 'react-redux';
import { formatDate } from '../../utils/misc';

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

    if (activities.length == 0) {
        return 
    }

    return (
        <article>
            <h5>Recent Activity</h5>
            {loadingActivities && <progress className="circle"></progress>}
            {errorActivities && <p className='error'>{errorActivities}</p>}
                {activities.map((activity) => (
                    <a className='row wave' key={activity.id} href={`/books/${activity.book}`}>
                    <div className='max'>
                        {activity.text}
                    </div>
                    <div>
                        {formatDate(activity.timestamp)}
                    </div>
                    </a>
                ))}
        </article>
    )
}

export default Activity;