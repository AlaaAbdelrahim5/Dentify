import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { authUtils } from '../../utils/auth';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';

const DashboardHeader = ({ title = 'Dashboard', subtitle = 'Patient Portal', showNotifications = true }) => {
  const router = useRouter();
  const { isDarkMode } = useTheme();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await authUtils.logout();
            router.replace('/(auth)/login');
          }
        }
      ]
    );
  };

  const handleNotifications = () => {
    router.push('/notifications');
  };

  return (
    <View className={`shadow-sm pt-12 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <View className="flex-row items-center justify-between px-5 pt-3 pb-4">
        <View className="flex-1">
          <Text className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`} style={{ letterSpacing: -0.5 }}>
            {title}
          </Text>
          <Text className={`text-xs mt-0.5 font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{subtitle}</Text>
        </View>
        
        <View className="flex-row items-center gap-2">
          {showNotifications && (
            <TouchableOpacity
              onPress={handleNotifications}
              className={`w-11 h-11 rounded-xl items-center justify-center ${isDarkMode ? 'bg-gray-800' : 'bg-teal-50'}`}
              style={{ shadowColor: '#14B8A6', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } }}
            >
              <Ionicons name="notifications-outline" size={24} color="#14B8A6" />
              {/* Notification badge - uncomment when you have notification count */}
              {/* <View className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" /> */}
            </TouchableOpacity>
          )}
          
          <ThemeToggle />
          
          <TouchableOpacity
            onPress={handleLogout}
            className={`flex-row items-center px-4 py-2.5 rounded-xl ${isDarkMode ? 'bg-red-900/30' : 'bg-red-50'}`}
            style={{ shadowColor: '#DC2626', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } }}
          >
            <Ionicons name="log-out-outline" size={20} color="#DC2626" />
            <Text className="text-red-600 font-bold ml-2 text-sm">Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default DashboardHeader;
