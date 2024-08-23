import React from 'react';
import { useSelector, useDispatch } from 'react-redux';  // Redux hooks for dispatching actions and selecting state
import { followUser, unfollowUser } from '../../features/followingSlice';  // Actions to follow and unfollow users

const FollowUnfollowButton = ({ username }) => {
  const dispatch = useDispatch();  // Hook to dispatch actions
  const followedUsers = useSelector((state) => state.following.followedUsers);  // Get the list of followed users from the Redux store

  // Determine if the current user is already followed
  const isFollowed = followedUsers.includes(username);

  // Handle the follow/unfollow button click
  const handleFollow = () => {
    if (isFollowed) {
      dispatch(unfollowUser(username));  // Dispatch the action to unfollow the user
    } else {
      dispatch(followUser(username));  // Dispatch the action to follow the user
    }
  };

  return (
    // Render the button with dynamic text based on whether the user is followed or not
    <button onClick={handleFollow}>
      {isFollowed ? 'Unfollow' : 'Follow'}
    </button>
  );
};

export default FollowUnfollowButton;  // Export the component as the default export
