import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '../../contexts/ThemeContext';

const Select = ({ 
  label, 
  value,
  onValueChange,
  options = [],
  items = [],
  placeholder = 'Select an option',
  error,
  className = '',
  ...props 
}) => {
  const { isDarkMode } = useTheme();
  // Support both 'options' and 'items' prop names
  const selectOptions = items.length > 0 ? items : options;
  
  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, isDarkMode && styles.labelDark]}>
          {label}
        </Text>
      )}
      <View style={[
        styles.pickerContainer,
        isDarkMode && styles.pickerContainerDark,
        error ? styles.pickerError : styles.pickerNormal
      ]}>
        <Picker
          selectedValue={value}
          onValueChange={onValueChange}
          style={[styles.picker, isDarkMode && styles.pickerDark]}
          itemStyle={styles.pickerItem}
          dropdownIconColor={isDarkMode ? '#9CA3AF' : '#6b7280'}
          {...props}
        >
          <Picker.Item label={placeholder} value="" enabled={false} color="#9CA3AF" />
          {selectOptions.map((option) => (
            <Picker.Item 
              key={option.key || option.value} 
              label={option.label} 
              value={option.value}
              color={isDarkMode ? '#F3F4F6' : '#111827'}
            />
          ))}
        </Picker>
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
  pickerContainer: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    backgroundColor: '#ffffff',
    shadowColor: '#14b8a6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  pickerContainerDark: {
    backgroundColor: '#374151',
    borderColor: '#4B5563',
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#111827',
  },
  pickerDark: {
    color: '#F3F4F6',
  },
  pickerItem: {
    fontSize: 16,
    height: 50,
    color: '#111827',
  },
  pickerNormal: {
    borderColor: '#99F6E4',
  },
  pickerError: {
    borderColor: '#FCA5A5',
    shadowColor: '#EF4444',
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    color: '#dc2626',
  },
});

export default Select;
