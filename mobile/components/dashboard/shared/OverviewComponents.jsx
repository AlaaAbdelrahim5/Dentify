import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Welcome Card Component
export const WelcomeCard = ({ greeting, subtitle, isDarkMode }) => (
  <View className="rounded-xl overflow-hidden" style={{ elevation: 3 }}>
    <LinearGradient
      colors={isDarkMode ? ['#0D9488', '#0891B2'] : ['#14B8A6', '#06B6D4']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ padding: 20 }}
    >
      <Text className="text-2xl font-bold text-white mb-1">
        {greeting}
      </Text>
      <Text style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.9)', marginTop: 4 }}>
        {subtitle}
      </Text>
    </LinearGradient>
  </View>
);

// Stat Card Component
export const StatCard = ({ icon, label, value, colors }) => (
  <View className="w-32 rounded-xl overflow-hidden" style={{ elevation: 2 }}>
    <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ padding: 16 }}>
      <Ionicons name={icon} size={24} color="white" />
      <Text className="text-2xl font-bold text-white mt-2">{value}</Text>
      <Text className="text-xs text-white/90 mt-1">{label}</Text>
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
  <View className={`px-3 py-1 rounded-full ${isDarkMode ? 'bg-teal-500/20' : 'bg-teal-50'}`}>
    <Text className="text-xs font-medium text-teal-600">
      {status}
    </Text>
  </View>
);

// Section Header Component
export const SectionHeader = ({ title, onViewAll, isDarkMode }) => (
  <View className="flex-row items-center justify-between mb-4">
    <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      {title}
    </Text>
    {onViewAll && (
      <Text className="text-sm text-teal-600 font-medium">View All</Text>
    )}
  </View>
);

// Info Row Component (for displaying icon + text)
export const InfoRow = ({ icon, text, isDarkMode, size = 16 }) => (
  <View className="flex-row items-center">
    <Ionicons name={icon} size={size} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
    <Text className={`text-sm ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
      {text}
    </Text>
  </View>
);

// Search Bar Component
export const SearchBar = ({ placeholder = 'Search...', value, onChangeText, isDarkMode }) => (
  <View className={`mb-4 px-4 py-3 rounded-xl flex-row items-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
    <Ionicons name="search" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
    <TextInput
      placeholder={placeholder}
      placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
      value={value}
      onChangeText={onChangeText}
      className={`flex-1 ml-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
    />
  </View>
);
