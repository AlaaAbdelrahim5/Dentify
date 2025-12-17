import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Checkbox = ({ 
  checked,
  onPress,
  label,
  error,
  className = '',
}) => {
  return (
    <View>
      <TouchableOpacity 
        onPress={onPress}
        style={styles.container}
        activeOpacity={0.7}
      >
        <View style={[
          styles.checkbox,
          checked ? styles.checkboxChecked : styles.checkboxUnchecked
        ]}>
          {checked && (
            <Ionicons name="checkmark" size={14} color="white" />
          )}
        </View>
        {label && (
          <Text style={styles.label}>{label}</Text>
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
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#0d9488',
    borderColor: '#0d9488',
  },
  checkboxUnchecked: {
    backgroundColor: 'transparent',
    borderColor: '#d1d5db',
  },
  label: {
    fontSize: 14,
    color: '#4b5563',
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    color: '#dc2626',
  },
});

export default Checkbox;
