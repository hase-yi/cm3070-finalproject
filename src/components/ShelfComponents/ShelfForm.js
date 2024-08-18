import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    createShelf,
    updateShelf,
    deleteShelf,
} from '../../features/shelfSlice';
import axiosInstance from '../../axiosInstance';

function ShelfForm({ method, shelf }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [imageFile, setImageFile] = useState(null);
    const [previewImage, setPreviewImage] = useState(shelf ? shelf.image : null);
    const [shelfId, setShelfId] = useState(shelf ? shelf.id : null);
    const [shelfData, setShelfData] = useState({
        title: shelf ? shelf.title : '',
        description: shelf ? shelf.description : '',
        image: shelf ? shelf.image : '',
    });

    const status = useSelector((state) => state.shelves.status);
    const error = useSelector((state) => state.shelves.error);
    const validationErrors = useSelector(
        (state) => state.shelves.validationErrors
    );

    const isSubmitting = status === 'loading';

    const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const updatedShelfData = {
            title: formData.get('title'),
            description: formData.get('description'),
            image: shelfData.image, // Placeholder, the actual image will be uploaded after
        };

        try {
            let result;
            if (method === 'POST') {
                result = await dispatch(createShelf(updatedShelfData)).unwrap();
                setShelfId(result.id); // Get the new shelf ID from the result
            } else if (method === 'PUT' && shelf) {
                result = await dispatch(
                    updateShelf({ id: shelf.id, updatedShelf: updatedShelfData })
                ).unwrap();
                setShelfId(shelf.id); // Use the existing shelf ID
            }

            if (imageFile) {
                const imageUrl = await uploadImage(result.id || shelf.id); // Upload image after form submission
                await updateShelfWithImage(result.id || shelf.id, {
                    ...updatedShelfData,
                    image: imageUrl,
                }); // Update shelf with the image URL
            }

            navigate('/shelves');
        } catch (err) {
            console.error('Failed to save shelf:', err);
        }
    };

    const handleDelete = async (shelfId) => {
        try {
            dispatch(deleteShelf(shelfId));
            navigate('/shelves');
        } catch (err) {
            console.error('Failed to delete shelf:', err);
        }
    };

    const handleFileChange = (file) => {
        setImageFile(file); // Set the selected image file
        setPreviewImage(URL.createObjectURL(file)); // Set the preview image URL
    };

    const uploadImage = async (shelfId) => {
        const formData = new FormData();
        formData.append('file', imageFile);
        formData.append('shelf', shelfId);

        try {
            const response = await axiosInstance.post('/upload/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data.file; // Assuming the image URL is returned in the `file` field
        } catch (err) {
            console.error('Failed to upload image:', err);
            throw err;
        }
    };

    const updateShelfWithImage = async (shelfId, updatedShelfData) => {
        try {
            await dispatch(
                updateShelf({
                    id: shelfId,
                    updatedShelf: updatedShelfData,
                })
            ).unwrap();
        } catch (err) {
            console.error('Failed to update shelf with image URL:', err);
        }
    };

    return (
        <article className='no-padding'>
            <form onSubmit={handleSubmit}>
                <div className='grid no-space'>
                    <div className='s6'>
                        {previewImage && (
                            <img src={previewImage} alt="Image Preview" className="responsive large-height" />
                        )}
                        <div className='padding'>
                            <div className="field label prefix border responsive">
                                <i>attach_file</i>
                                <input
                                    type="file"
                                    id="imageUpload"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e.target.files[0])}
                                />
                                <input type="text" />
                                <label>Shelf Image</label>
                            </div>
                        </div>

                    </div>
                    <div className='s6'>
                        <div className='padding'>
                            {error && <p className="error">{error}</p>}
                            {validationErrors && (
                                <ul>
                                    {Object.entries(validationErrors).map(([field, errors]) =>
                                        errors.map((error, index) => (
                                            <li key={`${field}-${index}`}>{`${field}: ${error}`}</li>
                                        ))
                                    )}
                                </ul>
                            )}
                            <div className="field label border">
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    required
                                    defaultValue={shelfData.title}
                                />
                                <label>Shelf Name</label>
                            </div>

                            <div className="field border label textarea">
                                <textarea
                                    id="description"
                                    name="description"
                                    rows="5"
                                    required
                                    defaultValue={shelfData.description}
                                ></textarea>
                                <label>Description</label>
                            </div>



                        </div>
                    </div>
                    <div className='s12'>
                        <div className='padding'>
                            <hr className='medium'></hr>
                            <div className='row'>
                                <div className='max'></div>
                                {shelf && (
                                    <button
                                        onClick={() => handleDelete(shelf.id)}
                                        type="button"
                                        disabled={isSubmitting}
                                        className='error'>
                                        <i>delete</i>
                                        <span>Delete</span>
                                    </button>
                                )}
                                <button
                                    onClick={() => navigate('..')}
                                    label="Cancel"
                                    type="button"
                                    disabled={isSubmitting}
                                >
                                    <i>undo</i>
                                    <span>Cancel</span>
                                </button>
                                <button
                                    label={isSubmitting ? 'Submitting' : 'Save'}
                                    type="submit"
                                    disabled={isSubmitting}
                                >
                                    <i>save</i>
                                    <span>Save</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </article>


    );
}

export default ShelfForm;
