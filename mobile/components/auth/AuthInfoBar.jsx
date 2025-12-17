import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const AuthInfoBar = ({ className = '' }) => {
  return (
    <View className={`mt-8 items-center ${className}`}>
      <View className="flex-row items-center bg-white/90 px-6 py-3 rounded-full shadow-md">
        <Link href="/" asChild>
          <TouchableOpacity className="flex-row items-center">
            <Ionicons name="home" size={14} color="#6b7280" />
            <Text className="text-xs text-gray-500 ml-1">Home</Text>
          </TouchableOpacity>
        </Link>
        <Text className="text-xs text-gray-400 mx-3">•</Text>
        <View className="flex-row items-center">
          <Ionicons name="shield-checkmark" size={14} color="#6b7280" />
          <Text className="text-xs text-gray-500 ml-1">Secure Login</Text>
        </View>
        <Text className="text-xs text-gray-400 mx-3">•</Text>
        <View className="flex-row items-center">
          <Ionicons name="chatbubbles" size={14} color="#6b7280" />
          <Text className="text-xs text-gray-500 ml-1">24/7 Support</Text>
        </View>
      </View>
    </View>
  );
};

export default AuthInfoBar;
