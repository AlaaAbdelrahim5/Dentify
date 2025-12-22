import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Modal, Pressable, Animated } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

const DatePicker = ({ 
  label, 
  value,
  onChange,
  error,
  placeholder = 'YYYY-MM-DD',
  maximumDate,
  minimumDate,
  className = '',
  disabled = false,
  ...props 
}) => {
  const [show, setShow] = useState(false);
  const [date, setDate] = useState(value ? new Date(value) : new Date());
  const { isDarkMode } = useTheme();
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.9))[0];

  useEffect(() => {
    if (show) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [show]);

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
    }
  };

  const showDatepicker = () => {
    if (!disabled) {
      setShow(true);
    }
  };

  const closePicker = () => {
    setShow(false);
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getFormattedDateWithDay = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, isDarkMode && styles.labelDark]}>
          {label}
        </Text>
      )}
      <TouchableOpacity 
        onPress={showDatepicker}
        style={[
          styles.inputContainer,
          isDarkMode && styles.inputContainerDark,
          error ? styles.inputError : styles.inputNormal,
          disabled && styles.inputDisabled
        ]}
        activeOpacity={disabled ? 1 : 0.7}
        disabled={disabled}
      >
        <View style={[styles.iconContainer, disabled && styles.iconDisabled]}>
          <Ionicons 
            name="calendar-outline" 
            size={22} 
            color={disabled ? '#9CA3AF' : (isDarkMode ? '#10B981' : '#14B8A6')} 
          />
        </View>
        <Text style={[
          styles.inputText,
          isDarkMode && styles.inputTextDark,
          !value && styles.placeholder,
          disabled && styles.textDisabled
        ]}>
          {value ? formatDisplayDate(value) : placeholder}
        </Text>
        <View style={[styles.arrowContainer, disabled && styles.iconDisabled]}>
          <Ionicons 
            name="chevron-down" 
            size={20} 
            color={disabled ? '#9CA3AF' : (isDarkMode ? '#10B981' : '#14B8A6')} 
          />
        </View>
      </TouchableOpacity>
      
      {/* iOS Modal Picker */}
      {Platform.OS === 'ios' && show && (
        <Modal
          transparent={true}
          visible={show}
          animationType="none"
          onRequestClose={closePicker}
        >
          <Pressable 
            style={styles.modalOverlay} 
            onPress={closePicker}
          >
            <Animated.View 
              style={[
                styles.modalContainer,
                isDarkMode && styles.modalContainerDark,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }]
                }
              ]}
            >
              <Pressable onPress={(e) => e.stopPropagation()}>
                {/* Header */}
                <View style={[styles.modalHeader, isDarkMode && styles.modalHeaderDark]}>
                  <Text style={[styles.modalTitle, isDarkMode && styles.modalTitleDark]}>
                    Select Date
                  </Text>
                  <TouchableOpacity 
                    onPress={closePicker}
                    style={[styles.closeButton, isDarkMode && styles.closeButtonDark]}
                  >
                    <Ionicons name="close" size={24} color={isDarkMode ? '#10B981' : '#14B8A6'} />
                  </TouchableOpacity>
                </View>
                
                {/* Selected Date Display */}
                {value && (
                  <View style={[styles.selectedDateContainer, isDarkMode && styles.selectedDateContainerDark]}>
                    <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                    <Text style={[styles.selectedDateText, isDarkMode && styles.selectedDateTextDark]}>
                      {getFormattedDateWithDay(value)}
                    </Text>
                  </View>
                )}
                
                {/* Date Picker */}
                <View style={styles.pickerContainer}>
                  <DateTimePicker
                    testID="dateTimePicker"
                    value={value ? new Date(value) : date}
                    mode="date"
                    display="inline"
                    onChange={onChangeDate}
                    maximumDate={maximumDate}
                    minimumDate={minimumDate}
                    themeVariant={isDarkMode ? 'dark' : 'light'}
                    style={styles.picker}
                    {...props}
                  />
                </View>
                
                {/* Action Buttons */}
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    onPress={closePicker}
                    style={[styles.confirmButton, isDarkMode && styles.confirmButtonDark]}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="checkmark" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                    <Text style={styles.confirmButtonText}>Confirm</Text>
                  </TouchableOpacity>
                </View>
              </Pressable>
            </Animated.View>
          </Pressable>
        </Modal>
      )}
      
      {/* Android Native Picker */}
      {Platform.OS === 'android' && show && (
        <DateTimePicker
          testID="dateTimePicker"
          value={value ? new Date(value) : date}
          mode="date"
          display="default"
          onChange={onChangeDate}
          maximumDate={maximumDate}
          minimumDate={minimumDate}
          themeVariant={isDarkMode ? 'dark' : 'light'}
          {...props}
        />
      )}
      
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={16} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  labelDark: {
    color: '#E5E7EB',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 2,
    shadowColor: '#14b8a6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    paddingVertical: 16,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  inputContainerDark: {
    backgroundColor: '#374151',
    shadowColor: '#10B981',
  },
  inputNormal: {
    borderColor: '#99F6E4',
  },
  inputError: {
    borderColor: '#FCA5A5',
    shadowColor: '#EF4444',
    shadowOpacity: 0.2,
  },
  inputDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
    opacity: 0.6,
  },
  iconContainer: {
    marginRight: 12,
    padding: 4,
  },
  iconDisabled: {
    opacity: 0.5,
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  inputTextDark: {
    color: '#F9FAFB',
  },
  placeholder: {
    color: '#9CA3AF',
    fontWeight: '400',
  },
  textDisabled: {
    color: '#9CA3AF',
  },
  arrowContainer: {
    marginLeft: 8,
    padding: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  errorText: {
    marginLeft: 6,
    fontSize: 13,
    color: '#EF4444',
    fontWeight: '500',
  },
  
  // Modal Styles (iOS)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  modalContainerDark: {
    backgroundColor: '#1F2937',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: '#F0FDFA',
    borderBottomWidth: 1,
    borderBottomColor: '#99F6E4',
  },
  modalHeaderDark: {
    backgroundColor: '#374151',
    borderBottomColor: '#4B5563',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F766E',
    letterSpacing: 0.3,
  },
  modalTitleDark: {
    color: '#10B981',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#CCFBF1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonDark: {
    backgroundColor: '#4B5563',
  },
  selectedDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#ECFDF5',
    borderBottomWidth: 1,
    borderBottomColor: '#D1FAE5',
  },
  selectedDateContainerDark: {
    backgroundColor: '#1F2937',
    borderBottomColor: '#374151',
  },
  selectedDateText: {
    marginLeft: 10,
    fontSize: 15,
    fontWeight: '600',
    color: '#065F46',
  },
  selectedDateTextDark: {
    color: '#10B981',
  },
  pickerContainer: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  picker: {
    width: '100%',
    height: 350,
  },
  buttonContainer: {
    padding: 20,
    paddingTop: 16,
  },
  confirmButton: {
    backgroundColor: '#14B8A6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  confirmButtonDark: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
  },
  buttonIcon: {
    marginRight: 8,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default DatePicker;
