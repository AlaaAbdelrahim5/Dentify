import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PasswordInput = ({ 
  label, 
  placeholder,
  value,
  onChangeText,
  error,
  showStrength = false,
  className = '',
  ...props 
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const calculatePasswordStrength = () => {
    if (!value) return { strength: 0, text: '', color: 'bg-gray-200' };
    
    let strength = 0;
    if (value.length >= 8) strength++;
    if (value.length >= 12) strength++;
    if (/[a-z]/.test(value) && /[A-Z]/.test(value)) strength++;
    if (/[0-9]/.test(value)) strength++;
    if (/[^A-Za-z0-9]/.test(value)) strength++;

    const levels = [
      { strength: 1, text: 'Very Weak', color: 'bg-red-500' },
      { strength: 2, text: 'Weak', color: 'bg-orange-500' },
      { strength: 3, text: 'Fair', color: 'bg-yellow-500' },
      { strength: 4, text: 'Good', color: 'bg-blue-500' },
      { strength: 5, text: 'Strong', color: 'bg-green-500' },
    ];

    return levels.find(level => level.strength === strength) || levels[0];
  };

  const strengthInfo = calculatePasswordStrength();

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
        <View className="pl-3 pr-2">
          <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
        </View>
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!showPassword}
          className="flex-1 py-3 text-gray-900"
          style={styles.input}
          {...props}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          className="px-3 py-3"
        >
          <Ionicons 
            name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
            size={20} 
            color="#9CA3AF" 
          />
        </TouchableOpacity>
      </View>
      
      {showStrength && value && (
        <View className="mt-2">
          <View className="flex-row items-center">
            <View className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <View 
                style={[
                  styles.strengthBar,
                  { width: `${(strengthInfo.strength / 5) * 100}%` },
                  { backgroundColor: getStrengthColor(strengthInfo.strength) }
                ]}
              />
            </View>
            <Text className="ml-2 text-xs text-gray-600">
              {strengthInfo.text}
            </Text>
          </View>
        </View>
      )}
      
      {error && (
        <Text className="mt-2 text-sm text-red-600">{error}</Text>
      )}
    </View>
  );
};

const getStrengthColor = (strength) => {
  const colors = {
    1: '#ef4444', // red
    2: '#f97316', // orange
    3: '#eab308', // yellow
    4: '#3b82f6', // blue
    5: '#10b981', // green
  };
  return colors[strength] || '#e5e7eb';
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
  strengthBar: {
    height: 8,
  },
});

export default PasswordInput;
