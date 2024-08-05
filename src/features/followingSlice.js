import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../axiosInstance';


// Thunk to fetch all followed users
export const fetchFollowedUsers = createAsyncThunk('following/fetchFollowedUsers', async () => {
  const response = await axiosInstance.get('users/?relationship=followed');
  return response.data;
});

export const fetchFollowers = createAsyncThunk('following/fetchFollowers', async () => {
  const response = await axiosInstance.get('users/?relationship=followers');
  return response.data;
});

// Thunk to create a new shelf
export const followUser = createAsyncThunk('following/followUser', async (username, { rejectWithValue }) => {
  try {
    console.log(username)

    const response = await axiosInstance.post(`users/follow/${username}/`, username);
    return username;
  } catch (error) {
    if (!error.response) {
      throw error;
    }
    return rejectWithValue(error.response.data);
  }
});


// Thunk to delete a shelf
export const unfollowUser = createAsyncThunk('following/unfollowUser', async (username, { rejectWithValue }) => {
  try {

    await axiosInstance.delete(`users/follow/${username}/`);
    return username; // Ensure the returned id is correct
  } catch (error) {
    if (!error.response) {
      throw error;
    }
    return rejectWithValue(error.response.data);
  }
});


const followingSlice = createSlice({
  name: 'following',
  initialState: {
    followedUsers: [],
    followers: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFollowedUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.followedUsers = action.payload;
      })
      .addCase(fetchFollowers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.followers = action.payload;
      })
      .addCase(unfollowUser.fulfilled, (state, action) => {
        state.followedUsers = state.followedUsers.filter((username_stored) => username_stored !== action.payload);
      })
      .addCase(followUser.fulfilled, (state, action) => {
        state.followedUsers.push(action.payload)
      })
  },
});

export default followingSlice.reducer;
