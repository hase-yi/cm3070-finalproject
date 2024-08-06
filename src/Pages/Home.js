import PageContent from "../components/PageContent";
import { useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import axiosInstance from '../axiosInstance';
import SharedReviews from '../components/Social/SharedReviews'
import FollowUnfollowButton from '../components/Social/FollowUnfollowButton'
import SharedReadingProgress from '../components/Social/SharedReadingProgress'

function HomePage() {
  const { username } = useParams();
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [errorReviews, setErrorreviews] = useState(null);

  useEffect(() => {
    if (username) {
      setLoadingReviews(true);
      setErrorreviews(null);

      axiosInstance.get(`/reviews/`, { params: { username: username } })
        .then((response) => {
          setReviews(response.data);
          setLoadingReviews(false);
        })
        .catch((err) => {
          setErrorreviews('An error occurred while fetching the reviews.');
          setLoadingReviews(false);
        });
    }
  }, [username]);

  return (
    <PageContent title="Welcome">
      <h1>Profile of {username}</h1>

      <p>Browse your personal library </p>
      {username && <FollowUnfollowButton username={username}/>}
      {/* Show all recent reviews, comments and reading progress that is shared, clicking o them leads to that section in the respective book */}
      
      {username && <SharedReviews username={username}/>}
      {username && <SharedReadingProgress username={username}/>}
    </PageContent>
  )
}

export default HomePage;