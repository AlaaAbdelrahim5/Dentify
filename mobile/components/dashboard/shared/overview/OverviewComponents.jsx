import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Welcome Card Component
export const WelcomeCard = ({ greeting, subtitle, isDarkMode }) => (
  <View className="rounded-2xl overflow-hidden" style={{ 
    elevation: 6,
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    borderWidth: 1.5,
    borderColor: isDarkMode ? '#0D9488' : '#99F6E4'
  }}>
    <LinearGradient
      colors={isDarkMode ? ['#0D9488', '#0891B2'] : ['#14B8A6', '#06B6D4']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ padding: 24 }}
    >
      <Text className="text-3xl font-bold text-white mb-2" style={{ letterSpacing: -0.8 }}>
        {greeting}
      </Text>
      <Text style={{ fontSize: 15, color: 'rgba(255, 255, 255, 0.95)', marginTop: 4, letterSpacing: 0.2 }}>
        {subtitle}
      </Text>
    </LinearGradient>
  </View>
);

// Stat Card Component
export const StatCard = ({ icon, label, value, colors }) => (
  <View className="w-32 rounded-2xl overflow-hidden" style={{ 
    elevation: 4,
    shadowColor: colors[0],
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: `${colors[0]}40`
  }}>
    <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ padding: 18 }}>
      <Ionicons name={icon} size={28} color="white" />
      <Text className="text-2xl font-bold text-white mt-3" style={{ letterSpacing: -0.5 }}>{value}</Text>
      <Text className="text-xs text-white/95 mt-1.5 font-semibold" style={{ letterSpacing: 0.2 }}>{label}</Text>
    </LinearGradient>
  </View>
);

// Loading State Component
export const LoadingState = ({ isDarkMode, message = 'Loading...' }) => (
  <View className="flex-1 items-center justify-center">
    <Text className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>{message}</Text>
  </View>
);

// Empty State Component
export const EmptyState = ({ icon = 'calendar-outline', title, message, subtitle, isDarkMode }) => (
  <View className="py-8 items-center">
    <Ionicons name={icon} size={48} color={isDarkMode ? '#4B5563' : '#D1D5DB'} />
    <Text className={`text-base font-medium mt-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
      {title || message}
    </Text>
    {(subtitle || (!title && message)) && (
      <Text className={`text-sm mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
        {subtitle || (title && message)}
      </Text>
    )}
  </View>
);

// Status Badge Component
export const StatusBadge = ({ status, isDarkMode }) => (
  <View 
    className="px-3 py-1.5 rounded-full"
    style={{
      backgroundColor: isDarkMode ? '#0D948820' : '#F0FDFA',
      borderWidth: 1,
      borderColor: isDarkMode ? '#14B8A6' : '#99F6E4'
    }}
  >
    <Text className="text-xs font-bold text-teal-600">
      {status}
    </Text>
  </View>
);

// Section Header Component
export const SectionHeader = ({ title, onViewAll, isDarkMode }) => (
  <View className="flex-row items-center justify-between mb-4">
    <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`} style={{ letterSpacing: -0.5 }}>
      {title}
    </Text>
  </View>
);

// Note: InfoRow has been moved to a separate InfoRow.jsx file for better flexibility
// Use: import InfoRow from './InfoRow' or import { InfoRow } from './index'

// Search Bar Component
export const SearchBar = ({ placeholder = 'Search...', value, onChangeText, isDarkMode }) => (
  <View 
    className={`mb-4 px-4 py-3 rounded-xl flex-row items-center ${
      isDarkMode ? 'bg-gray-800' : 'bg-white'
    }`}
    style={{
      borderWidth: 1.5,
      borderColor: isDarkMode ? '#4B5563' : '#99F6E4',
      shadowColor: '#14B8A6',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 3
    }}
  >
    <Ionicons name="search" size={22} color={isDarkMode ? '#10B981' : '#14B8A6'} />
    <TextInput
      placeholder={placeholder}
      placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
      value={value}
      onChangeText={onChangeText}
      className={`flex-1 ml-3 text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
    />
  </View>
);
