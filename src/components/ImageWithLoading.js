import React, { useState } from 'react';

const ImageWithLoading = ({ src, alt }) => {
  const [isLoading, setIsLoading] = useState(true);

  // This function will be called when the image is loaded
  const handleImageLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className='responsive medium-height'>
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
          <progress class="circle"></progress>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        onLoad={handleImageLoad}
        className='responsive'
      />
    </div>
  );
};

export default ImageWithLoading;
