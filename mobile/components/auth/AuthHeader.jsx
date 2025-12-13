import React from 'react';
import { View, Text } from 'react-native';

const AuthHeader = ({ className = '' }) => {
  return (
    <View className={`items-center mb-8 ${className}`}>
      <Text className="text-4xl font-bold text-primary-600">🦷 Dentify</Text>
      <Text className="mt-4 text-lg text-gray-600 text-center">
        Welcome back! Please sign in to continue.
      </Text>
    </View>
  );
};

export default AuthHeader;
