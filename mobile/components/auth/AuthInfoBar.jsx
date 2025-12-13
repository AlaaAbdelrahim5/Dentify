import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';

const AuthInfoBar = ({ className = '' }) => {
  return (
    <View className={`mt-8 items-center ${className}`}>
      <View className="flex-row bg-white bg-opacity-80 px-6 py-3 rounded-full shadow-md">
        <Link href="/" asChild>
          <TouchableOpacity className="flex-row items-center">
            <Text className="text-xs text-gray-500">🏠 Home</Text>
          </TouchableOpacity>
        </Link>
        <Text className="text-xs text-gray-500 mx-3">•</Text>
        <Text className="text-xs text-gray-500">🔒 Secure Login</Text>
        <Text className="text-xs text-gray-500 mx-3">•</Text>
        <Text className="text-xs text-gray-500">💬 24/7 Support</Text>
      </View>
    </View>
  );
};

export default AuthInfoBar;
