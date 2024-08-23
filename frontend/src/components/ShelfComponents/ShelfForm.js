import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';  // Hooks to dispatch actions and access Redux store state
import { useNavigate } from 'react-router-dom';  // Hook to programmatically navigate between routes
import {
    createShelf,
    updateShelf,
    deleteShelf,
} from '../../features/shelfSlice';  // Redux actions for shelf operations
import axiosInstance from '../../axiosInstance';  // Axios instance for API calls

function ShelfForm({ method, shelf }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [imageFile, setImageFile] = useState(null);  // State for the selected image file
    const [previewImage, setPreviewImage] = useState(shelf ? shelf.image : null);  // State for image preview
    const [shelfId, setShelfId] = useState(shelf ? shelf.id : null);  // State for shelf ID
    const [shelfData, setShelfData] = useState({
        title: shelf ? shelf.title : '',
        description: shelf ? shelf.description : '',
        image: shelf ? shelf.image : '',
    });  // State for shelf data (title, description, image)

    const status = useSelector((state) => state.shelves.status);  // Get the loading status from Redux store
    const error = useSelector((state) => state.shelves.error);  // Get error messages from Redux store
    const validationErrors = useSelector((state) => state.shelves.validationErrors);  // Get validation errors from Redux store

    const isSubmitting = status === 'loading';  // Check if the form is currently submitting

    // Handle form submission (create or update shelf)
    const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);  // Create a FormData object to extract form inputs
        const updatedShelfData = {
            title: formData.get('title'),
            description: formData.get('description'),
            image: shelfData.image,  // Placeholder, image will be uploaded separately
        };

        try {
            let result;
            if (method === 'POST') {
                // Create a new shelf
                result = await dispatch(createShelf(updatedShelfData)).unwrap();
                setShelfId(result.id);  // Get the new shelf ID from the result
            } else if (method === 'PUT' && shelf) {
                // Update an existing shelf
                result = await dispatch(
                    updateShelf({ id: shelf.id, updatedShelf: updatedShelfData })
                ).unwrap();
                setShelfId(shelf.id);  // Use the existing shelf ID
            }

            // If an image file is selected, upload it after the form submission
            if (imageFile) {
                const imageUrl = await uploadImage(result.id || shelf.id);  // Upload image
                await updateShelfWithImage(result.id || shelf.id, {
                    ...updatedShelfData,
                    image: imageUrl,  // Update shelf with the uploaded image URL
                });
            }

            navigate('/shelves');  // Redirect to shelves list after saving
        } catch (err) {
            console.error('Failed to save shelf:', err);
        }
    };

    // Handle shelf deletion
    const handleDelete = async (shelfId) => {
        try {
            dispatch(deleteShelf(shelfId));  // Dispatch the delete shelf action
            navigate('/shelves');  // Navigate back to shelves list after deletion
        } catch (err) {
            console.error('Failed to delete shelf:', err);
        }
    };

    // Handle image file selection
    const handleFileChange = (file) => {
        setImageFile(file);  // Set the selected image file
        setPreviewImage(URL.createObjectURL(file));  // Show a preview of the selected image
    };

    // Upload the image to the server
    const uploadImage = async (shelfId) => {
        const formData = new FormData();
        formData.append('file', imageFile);  // Append the image file to the form data
        formData.append('shelf', shelfId);  // Append the shelf ID to the form data

        try {
            const response = await axiosInstance.post('/upload/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data.file;  // Return the image URL from the response
        } catch (err) {
            console.error('Failed to upload image:', err);
            throw err;
        }
    };

    // Update the shelf with the uploaded image URL
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
                        {/* Show image preview if available */}
                        {previewImage && (
                            <img src={previewImage} alt="Image Preview" className="responsive large-height" />
                        )}
                        <div className='padding'>
                            {/* Image upload input field */}
                            <div className="field label prefix border responsive">
                                <i>attach_file</i>
                                <input
                                    type="file"
                                    id="imageUpload"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e.target.files[0])}  // Handle file change
                                />
                                <input type="text" />
                                <label>Shelf Image</label>
                            </div>
                        </div>
                    </div>
                    <div className='s6'>
                        <div className='padding'>
                            {/* Display any form-level errors */}
                            {error && <p className="error">{error}</p>}
                            {validationErrors && (
                                <ul>
                                    {/* Display field-specific validation errors */}
                                    {Object.entries(validationErrors).map(([field, errors]) =>
                                        errors.map((error, index) => (
                                            <li key={`${field}-${index}`}>{`${field}: ${error}`}</li>
                                        ))
                                    )}
                                </ul>
                            )}
                            {/* Shelf title input field */}
                            <div className="field label border">
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    required
                                    defaultValue={shelfData.title}  // Set the default value for title
                                />
                                <label>Shelf Name</label>
                            </div>

                            {/* Shelf description input field */}
                            <div className="field border label textarea">
                                <textarea
                                    id="description"
                                    name="description"
                                    rows="5"
                                    required
                                    defaultValue={shelfData.description}  // Set the default value for description
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
                                {/* Delete button (only for existing shelves) */}
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
                                {/* Cancel button */}
                                <button
                                    onClick={() => navigate('..')}
                                    label="Cancel"
                                    type="button"
                                    disabled={isSubmitting}
                                >
                                    <i>undo</i>
                                    <span>Cancel</span>
                                </button>
                                {/* Save button */}
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

export default ShelfForm;  // Export the ShelfForm component as the default export
