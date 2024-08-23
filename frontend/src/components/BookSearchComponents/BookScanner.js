import React, { useEffect, useRef, useState } from 'react';
import Quagga from 'quagga';  // Import Quagga for barcode scanning
import { useNavigate, useLocation } from 'react-router-dom';  // Hooks for navigation and listening to route changes

const BookScanner = ({ onDetected, cooldown = 500 }) => {  // cooldown sets the time limit between detections
  const scannerRef = useRef(null);  // Create a ref to attach the scanner to a DOM element
  const [lastDetected, setLastDetected] = useState(0);  // State to track the last time a barcode was detected
  const navigate = useNavigate();  // Hook to programmatically navigate between routes
  const location = useLocation();  // Hook to listen to route changes

  // Initialize the barcode scanner using Quagga
  useEffect(() => {
      Quagga.init({
        inputStream: {
          type: 'LiveStream',  // Use the live camera stream
          target: scannerRef.current,  // Target the DOM element where the camera stream should display
          constraints: {
            facingMode: 'environment'  // Use the rear camera on mobile devices
          }
        },
        decoder: {
          readers: ['ean_reader']  // Specify the barcode type (EAN) to be decoded
        }
      }, (err) => {
        if (err) {
          console.error(err);  // Log any initialization errors
          return;
        }
        Quagga.start();  // Start the barcode scanner
      });

      // Register the detection handler
      Quagga.onDetected(handleDetected);

    // Cleanup the scanner on component unmount
    return () => {
      Quagga.stop();  // Stop the scanner
      Quagga.offDetected(handleDetected);  // Remove the detection handler
    };
  }, []);

  // Handle barcode detection events
  const handleDetected = (result) => {
    const now = Date.now();
    if (now - lastDetected < cooldown) {
      // Ignore detection if it's within the cooldown period
      return;
    }
    setLastDetected(now);  // Update the last detection timestamp

    // Call the onDetected callback function passed as a prop
    if (onDetected) {
      onDetected(result);  // Pass the detection result to the parent component
    }
  };

  // Cleanup the scanner on component unmount
  useEffect(() => {
    return () => {
      Quagga.stop();  // Stop the scanner when the component unmounts
    };
  }, []);

  // React to route changes and stop the scanner when navigating away
  useEffect(() => {
    Quagga.stop();  // Stop the scanner on route change
  }, [location]);  // Re-run this effect when the location changes

  return (
    <div>
      {/* The scanner will display inside this div */}
      <div ref={scannerRef} />
    </div>
  );
};

export default BookScanner;  // Export the BookScanner component as the default export
