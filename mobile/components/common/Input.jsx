import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

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
  const { isDarkMode } = useTheme();
  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, isDarkMode && styles.labelDark]}>
          {label}
        </Text>
      )}
      <View 
        style={[
          styles.inputContainer,
          isDarkMode && styles.inputContainerDark,
          error ? styles.inputError : styles.inputNormal
        ]}
      >
        {icon && (
          <View style={styles.iconContainer}>
            <Ionicons name={icon} size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
          </View>
        )}
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={isDarkMode ? '#6B7280' : '#9CA3AF'}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          style={[styles.input, isDarkMode && styles.inputDark]}
          {...props}
        />
      </View>
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  labelDark: {
    color: '#D1D5DB',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1.5,
    shadowColor: '#14b8a6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  inputContainerDark: {
    backgroundColor: '#374151',
    borderColor: '#4B5563',
  },
  inputNormal: {
    borderColor: '#99F6E4',
  },
  inputError: {
    borderColor: '#FCA5A5',
    shadowColor: '#EF4444',
  },
  iconContainer: {
    paddingLeft: 14,
    paddingRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingRight: 14,
    fontSize: 16,
    color: '#111827',
  },
  inputDark: {
    color: '#F3F4F6',
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    color: '#dc2626',
  },
});

export default Input;
