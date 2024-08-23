// src/NavigationLayout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import NavigationListener from './NavigationListener';

const NavigationLayout = () => {
  return (
    <>
      <NavigationListener />
      <Outlet /> 
    </>
  );
}

export default NavigationLayout;
