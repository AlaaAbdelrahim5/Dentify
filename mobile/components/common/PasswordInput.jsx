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
    if (!value) return { strength: 0, text: '', color: '#e5e7eb' };
    
    let strength = 0;
    if (value.length >= 8) strength++;
    if (value.length >= 12) strength++;
    if (/[a-z]/.test(value) && /[A-Z]/.test(value)) strength++;
    if (/[0-9]/.test(value)) strength++;
    if (/[^A-Za-z0-9]/.test(value)) strength++;

    const levels = [
      { strength: 1, text: 'Very Weak', color: '#ef4444' },
      { strength: 2, text: 'Weak', color: '#f97316' },
      { strength: 3, text: 'Fair', color: '#eab308' },
      { strength: 4, text: 'Good', color: '#3b82f6' },
      { strength: 5, text: 'Strong', color: '#10b981' },
    ];

    return levels.find(level => level.strength === strength) || levels[0];
  };

  const strengthInfo = calculatePasswordStrength();

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
        </Text>
      )}
      <View 
        style={[
          styles.inputContainer,
          error ? styles.inputError : styles.inputNormal
        ]}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
        </View>
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!showPassword}
          style={styles.input}
          {...props}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.eyeButton}
        >
          <Ionicons 
            name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
            size={20} 
            color="#9CA3AF" 
          />
        </TouchableOpacity>
      </View>
      
      {showStrength && value && (
        <View style={styles.strengthContainer}>
          <View style={styles.strengthRow}>
            <View style={styles.strengthBarContainer}>
              <View 
                style={[
                  styles.strengthBar,
                  { 
                    width: `${(strengthInfo.strength / 5) * 100}%`,
                    backgroundColor: strengthInfo.color 
                  }
                ]}
              />
            </View>
            <Text style={styles.strengthText}>
              {strengthInfo.text}
            </Text>
          </View>
        </View>
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
    fontSize: 16,
    color: '#111827',
  },
  eyeButton: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  strengthContainer: {
    marginTop: 8,
  },
  strengthRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  strengthBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 9999,
    overflow: 'hidden',
  },
  strengthBar: {
    height: 8,
  },
  strengthText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#4b5563',
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    color: '#dc2626',
  },
});

export default PasswordInput;
