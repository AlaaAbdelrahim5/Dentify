import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
        </Text>
      )}
      <View style={[
        styles.pickerContainer,
        error ? styles.pickerError : styles.pickerNormal
      ]}>
        <Picker
          selectedValue={value}
          onValueChange={onValueChange}
          style={styles.picker}
          itemStyle={styles.pickerItem}
          dropdownIconColor="#6b7280"
          {...props}
        >
          <Picker.Item label={placeholder} value="" enabled={false} color="#9CA3AF" />
          {options.map((option) => (
            <Picker.Item 
              key={option.value} 
              label={option.label} 
              value={option.value}
              color="#111827"
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
  pickerContainer: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#111827',
  },
  pickerItem: {
    fontSize: 16,
    height: 50,
    color: '#111827',
  },
  pickerNormal: {
    borderColor: '#d1d5db',
  },
  pickerError: {
    borderColor: '#fca5a5',
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    color: '#dc2626',
  },
});

export default Select;
