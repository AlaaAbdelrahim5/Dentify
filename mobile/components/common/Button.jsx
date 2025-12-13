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
  const getSizeClasses = () => {
    const sizes = {
      sm: 'py-2 px-4',
      md: 'py-4 px-6',
      lg: 'py-5 px-8',
    };
    return sizes[size] || sizes.md;
  };

  const getTextColor = () => {
    return variant === 'outline' || variant === 'ghost' 
      ? 'text-primary-600' 
      : 'text-white';
  };

  const renderContent = () => (
    <>
      {isLoading ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text className={`text-center text-lg font-semibold ${getTextColor()}`}>
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
        style={styles.button}
        className={className}
        {...props}
      >
        <LinearGradient
          colors={['#14b8a6', '#0ea5e9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className={`rounded-lg ${getSizeClasses()}`}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const getVariantClasses = () => {
    const variants = {
      primary: 'bg-primary-500',
      secondary: 'bg-gray-500',
      outline: 'border-2 border-primary-500 bg-transparent',
      ghost: 'bg-transparent',
      success: 'bg-green-500',
      danger: 'bg-red-500',
    };
    return variants[variant] || variants.primary;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      style={styles.button}
      className={`rounded-lg ${getSizeClasses()} ${
        disabled || isLoading ? 'bg-gray-400' : getVariantClasses()
      } ${className}`}
      {...props}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
});

export default Button;
