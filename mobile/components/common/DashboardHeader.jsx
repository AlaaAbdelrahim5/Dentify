import React from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useChat } from '../../contexts/ChatContext';
import NotificationBell from '../features/notifications/NotificationBell';
import ChatButton from '../features/chat/ChatButton';

const DashboardHeader = ({ title = 'Dashboard', subtitle, showNotifications = true, onMenuPress, onSearch, userData }) => {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const { unreadCount } = useNotifications();
  const { totalUnreadCount } = useChat();

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
      <View 
        className={`${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDarkMode ? 0.3 : 0.1,
          shadowRadius: 8,
          elevation: 4
        }}
      >
        {/* Status bar spacing */}
        <View />
        
        {/* Header content */}
        <View className="px-5 pb-4 pt-2">
        {/* Top row: Menu and Icons */}
        <View className="flex-row items-center justify-between mb-4">
          {/* Left: Menu button */}
          {onMenuPress && (
            <TouchableOpacity
              onPress={onMenuPress}
              className={`w-11 h-11 rounded-xl items-center justify-center`}
              style={{
                backgroundColor: isDarkMode ? '#1F2937' : '#F0FDFA',
                borderWidth: 1,
                borderColor: isDarkMode ? '#374151' : '#14B8A6',
                shadowColor: '#14B8A6',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isDarkMode ? 0.2 : 0.15,
                shadowRadius: 4,
                elevation: 3
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="menu" size={24} color={isDarkMode ? '#10B981' : '#14B8A6'} />
            </TouchableOpacity>
          )}
          
          {/* Right: Action icons */}
          <View className="flex-row items-center" style={{ gap: 12 }}>
            {/* Search button - Only for patients */}
            {isPatient && (
              <TouchableOpacity
                onPress={handleSearch}
                className={`w-11 h-11 rounded-xl items-center justify-center`}
                style={{
                  backgroundColor: isDarkMode ? '#1F2937' : '#F0FDFA',
                  borderWidth: 1,
                  borderColor: isDarkMode ? '#374151' : '#14B8A6',
                  shadowColor: '#14B8A6',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isDarkMode ? 0.2 : 0.15,
                  shadowRadius: 4,
                  elevation: 3
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="search-outline" size={24} color={isDarkMode ? '#10B981' : '#14B8A6'} />
              </TouchableOpacity>
            )}

            {showNotifications && <NotificationBell />}
            
            {/* Messages button */}
            <ChatButton />
          </View>
        </View>
        
        {/* Bottom row: Title with gradient accent */}
        <View>
          <Text 
            className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
            style={{ letterSpacing: -0.8 }}
          >
            {title}
          </Text>
          {subtitle && (
            <Text 
              className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
              style={{ letterSpacing: 0.2 }}
            >
              {getDefaultSubtitle()}
            </Text>
          )}
        </View>
      </View>
      
      {/* Bottom gradient accent */}
      <View 
        style={{
          height: 3,
          backgroundColor: isDarkMode ? '#1F2937' : '#E5E7EB'
        }}
      >
        <View 
          style={{
            height: 3,
            width: '40%',
            backgroundColor: '#14B8A6',
            shadowColor: '#14B8A6',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.6,
            shadowRadius: 8,
            elevation: 4
          }}
        />
      </View>
      </View>
    </>
  );
};

export default DashboardHeader;
