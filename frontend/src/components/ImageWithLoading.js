import React, { useState } from 'react';

const ImageWithLoading = ({ src, alt, height = 'medium-height' }) => {
  const [isLoading, setIsLoading] = useState(true);  // State to track whether the image is still loading

  // This function is called when the image has successfully loaded
  const handleImageLoad = () => {
    setIsLoading(false);  // Set loading to false once the image has finished loading
  };

  return (
    <div className={`responsive ${height}`}>  {/* Responsive container with an optional height class */}
      {/* Display a loading spinner while the image is loading */}
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {/* Circular loading indicator */}
          <progress className="circle"></progress>
        </div>
      )}
      {/* The image element that triggers the onLoad event once the image is loaded */}
      <img
        src={src}  // The image source URL
        alt={alt}  // Alt text for accessibility
        onLoad={handleImageLoad}  // Callback when the image is fully loaded
        className='responsive'  // Responsive image class
      />
    </div>
  );
};

export default ImageWithLoading;  // Export the component as the default export
