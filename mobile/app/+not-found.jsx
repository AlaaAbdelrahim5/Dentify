import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Logo from '../components/common/Logo';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');

/**
 * 404 Not Found Page
 * Displayed when user navigates to an invalid route
 */
export default function NotFound() {
  const { isDarkMode } = useTheme();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start all animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous subtle rotation for the icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-5deg', '5deg'],
  });

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: isDarkMode ? '#111827' : '#f0fdfa' }}>
      <LinearGradient
        colors={isDarkMode ? ['#111827', '#1F2937', '#111827'] : ['#f0fdfa', '#ccfbf1', '#f0fdfa']}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />
      
      <View className="flex-1 items-center justify-center px-6">
        {/* Animated Logo at Top */}
        <Animated.View 
          style={{ 
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
            marginBottom: 40
          }}
        >
          <Logo size="sm" showSubtitle={false} />
        </Animated.View>

        {/* Animated 404 Icon */}
        <Animated.View 
          style={{ 
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }, { rotate }],
            marginBottom: 20
          }}
        >
          <View className={`w-32 h-32 rounded-full items-center justify-center ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`} style={{ 
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15,
            shadowRadius: 20,
            elevation: 10
          }}>
            <Ionicons 
              name="map-outline" 
              size={64} 
              color={isDarkMode ? '#14b8a6' : '#0d9488'} 
            />
          </View>
        </Animated.View>

        {/* Animated Content */}
        <Animated.View 
          style={{ 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            alignItems: 'center'
          }}
        >
          <Text className={`text-7xl font-bold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`} style={{
            textShadowColor: isDarkMode ? 'rgba(20, 184, 166, 0.3)' : 'rgba(13, 148, 136, 0.2)',
            textShadowOffset: { width: 0, height: 4 },
            textShadowRadius: 10,
          }}>
            404
          </Text>
          
          <Text className={`text-2xl font-bold mb-3 ${
            isDarkMode ? 'text-gray-200' : 'text-gray-800'
          }`}>
            Page Not Found
          </Text>
          
          <Text className={`text-base text-center mb-8 max-w-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Oops! The page you're looking for doesn't exist or has been moved to a different location.
          </Text>
          
          {/* Action Buttons */}
          <View className="space-y-3 w-full max-w-xs">
            <TouchableOpacity
              onPress={() => router.replace('/(auth)/login')}
              className="w-full"
            >
              <LinearGradient
                colors={['#14b8a6', '#0ea5e9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  paddingVertical: 16,
                  paddingHorizontal: 24,
                  borderRadius: 16,
                  shadowColor: '#14b8a6',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 6,
                }}
              >
                <View className="flex-row items-center justify-center">
                  <Ionicons name="home" size={20} color="white" />
                  <Text className="text-white font-bold text-base ml-2">
                    Go to Login
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.back()}
              className={`w-full py-4 px-6 rounded-2xl border-2 ${
                isDarkMode 
                  ? 'border-gray-700 bg-gray-800/50' 
                  : 'border-gray-200 bg-white/50'
              }`}
            >
              <View className="flex-row items-center justify-center">
                <Ionicons 
                  name="arrow-back" 
                  size={20} 
                  color={isDarkMode ? '#14b8a6' : '#0d9488'} 
                />
                <Text className={`font-semibold text-base ml-2 ${
                  isDarkMode ? 'text-teal-400' : 'text-teal-600'
                }`}>
                  Go Back
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Decorative Elements */}
        <Animated.View 
          style={{ 
            opacity: fadeAnim,
            position: 'absolute',
            top: 100,
            left: 30,
          }}
        >
          <View className={`w-20 h-20 rounded-full ${
            isDarkMode ? 'bg-teal-900/20' : 'bg-teal-100/50'
          }`} />
        </Animated.View>
        
        <Animated.View 
          style={{ 
            opacity: fadeAnim,
            position: 'absolute',
            bottom: 150,
            right: 40,
          }}
        >
          <View className={`w-16 h-16 rounded-full ${
            isDarkMode ? 'bg-blue-900/20' : 'bg-blue-100/50'
          }`} />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
