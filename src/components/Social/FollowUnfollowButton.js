import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { followUser, unfollowUser } from '../../features/followingSlice'; // adjust the import based on your structure

const FollowUnfollowButton = ({ username }) => {
  const dispatch = useDispatch();
  const followedUsers = useSelector((state) => state.following.followedUsers);

  const isFollowed = followedUsers.includes(username);

  const handleFollow = () => {
    if (isFollowed) {
      dispatch(unfollowUser(username));
    } else {
      dispatch(followUser(username));
    }
  };

  return (
    <button onClick={handleFollow}>
      {isFollowed ? 'Unfollow' : 'Follow'}
    </button>
  );
};

export default FollowUnfollowButton;
