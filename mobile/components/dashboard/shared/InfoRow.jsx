import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * InfoRow Component - Displays an icon with text
 * @param {Object} props
 * @param {string} props.icon - Ionicon name
 * @param {string} props.text - Text to display
 * @param {boolean} props.isDarkMode - Dark mode flag
 * @param {number} props.iconSize - Icon size (default: 14)
 * @param {string} props.iconColor - Custom icon color
 * @param {string} props.textSize - Text size class (default: 'text-sm')
 * @param {string} props.spacing - Margin top class (default: 'mt-1')
 * @param {string} props.textColor - Custom text color class
 */
const InfoRow = ({ 
  icon, 
  text, 
  isDarkMode, 
  iconSize = 14, 
  iconColor,
  textSize = 'text-sm',
  spacing = 'mt-1',
  textColor
}) => {
  const defaultIconColor = iconColor || (isDarkMode ? '#9CA3AF' : '#6B7280');
  const defaultTextColor = textColor || `${textSize} ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`;
  
  return (
    <View className={`flex-row items-center ${spacing}`}>
      <Ionicons name={icon} size={iconSize} color={defaultIconColor} />
      <Text className={`ml-1 ${defaultTextColor}`}>
        {text}
      </Text>
    </View>
  );
};

export default InfoRow;
