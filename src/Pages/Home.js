import PageContent from "../components/PageContent";
import { useParams } from 'react-router-dom';
import React from 'react';
import SharedReviews from '../components/Social/SharedReviews'
import FollowUnfollowButton from '../components/Social/FollowUnfollowButton'
import SharedReadingProgress from '../components/Social/SharedReadingProgress'
import Activity from "../components/Social/Activity";
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

function HomePage() {
  const { username } = useParams();

  const user = useSelector((state) => state.auth.user);

  return (
    <PageContent title={username ? `Profile of ${username}` : `Welcome back ${user}`}>
      {!username &&
        <div className="row s12 m12 l12">
          <Link to="/books/" className='chip fill'>
            <i>book</i>
            Go to your books
          </Link>
          <Link to="/books/new" className='chip fill'>
            <i>add</i>
            Add new book
          </Link>
        </div>
      }

      {username &&
        <div className="s12 m12 l12 row">
          <div className="max">
          </div>
          <div>
            <FollowUnfollowButton username={username} />
          </div>

        </div>
      }

      <div className="s12 m6 l6">
        {<SharedReviews username={username ? username : user} />}
      </div>
      <div className="s12 m6 l6">
        {<SharedReadingProgress username={username ? username : user} />}
      </div>
      <div className="s12 m12 l12">
        {!username && <Activity />}
      </div>

    </PageContent>
  )
}

export default HomePage;