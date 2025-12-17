import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

const COUNTRY_CODES = [
  { value: '+970', label: '🇵🇸 +970' },
  { value: '+962', label: '🇯🇴 +962' },
  { value: '+20', label: '🇪🇬 +20' },
  { value: '+966', label: '🇸🇦 +966' },
  { value: '+971', label: '🇦🇪 +971' },
  { value: '+961', label: '🇱🇧 +961' },
  { value: '+1', label: '🇺🇸 +1' },
  { value: '+44', label: '🇬🇧 +44' },
];

const PhoneInput = ({ 
  label, 
  countryCode,
  phoneNumber,
  onCountryChange,
  onPhoneChange,
  error,
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
      <View style={styles.row}>
        <View style={[styles.pickerContainer, isDarkMode && styles.pickerContainerDark]}>
          <Picker
            selectedValue={countryCode}
            onValueChange={onCountryChange}
            style={[styles.picker, isDarkMode && styles.pickerDark]}
            itemStyle={styles.pickerItem}
            dropdownIconColor={isDarkMode ? '#9CA3AF' : '#6b7280'}
          >
            {COUNTRY_CODES.map((code) => (
              <Picker.Item key={code.value} label={code.label} value={code.value} color={isDarkMode ? '#F3F4F6' : '#111827'} />
            ))}
          </Picker>
        </View>
        <View style={[
          styles.inputContainer,
          isDarkMode && styles.inputContainerDark,
          error ? styles.inputError : styles.inputNormal
        ]}>
          <View style={styles.iconContainer}>
            <Ionicons name="call-outline" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
          </View>
          <TextInput
            placeholder="Phone number"
            placeholderTextColor={isDarkMode ? '#6B7280' : '#9CA3AF'}
            value={phoneNumber}
            onChangeText={onPhoneChange}
            keyboardType="phone-pad"
            style={[styles.input, isDarkMode && styles.inputDark]}
            {...props}
          />
        </View>
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
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  pickerContainer: {
    width: 128,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
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
    fontSize: 14,
    height: 50,
    color: '#111827',
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputContainerDark: {
    backgroundColor: '#374151',
    borderColor: '#4B5563',
  },
  inputNormal: {
    borderColor: '#d1d5db',
  },
  inputError: {
    borderColor: '#fca5a5',
  },
  iconContainer: {
    paddingLeft: 12,
    paddingRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 12,
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

export default PhoneInput;
