// NavigationListener.js
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import navigateEmitter from './navigateEmitter'; // Adjust the import path

const NavigationListener = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleNavigate = (path) => {
            navigate(path);
        };

        navigateEmitter.on('navigate', handleNavigate);
        
        return () => {
            navigateEmitter.off('navigate', handleNavigate);
        };
    }, [navigate]);

    return null;
};

export default NavigationListener;
