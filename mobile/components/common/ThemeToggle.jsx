import React from 'react';
import { TouchableOpacity, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [rotateAnim] = React.useState(new Animated.Value(isDarkMode ? 1 : 0));

  React.useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: isDarkMode ? 1 : 0,
      duration: 300,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: true,
    }).start();
  }, [isDarkMode]);

  const sunRotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  const moonRotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-90deg', '0deg'],
  });

  const sunOpacity = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  const moonOpacity = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const sunScale = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.75],
  });

  const moonScale = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.75, 1],
  });

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      className={`w-11 h-11 rounded-xl items-center justify-center ${
        isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
      }`}
      style={{
        shadowColor: isDarkMode ? '#000' : '#14B8A6',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
      }}
      activeOpacity={0.7}
    >
      <Animated.View
        style={{
          position: 'absolute',
          opacity: sunOpacity,
          transform: [{ rotate: sunRotation }, { scale: sunScale }],
        }}
      >
        <Ionicons name="sunny" size={24} color="#F59E0B" />
      </Animated.View>
      <Animated.View
        style={{
          position: 'absolute',
          opacity: moonOpacity,
          transform: [{ rotate: moonRotation }, { scale: moonScale }],
        }}
      >
        <Ionicons name="moon" size={24} color="#14B8A6" />
      </Animated.View>
    </TouchableOpacity>
  );
};

export default ThemeToggle;
