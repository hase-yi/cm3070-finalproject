import {useEffect}from 'react';
import classes from './ReadingProgress.module.css';
import { useDispatch, useSelector } from 'react-redux';
import {fetchReadingProgress} from '../../features/readingProgressSlice'

const ReadingProgress = ({bookId, totalPages}) => {
  const dispatch = useDispatch();
  const readingProgress = useSelector((state)=>state.readingProgress.readingProgress)
  console.log("readingProgress is:",  readingProgress)
  const currentProgress = readingProgress.find((progress)=>progress.book.id === bookId)
  console.log("Filtered Progress is:", currentProgress )

  const status = useSelector((state) => state.readingProgress.status);
  const error = useSelector((state) => state.readingProgress.error);


  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchReadingProgress(bookId));
    }
  }, [status, dispatch, bookId]);

  if(status === 'loading'){
    return <div>Loading progress...</div>;
  }
  if(status === 'failed'){
    return <div>Error fetching progress: {error}</div>;
  }

  return (
    <div className={classes.progress}>
      <h2>Reading Progress</h2>
      {readingProgress ? (
        <>
          <p>Current Page: {readingProgress.current_page}</p>
          <p>Total Pages: {totalPages}</p>
          <p>Progress: {((readingProgress.current_page / totalPages) * 100).toFixed(2)}%</p>
        </>
      ) : (
        <p>No reading progress available</p>
      )}
    </div>
  );
};

export default ReadingProgress;