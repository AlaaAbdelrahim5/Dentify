import React from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications } from '../../contexts/NotificationContext';
import { useTheme } from '../../contexts/ThemeContext';
import { formatDistanceToNow } from '../../utils/dateUtils';

const NotificationsScreen = () => {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const { isDarkMode } = useTheme();
  const router = useRouter();

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'appointment':
        return 'calendar';
      case 'payment':
        return 'card';
      case 'treatment':
        return 'medical';
      case 'message':
        return 'chatbubble';
      default:
        return 'notifications';
    }
  };

  const handleNotificationPress = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    // Handle navigation based on notification type
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const renderNotification = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() => handleNotificationPress(item)}
        className={`p-5 mx-4 mb-4 rounded-2xl ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}
        style={{
          borderLeftWidth: !item.read ? 1.5 : 0,
          borderLeftColor: !item.read ? '#14B8A6' : 'transparent',
          shadowColor: !item.read ? '#14B8A6' : '#000',
          shadowOpacity: !item.read ? 0.25 : 0.1,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 3 },
          elevation: !item.read ? 5 : 3
        }}
      >
        <View className="flex-row items-start">
          <View className={`w-14 h-14 rounded-full items-center justify-center mr-4 ${
            isDarkMode ? 'bg-teal-500/20' : 'bg-teal-100'
          }`} style={{ borderWidth: 1.5, borderColor: '#14B8A6' }}>
            <Ionicons 
              name={getNotificationIcon(item.type)} 
              size={28} 
              color={isDarkMode ? '#5EEAD4' : '#14B8A6'} 
            />
          </View>
          <View className="flex-1">
            <View className="flex-row items-start justify-between mb-1">
              <Text className={`flex-1 font-bold text-base mr-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`} numberOfLines={2}>
                {item.title}
              </Text>
              {!item.read && (
                <View className="w-2 h-2 rounded-full bg-teal-500 mt-1" />
              )}
            </View>
            {item.body ? (
              <Text className={`text-sm mb-2 leading-5 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {item.body}
              </Text>
            ) : (
              <Text className={`text-xs mb-2 italic ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`}>
                No message content
              </Text>
            )}
            <Text className={`text-xs ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`}>
              {item.createdAt ? formatDistanceToNow(item.createdAt.toDate()) : 'Just now'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <View className="flex-row items-center justify-between p-5" style={{
        borderBottomWidth: 1.5,
        borderBottomColor: '#99F6E4',
        backgroundColor: isDarkMode ? '#111827' : '#FFFFFF',
        shadowColor: '#14B8A6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4
      }}>
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="mr-4"
          >
            <Ionicons 
              name="arrow-back" 
              size={28} 
              color={isDarkMode ? '#FFF' : '#000'} 
            />
          </TouchableOpacity>
          <Text className={`text-2xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`} style={{ letterSpacing: -0.8 }}>
            Notifications
          </Text>
        </View>
        
        {notifications.filter(n => !n.read).length > 0 && (
          <TouchableOpacity
            onPress={markAllAsRead}
            className={`px-4 py-2.5 rounded-xl ${
              isDarkMode ? 'bg-teal-500/20' : 'bg-teal-100'
            }`}
            style={{ borderWidth: 1.5, borderColor: '#14B8A6' }}
          >
            <Text className={`text-sm font-bold ${
              isDarkMode ? 'text-teal-400' : 'text-teal-600'
            }`}>
              Mark all read
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <View className="flex-1 items-center justify-center p-6">
          <View className={`w-28 h-28 rounded-full items-center justify-center mb-5 ${
            isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
          }`} style={{ borderWidth: 1.5, borderColor: isDarkMode ? '#374151' : '#D1D5DB' }}>
            <Ionicons 
              name="notifications-outline" 
              size={56} 
              color={isDarkMode ? '#4B5563' : '#9CA3AF'} 
            />
          </View>
          <Text className={`text-2xl font-bold mb-3 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            No notifications
          </Text>
          <Text className={`text-center ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            You're all caught up!
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingVertical: 16 }}
        />
      )}
    </SafeAreaView>
  );
};

export default NotificationsScreen;
