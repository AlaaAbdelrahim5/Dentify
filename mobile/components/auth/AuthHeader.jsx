import React from 'react';
import { View, Text } from 'react-native';
import Logo from '../common/Logo';
import { useTheme } from '../../contexts/ThemeContext';

const AuthHeader = ({ message, className = '' }) => {
  const { isDarkMode } = useTheme();
  return (
    <View className={`items-center mb-8 ${className}`}>
      <Logo size="lg" />
      {message && (
        <Text className={`mt-4 text-lg text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {message}
        </Text>
      )}
    </View>
  );
};

export default AuthHeader;
