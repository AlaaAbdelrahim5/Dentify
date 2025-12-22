import React from 'react';
import { View, TouchableOpacity } from 'react-native';

/**
 * CardWrapper Component - Reusable card container with consistent styling
 * @param {Object} props
 * @param {boolean} props.isDarkMode - Dark mode flag
 * @param {Function} props.onPress - Optional press handler (makes card touchable)
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.className - Additional custom classes
 */
const CardWrapper = ({ isDarkMode, onPress, children, className = '' }) => {
  const cardClasses = `mb-3 p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} ${className}`;
  const cardStyle = {
    borderWidth: 1,
    borderColor: isDarkMode ? '#374151' : '#E5E7EB',
    shadowColor: '#14b8a6',
    shadowOpacity: isDarkMode ? 0.15 : 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4
  };

  if (onPress) {
    return (
      <TouchableOpacity className={cardClasses} style={cardStyle} onPress={onPress}>
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View className={cardClasses} style={cardStyle}>
      {children}
    </View>
  );
};

export default CardWrapper;
