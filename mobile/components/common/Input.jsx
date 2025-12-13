import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Input = ({ 
  label, 
  placeholder,
  value,
  onChangeText,
  error,
  icon,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
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
      <View 
        style={[
          styles.inputContainer,
          error ? styles.inputError : styles.inputNormal
        ]}
        className="flex-row items-center rounded-lg bg-white"
      >
        {icon && (
          <View className="pl-3 pr-2">
            <Ionicons name={icon} size={20} color="#9CA3AF" />
          </View>
        )}
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          className="flex-1 py-3 pr-3 text-gray-900"
          style={styles.input}
          {...props}
        />
      </View>
      {error && (
        <Text className="mt-2 text-sm text-red-600">{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputNormal: {
    borderColor: '#d1d5db',
  },
  inputError: {
    borderColor: '#fca5a5',
  },
  input: {
    fontSize: 16,
  },
});

export default Input;
