import classes from './ReadingProgress.module.css';


const ReadingProgress = ({book}) => {
  
  
  return (
    <div className={classes.progressContainer}>
      <h2>Reading Progress</h2>
      {book.reading_progress ? (
        <>
          <p>Current Page: {book.reading_progress.current_page}</p>

          <p>Progress: {book.reading_progress.percentage.toFixed(2)}%</p>
          <div className={classes.progressBar}>
            <div className={classes.progress} style={{ width: `${book.reading_progress.percentage}%` }}></div>
          </div>
        </>
      ) : (
        <p>No reading progress available</p>
      )}
    </div>
  );
};

export default ReadingProgress;