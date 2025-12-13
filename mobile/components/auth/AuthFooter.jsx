import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';

const AuthFooter = ({ 
  text, 
  linkText, 
  linkHref,
  className = '' 
}) => {
  return (
    <View className={`bg-gray-50 p-6 border-t border-gray-100 ${className}`}>
      <View className="flex-row justify-center items-center">
        <Text className="text-sm text-gray-600">
          {text}{' '}
        </Text>
        <Link href={linkHref} asChild>
          <TouchableOpacity>
            <Text className="text-sm font-semibold text-primary-600">
              {linkText}
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
};

export default AuthFooter;
