import React from 'react';
import { View, Text } from 'react-native';
import Logo from '../common/Logo';

const AuthHeader = ({ message, className = '' }) => {
  return (
    <View className={`items-center mb-8 ${className}`}>
      <Logo size="lg" />
      {message && (
        <Text className="mt-4 text-lg text-gray-600 text-center">
          {message}
        </Text>
      )}
    </View>
  );
};

export default AuthHeader;
