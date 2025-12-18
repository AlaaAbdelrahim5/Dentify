import React from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

const DashboardHeader = ({ title = 'Dashboard', subtitle, showNotifications = true, onMenuPress, onSearch, userData }) => {
  const router = useRouter();
  const { isDarkMode } = useTheme();

  const getDefaultSubtitle = () => {
    if (subtitle) return subtitle;
    
    const role = userData?.role?.toUpperCase();
    switch (role) {
      case 'DENTIST':
        return 'Dentist Portal';
      case 'SECRETARY':
        return 'Secretary Portal';
      case 'PATIENT':
        return 'Patient Portal';
      default:
        return 'Patient Portal';
    }
  };

  const handleNotifications = () => {
    router.push('/notifications');
  };

  const handleMessages = () => {
    router.push('/messages');
  };

  const handleSearch = () => {
    if (onSearch) {
      onSearch();
    }
  };

  const isPatient = userData?.role?.toUpperCase() === 'PATIENT';

  return (
    <>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
        backgroundColor="transparent"
        translucent={true}
      />
      <View className={`${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
        {/* Status bar spacing */}
        <View />
        
        {/* Header content */}
        <View className="px-5 pb-3 pt-2">
        {/* Top row: Menu and Icons */}
        <View className="flex-row items-center justify-between mb-3">
          {/* Left: Menu button */}
          {onMenuPress && (
            <TouchableOpacity
              onPress={onMenuPress}
              className={`w-10 h-10 rounded-full items-center justify-center ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
              activeOpacity={0.7}
            >
              <Ionicons name="menu" size={22} color={isDarkMode ? '#10B981' : '#14B8A6'} />
            </TouchableOpacity>
          )}
          
          {/* Right: Action icons */}
          <View className="flex-row items-center" style={{ gap: 10 }}>
            {/* Search button - Only for patients */}
            {isPatient && (
              <TouchableOpacity
                onPress={handleSearch}
                className={`w-10 h-10 rounded-full items-center justify-center ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
                activeOpacity={0.7}
              >
                <Ionicons name="search-outline" size={22} color={isDarkMode ? '#10B981' : '#14B8A6'} />
              </TouchableOpacity>
            )}

            {showNotifications && (
              <TouchableOpacity
                onPress={handleNotifications}
                className={`w-10 h-10 rounded-full items-center justify-center ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
                activeOpacity={0.7}
              >
                <Ionicons name="notifications-outline" size={22} color={isDarkMode ? '#10B981' : '#14B8A6'} />
                {/* Notification badge */}
                {/* <View className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white" /> */}
              </TouchableOpacity>
            )}
            
            {/* Messages button */}
            <TouchableOpacity
              onPress={handleMessages}
              className={`w-10 h-10 rounded-full items-center justify-center ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
              activeOpacity={0.7}
            >
              <Ionicons name="chatbubbles-outline" size={22} color={isDarkMode ? '#10B981' : '#14B8A6'} />
              {/* Message badge - uncomment when you have unread count */}
              {/* <View className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white" /> */}
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Bottom row: Title */}
        <View>
          <Text 
            className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
            style={{ letterSpacing: -0.5 }}
          >
            {title}
          </Text>
        </View>
      </View>
      
      {/* Bottom border */}
      <View className={`h-px ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`} />
      </View>
    </>
  );
};

export default DashboardHeader;
