import PageContent from "../components/PageContent";
import { useParams } from 'react-router-dom';
import React from 'react';
import SharedReviews from '../components/Social/SharedReviews'
import FollowUnfollowButton from '../components/Social/FollowUnfollowButton'
import SharedReadingProgress from '../components/Social/SharedReadingProgress'
import Activity from "../components/Social/Activity";
import { useDispatch, useSelector } from 'react-redux';

function HomePage() {
  const { username } = useParams();

  const user = useSelector((state) => state.auth.user);

  return (
    <PageContent title={username ? `Profile of ${username}` : `Welcome back ${user}`}>
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
      {!username &&
        <article className="s12 m6 l6">
            Go to your books
        </article >
      }
      {!username &&
        <article className="s12 m6 l6">
            Add new book
        </article >
      }



    </PageContent>
  )
}

export default HomePage;