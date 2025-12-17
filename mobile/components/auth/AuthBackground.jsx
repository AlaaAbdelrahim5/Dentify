import React from 'react';
import { View } from 'react-native';

const AuthBackground = () => {
  return (
    <>
      <View 
        className="absolute rounded-full opacity-20 bg-primary-300" 
        style={{ top: 80, right: 80, width: 288, height: 288 }}
      />
      <View 
        className="absolute rounded-full opacity-20 bg-secondary-300" 
        style={{ bottom: 80, left: 80, width: 384, height: 384 }}
      />
    </>
  );
};

export default AuthBackground;
