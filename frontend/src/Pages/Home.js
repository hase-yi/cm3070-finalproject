import PageContent from "../components/PageContent";  // Import the layout component for page content
import { useParams } from 'react-router-dom';  // Hook to access URL parameters
import React from 'react';
import SharedReviews from '../components/Social/SharedReviews';  // Component to display shared reviews
import FollowUnfollowButton from '../components/Social/FollowUnfollowButton';  // Component for follow/unfollow functionality
import SharedReadingProgress from '../components/Social/SharedReadingProgress';  // Component to display shared reading progress
import Activity from "../components/Social/Activity";  // Component to display user activity
import { useSelector } from 'react-redux';  // Redux hooks to access state
import { Link } from 'react-router-dom';  // Link component to navigate between pages

function HomePage() {
  const { username } = useParams();  // Retrieve the 'username' parameter from the URL if it exists

  const user = useSelector((state) => state.auth.user);  // Get the logged-in user information from Redux store

  return (
    // PageContent is a wrapper that sets the page title and displays the children components
    <PageContent title={username ? `Profile of ${username}` : `Welcome back ${user}`}>
      
      {/* If there's no 'username' in the URL, show the user's own profile with book management links */}
      {!username &&
        <div className="row s12 m12 l12">
          {/* Link to the user's books */}
          <Link to="/books/" className='chip fill'>
            <i>book</i>
            Go to your books
          </Link>
          {/* Link to add a new book */}
          <Link to="/books/new" className='chip fill'>
            <i>add</i>
            Add new book
          </Link>
        </div>
      }

      {/* If 'username' exists in the URL, show the follow/unfollow button for the profile */}
      {username &&
        <div className="s12 m12 l12 row">
          <div className="max">
          </div>
          <div>
            {/* Follow or unfollow the user whose profile is being viewed */}
            <FollowUnfollowButton username={username} />
          </div>
        </div>
      }

      {/* Display shared reviews either for the logged-in user or the profile being viewed */}
      <div className="s12 m6 l6">
        {<SharedReviews username={username ? username : user} />}
      </div>

      {/* Display shared reading progress for the logged-in user or the profile being viewed */}
      <div className="s12 m6 l6">
        {<SharedReadingProgress username={username ? username : user} />}
      </div>

      {/* If no username is provided (i.e., the user is viewing their own homepage), display the activity feed */}
      <div className="s12 m12 l12">
        {!username && <Activity />}
      </div>

    </PageContent>
  )
}

export default HomePage;  // Export the HomePage component as the default export
