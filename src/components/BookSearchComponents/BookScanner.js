import React, { useEffect, useRef, useState } from 'react';
import Quagga from 'quagga';
import classes from './BookScanner.module.css';

const BookScanner = ({ onDetected }) => {
  const scannerRef = useRef(null);
  const [scannerError, setScannerError] = useState('');

  useEffect(() => {
    Quagga.init({
      inputStream: {
        type: 'LiveStream',
        target: scannerRef.current,
        constraints: {
          width: 640,
          height: 480,
          facingMode: 'environment',
        },
      },
      decoder: {
        readers: ['ean_reader'],
      },
    }, (err) => {
      if (err) {
        console.error(err);
        setScannerError('Error initializing scanner: ' + err.message);
        return;
      }
      Quagga.start();
    });

    Quagga.onDetected(onDetected);

    return () => {
      Quagga.stop();
      Quagga.offDetected(onDetected);
    };
  }, [onDetected]);

  return (
    <div className={classes.scannerContainer} ref={scannerRef}>
      {scannerError && <div className={classes.errorMessage}>{scannerError}</div>}
    </div>
  );
};

export default BookScanner;
