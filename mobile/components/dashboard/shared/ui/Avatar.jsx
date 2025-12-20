import React, { useState } from 'react';
import { View, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Avatar Component - Displays user profile image or fallback
 * @param {Object} props
 * @param {string} props.imageUri - Profile image URI
 * @param {string} props.fallbackText - Text to display when no image (e.g., initials)
 * @param {string} props.fallbackIcon - Ionicon name for fallback icon
 * @param {number} props.size - Size of avatar (default: 48)
 * @param {string} props.shape - 'circle' or 'square' (default: 'circle')
 * @param {string} props.backgroundColor - Background color (default: '#14B8A6')
 */
const Avatar = ({ 
  imageUri, 
  fallbackText, 
  fallbackIcon,
  size = 48, 
  shape = 'circle',
  backgroundColor = '#14B8A6'
}) => {
  const [imageError, setImageError] = useState(false);
  
  const sizeClass = size === 48 ? 'w-12 h-12' : size === 64 ? 'w-16 h-16' : `w-[${size}px] h-[${size}px]`;
  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-lg';
  const showImage = imageUri && !imageError;
  
  return (
    <View
      className={`${sizeClass} ${shapeClass} items-center justify-center mr-3 overflow-hidden`}
      style={{ backgroundColor }}
    >
      {showImage ? (
        <Image
          source={{ uri: imageUri }}
          className="w-full h-full"
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
      ) : fallbackIcon ? (
        <Ionicons name={fallbackIcon} size={size * 0.5} color="white" />
      ) : (
        <Text className={`font-bold text-white ${size >= 64 ? 'text-2xl' : 'text-lg'}`}>
          {fallbackText || '?'}
        </Text>
      )}
    </View>
  );
};

export default Avatar;
