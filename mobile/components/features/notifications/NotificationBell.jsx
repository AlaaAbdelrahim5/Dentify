import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications } from '../../../contexts/NotificationContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { formatDistanceToNow } from '../../../utils/dateUtils';

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const { isDarkMode } = useTheme();

  const handleNotificationPress = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    // Handle navigation based on notification type
    // You can add navigation logic here
    setIsOpen(false);
  };

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

  const renderNotification = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() => handleNotificationPress(item)}
        className={`p-4 mx-3 mb-3 rounded-xl ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        } ${
          !item.read ? 'border-l-4 border-teal-500' : ''
        }`}
        style={{
          borderWidth: !item.read ? 0 : 1,
          borderColor: isDarkMode ? '#374151' : '#E5E7EB',
          shadowColor: !item.read ? '#14B8A6' : '#000',
          shadowOpacity: !item.read ? 0.2 : 0.1,
          shadowRadius: !item.read ? 8 : 4,
          shadowOffset: { width: 0, height: 2 },
          elevation: !item.read ? 5 : 3
        }}
      >
        <View className="flex-row items-start">
          <View className={`w-12 h-12 rounded-full items-center justify-center mr-3 ${
            isDarkMode ? 'bg-teal-500/20' : 'bg-teal-100'
          }`}>
            <Ionicons 
              name={getNotificationIcon(item.type)} 
              size={24} 
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
              }`} numberOfLines={3}>
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
    <>
      <TouchableOpacity
        onPress={() => setIsOpen(true)}
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
      >
        <Ionicons 
          name="notifications-outline" 
          size={24} 
          color={isDarkMode ? '#10B981' : '#14B8A6'} 
        />
        {unreadCount > 0 && (
          <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-[18px] h-[18px] items-center justify-center px-1"
            style={{
              shadowColor: '#EF4444',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.4,
              shadowRadius: 4,
              elevation: 4
            }}
          >
            <Text className="text-white text-xs font-bold">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsOpen(false)}
      >
        <View className="flex-1 bg-black/50">
          <TouchableOpacity 
            className="flex-1" 
            activeOpacity={1} 
            onPress={() => setIsOpen(false)}
          />
          <View className={`h-3/4 rounded-t-3xl ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            {/* Header */}
            <View className={`flex-row items-center justify-between p-4 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <View className="flex-row items-center">
                <View className={`p-2 rounded-lg mr-2 ${
                  isDarkMode ? 'bg-teal-500/20' : 'bg-teal-100'
                }`}>
                  <Ionicons 
                    name="notifications" 
                    size={20} 
                    color={isDarkMode ? '#5EEAD4' : '#14B8A6'} 
                  />
                </View>
                <Text className={`text-lg font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Notifications
                </Text>
                {unreadCount > 0 && (
                  <View className={`ml-2 px-2 py-0.5 rounded-full ${
                    isDarkMode ? 'bg-red-500/20' : 'bg-red-100'
                  }`}>
                    <Text className={`text-xs font-bold ${
                      isDarkMode ? 'text-red-400' : 'text-red-600'
                    }`}>
                      {unreadCount}
                    </Text>
                  </View>
                )}
              </View>
              <View className="flex-row items-center gap-2">
                {unreadCount > 0 && (
                  <TouchableOpacity
                    onPress={markAllAsRead}
                    className={`px-3 py-1.5 rounded-lg ${
                      isDarkMode ? 'bg-teal-500/20' : 'bg-teal-100'
                    }`}
                  >
                    <Text className={`text-xs font-semibold ${
                      isDarkMode ? 'text-teal-400' : 'text-teal-600'
                    }`}>
                      Mark all read
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => setIsOpen(false)}
                  className="p-1"
                >
                  <Ionicons 
                    name="close" 
                    size={24} 
                    color={isDarkMode ? '#9CA3AF' : '#6B7280'} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Notifications List */}
            {notifications.length === 0 ? (
              <View className="flex-1 items-center justify-center p-6">
                <View className={`w-20 h-20 rounded-full items-center justify-center mb-4 ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <Ionicons 
                    name="notifications-outline" 
                    size={40} 
                    color={isDarkMode ? '#4B5563' : '#9CA3AF'} 
                  />
                </View>
                <Text className={`text-lg font-semibold mb-2 ${
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
                contentContainerStyle={{ paddingVertical: 12 }}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

export default NotificationBell;
