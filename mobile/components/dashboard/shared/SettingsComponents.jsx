import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Profile Header Component (Avatar + Name)
export const ProfileHeader = ({ firstName, lastName, subtitle, isDarkMode, prefix = '' }) => (
  <View className="items-center mb-6">
    <View className="w-24 h-24 rounded-full bg-teal-500 items-center justify-center">
      <Text className="text-white font-bold text-3xl">
        {firstName?.charAt(0)}{lastName?.charAt(0)}
      </Text>
    </View>
    <Text className={`mt-3 text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      {prefix}{firstName} {lastName}
    </Text>
    {subtitle && (
      <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        {subtitle}
      </Text>
    )}
  </View>
);

// Profile Info Row Component
export const ProfileInfoRow = ({ icon, label, value, editable = false, onChangeText, isEditing, isDarkMode, multiline = false }) => (
  <View className={`mb-4 p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`} style={{ elevation: 2 }}>
    <View className="flex-row items-center mb-2">
      <Ionicons name={icon} size={18} color="#14b8a6" />
      <Text className={`ml-2 text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        {label}
      </Text>
    </View>
    {isEditing && editable ? (
      <TextInput
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'} border ${
          isDarkMode ? 'border-gray-700' : 'border-gray-300'
        } rounded-lg p-3`}
        placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
        style={multiline ? { textAlignVertical: 'top' } : {}}
      />
    ) : (
      <Text className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        {value || 'Not provided'}
      </Text>
    )}
  </View>
);

// Settings Action Button
export const SettingsActionButton = ({ icon, label, onPress, isDarkMode, variant = 'primary' }) => {
  const getButtonStyle = () => {
    if (variant === 'primary') {
      return 'bg-teal-500';
    } else if (variant === 'secondary') {
      return isDarkMode ? 'bg-gray-700' : 'bg-gray-200';
    } else if (variant === 'danger') {
      return 'bg-red-500';
    }
  };

  const getTextStyle = () => {
    if (variant === 'primary' || variant === 'danger') {
      return 'text-white';
    }
    return isDarkMode ? 'text-white' : 'text-gray-900';
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-center justify-center py-3 px-4 rounded-xl ${getButtonStyle()}`}
      style={{ elevation: 2 }}
      activeOpacity={0.7}
    >
      <Ionicons name={icon} size={20} color={variant === 'secondary' && !isDarkMode ? '#111827' : 'white'} />
      <Text className={`ml-2 text-base font-semibold ${getTextStyle()}`}>{label}</Text>
    </TouchableOpacity>
  );
};

// Settings Section Header
export const SettingsSectionHeader = ({ title, icon, isDarkMode }) => (
  <View className="flex-row items-center mb-3 px-1">
    {icon && <Ionicons name={icon} size={20} color="#14b8a6" />}
    <Text className={`text-lg font-bold ${icon ? 'ml-2' : ''} ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      {title}
    </Text>
  </View>
);

// Settings Toggle Row
export const SettingsToggleRow = ({ icon, label, value, onToggle, isDarkMode }) => (
  <TouchableOpacity
    onPress={onToggle}
    className={`mb-3 p-4 rounded-xl flex-row items-center justify-between ${
      isDarkMode ? 'bg-gray-800' : 'bg-white'
    }`}
    style={{ elevation: 2 }}
    activeOpacity={0.7}
  >
    <View className="flex-row items-center flex-1">
      <Ionicons name={icon} size={20} color="#14b8a6" />
      <Text className={`ml-3 text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{label}</Text>
    </View>
    <View
      className={`w-12 h-6 rounded-full p-1 ${value ? 'bg-teal-500' : isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}
    >
      <View
        className={`w-4 h-4 rounded-full bg-white ${value ? 'ml-auto' : ''}`}
        style={{ transform: [{ translateX: value ? 0 : 0 }] }}
      />
    </View>
  </TouchableOpacity>
);
