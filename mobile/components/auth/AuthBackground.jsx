import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

const AuthBackground = () => {
  const { isDarkMode } = useTheme();
  return (
    <>
      <View 
        className="absolute rounded-full bg-primary-300" 
        style={{ top: 80, right: 80, width: 288, height: 288, opacity: isDarkMode ? 0.1 : 0.2 }}
      />
      <View 
        className="absolute rounded-full bg-secondary-300" 
        style={{ bottom: 80, left: 80, width: 384, height: 384, opacity: isDarkMode ? 0.1 : 0.2 }}
      />
    </>
  );
};

export default AuthBackground;
