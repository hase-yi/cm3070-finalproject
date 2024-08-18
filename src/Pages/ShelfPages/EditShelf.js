import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchShelf } from '../../features/shelfSlice';
import ShelfForm from '../../components/ShelfComponents/ShelfForm';

function EditShelfPage() {
  const { shelfId } = useParams();
  const dispatch = useDispatch();
  const shelf = useSelector((state) =>
    state.shelves.shelves.find((shelf) => shelf.id === parseInt(shelfId))
  );
  const status = useSelector((state) => state.shelves.status);
  const error = useSelector((state) => state.shelves.error);

  useEffect(() => {
    if (!shelf) {
      dispatch(fetchShelf(shelfId));
    }
  }, [dispatch, shelfId, shelf]);

  if (status === 'loading') return <progress className="circle"></progress>;
  if (status === 'failed') return <p className='error'>{error}</p>;

  return (
    <div>
      <h3>Edit {shelf.title}</h3>
      {shelf && <ShelfForm method="PUT" shelf={shelf} />}
    </div>
  );
}

export default EditShelfPage;
