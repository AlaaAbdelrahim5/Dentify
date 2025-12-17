import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

const DatePicker = ({ 
  label, 
  value,
  onChange,
  error,
  placeholder = 'YYYY-MM-DD',
  maximumDate,
  minimumDate,
  className = '',
  ...props 
}) => {
  const [show, setShow] = useState(false);
  const [date, setDate] = useState(value ? new Date(value) : new Date());

  const onChangeDate = (event, selectedDate) => {
    // On Android, the picker closes after any interaction
    if (Platform.OS === 'android') {
      setShow(false);
    }
    
    // If user cancels (event.type === 'dismissed'), don't update
    if (event.type === 'dismissed') {
      setShow(false);
      return;
    }
    
    if (selectedDate) {
      const currentDate = selectedDate;
      setDate(currentDate);
      
      // Format date as YYYY-MM-DD
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      onChange(formattedDate);
      
      // On iOS, keep the picker open
      if (Platform.OS === 'ios') {
        setShow(true);
      }
    }
  };

  const showDatepicker = () => {
    setShow(true);
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
        </Text>
      )}
      <TouchableOpacity 
        onPress={showDatepicker}
        style={[
          styles.inputContainer,
          error ? styles.inputError : styles.inputNormal
        ]}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="calendar-outline" size={20} color="#9CA3AF" />
        </View>
        <Text style={[
          styles.inputText,
          !value && styles.placeholder
        ]}>
          {value ? formatDisplayDate(value) : placeholder}
        </Text>
        <View style={styles.arrowContainer}>
          <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
        </View>
      </TouchableOpacity>
      
      {show && (
        <DateTimePicker
          testID="dateTimePicker"
          value={value ? new Date(value) : date}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={onChangeDate}
          maximumDate={maximumDate || new Date()}
          minimumDate={minimumDate || new Date(1900, 0, 1)}
          themeVariant="light"
          {...props}
        />
      )}
      
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
  inputContainer: {
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
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  inputNormal: {
    borderColor: '#d1d5db',
  },
  inputError: {
    borderColor: '#fca5a5',
  },
  iconContainer: {
    marginRight: 8,
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  placeholder: {
    color: '#9CA3AF',
  },
  arrowContainer: {
    marginLeft: 8,
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    color: '#dc2626',
  },
});

export default DatePicker;
