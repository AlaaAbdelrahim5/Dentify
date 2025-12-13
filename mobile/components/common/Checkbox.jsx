import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Checkbox = ({ 
  checked,
  onPress,
  label,
  error,
  className = '',
}) => {
  return (
    <View className={className}>
      <TouchableOpacity 
        onPress={onPress}
        className="flex-row items-center"
      >
        <View className={`w-5 h-5 rounded border-2 mr-2 items-center justify-center ${
          checked ? 'bg-primary-600 border-primary-600' : 'border-gray-300'
        }`}>
          {checked && (
            <Ionicons name="checkmark" size={14} color="white" />
          )}
        </View>
        {label && (
          <Text className="text-sm text-gray-600">{label}</Text>
        )}
      </TouchableOpacity>
      {error && (
        <Text className="mt-2 text-sm text-red-600">{error}</Text>
      )}
    </View>
  );
};

export default Checkbox;
