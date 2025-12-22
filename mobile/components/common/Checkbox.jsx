import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

const Checkbox = ({ 
  checked,
  onPress,
  label,
  error,
  className = '',
}) => {
  const { isDarkMode } = useTheme();
  return (
    <View>
      <TouchableOpacity 
        onPress={onPress}
        style={styles.container}
        activeOpacity={0.7}
      >
        <View style={[
          styles.checkbox,
          checked ? styles.checkboxChecked : (isDarkMode ? styles.checkboxUncheckedDark : styles.checkboxUnchecked)
        ]}>
          {checked && (
            <Ionicons name="checkmark" size={16} color="white" />
          )}
        </View>
        {label && (
          <Text style={[styles.label, isDarkMode && styles.labelDark]}>{label}</Text>
        )}
      </TouchableOpacity>
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#14B8A6',
    borderColor: '#14B8A6',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  checkboxUnchecked: {
    backgroundColor: 'transparent',
    borderColor: '#99F6E4',
  },
  checkboxUncheckedDark: {
    backgroundColor: 'transparent',
    borderColor: '#4B5563',
  },
  label: {
    fontSize: 14,
    color: '#4b5563',
    flex: 1,
  },
  labelDark: {
    color: '#D1D5DB',
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    color: '#dc2626',
  },
});

export default Checkbox;
