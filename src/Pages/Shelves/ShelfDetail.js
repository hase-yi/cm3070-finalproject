import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchShelves } from '../../features/shelfSlice';
import { useParams } from 'react-router-dom';
import ShelfItem from '../../components/ShelfComponents/ShelfItem';

function ShelfDetailPage() {
  const { shelfId } = useParams();
  const dispatch = useDispatch();
  const shelf = useSelector((state) => state.shelves.shelves.find(s => s.id === parseInt(shelfId)));
  const status = useSelector((state) => state.shelves.status);
  const error = useSelector((state) => state.shelves.error);

  useEffect(() => {
    if (!shelf) {
      dispatch(fetchShelves(shelfId));
    }
  }, [dispatch, shelfId, shelf]);

  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'failed') return <div>Error: {error}</div>;

  return (
    <div>
      {shelf && <ShelfItem shelf={shelf} />}
    </div>
  );
}

export default ShelfDetailPage;
