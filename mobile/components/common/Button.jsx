import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const Button = ({ 
  children,
  onPress,
  disabled,
  isLoading,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props 
}) => {
  const getSizePadding = () => {
    const sizes = {
      sm: { paddingVertical: 12, paddingHorizontal: 24 },
      md: { paddingVertical: 20, paddingHorizontal: 32 },
      lg: { paddingVertical: 24, paddingHorizontal: 40 },
    };
    return sizes[size] || sizes.md;
  };

  const getTextColor = () => {
    return variant === 'outline' || variant === 'ghost' 
      ? '#0d9488' 
      : '#ffffff';
  };

  const renderContent = () => (
    <>
      {isLoading ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }]}>
          {children}
        </Text>
      )}
    </>
  );

  if (variant === 'primary' && !disabled && !isLoading) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || isLoading}
        style={styles.shadow}
        activeOpacity={0.8}
        {...props}
      >
        <LinearGradient
          colors={['#14b8a6', '#0ea5e9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.button, getSizePadding()]}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const getVariantStyle = () => {
    const variants = {
      primary: { backgroundColor: '#14b8a6' },
      secondary: { backgroundColor: '#6b7280' },
      outline: { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#14b8a6' },
      ghost: { backgroundColor: 'transparent' },
      success: { backgroundColor: '#10b981' },
      danger: { backgroundColor: '#ef4444' },
    };
    return variants[variant] || variants.primary;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      style={[
        styles.button,
        styles.shadow,
        getSizePadding(),
        disabled || isLoading ? styles.disabled : getVariantStyle()
      ]}
      activeOpacity={0.8}
      {...props}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  disabled: {
    backgroundColor: '#9ca3af',
  },
});

export default Button;
