import React, { useEffect, useRef, useState } from 'react';
import Quagga from 'quagga';
import { useNavigate, useLocation } from 'react-router-dom';

const BookScanner = ({ onDetected, cooldown = 500 }) => { // cooldown is in milliseconds
  const scannerRef = useRef(null);
  const [lastDetected, setLastDetected] = useState(0); // Track the time of last detection
  const navigate = useNavigate();
  const location = useLocation(); // Use this to listen to route changes

  useEffect(() => {
      Quagga.init({
        inputStream: {
          type: 'LiveStream',
          target: scannerRef.current, // Use the scannerRef to target the DOM element
          constraints: {
            facingMode: 'environment' // Use the rear camera
          }
        },
        decoder: {
          readers: ['ean_reader'] // Specify the types of barcodes you want to decode
        }
      }, (err) => {
        if (err) {
          console.error(err);
          return;
        }
        Quagga.start();
      });

      Quagga.onDetected(handleDetected);
    

    return () => {
      Quagga.stop();
      Quagga.offDetected(handleDetected);
    };
  }, []);

  const handleDetected = (result) => {
    const now = Date.now();
    if (now - lastDetected < cooldown) {
      // If within cooldown period, ignore detection
      return;
    }
    setLastDetected(now); // Update the time of last detection

    // Call the onDetected prop function and pass the result
    if (onDetected) {
      onDetected(result);
    }
  };

  useEffect(() => {
    return () => {
      Quagga.stop(); // Stop the scanner when component unmounts
    };
  }, []);

  // React to route changes using location
  useEffect(() => {
    Quagga.stop(); // Stop the camera on route change
  }, [location]);


  return (
    <div>
      <div ref={scannerRef} />
    </div>
  );
};

export default BookScanner;
