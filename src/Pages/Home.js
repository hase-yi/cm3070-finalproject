import PageContent from "../components/PageContent";
import { useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import axiosInstance from '../axiosInstance';
import SharedReviews from '../components/Social/SharedReviews'
import FollowUnfollowButton from '../components/Social/FollowUnfollowButton'
import SharedReadingProgress from '../components/Social/SharedReadingProgress'
import { useDispatch, useSelector } from 'react-redux';

function HomePage() {
  const { username } = useParams();

	const user = useSelector((state) => state.auth.user);

  return (
    <PageContent title="Welcome">
      <h1>Profile of {username}</h1>

      <p>Browse your personal library </p>
      {username && <FollowUnfollowButton username={username}/>}
      {/* Show all recent reviews, comments and reading progress that is shared, clicking o them leads to that section in the respective book */}
      
      {<SharedReviews username={username ? username : user}/>}
      {<SharedReadingProgress username={username ? username : user}/>}
    </PageContent>
  )
}

export default HomePage;