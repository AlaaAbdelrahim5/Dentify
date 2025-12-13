import React from 'react';
import { View, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const Select = ({ 
  label, 
  value,
  onValueChange,
  options = [],
  placeholder = 'Select an option',
  error,
  className = '',
  ...props 
}) => {
  return (
    <View className={`mb-4 ${className}`}>
      {label && (
        <Text className="text-sm font-medium text-gray-700 mb-2">
          {label}
        </Text>
      )}
      <View className={`rounded-lg border ${
        error ? 'border-red-300' : 'border-gray-300'
      } bg-white shadow-sm overflow-hidden`}>
        <Picker
          selectedValue={value}
          onValueChange={onValueChange}
          style={{ height: 50 }}
          {...props}
        >
          <Picker.Item label={placeholder} value="" />
          {options.map((option) => (
            <Picker.Item 
              key={option.value} 
              label={option.label} 
              value={option.value} 
            />
          ))}
        </Picker>
      </View>
      {error && (
        <Text className="mt-2 text-sm text-red-600">{error}</Text>
      )}
    </View>
  );
};

export default Select;
