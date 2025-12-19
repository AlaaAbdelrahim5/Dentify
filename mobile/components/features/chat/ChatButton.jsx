import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useChat } from '../../../contexts/ChatContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { useRouter } from 'expo-router';

const ChatButton = () => {
  const { totalUnreadCount } = useChat();
  const { isDarkMode } = useTheme();
  const router = useRouter();

  const handlePress = () => {
    // Navigate to chat screen - adjust the route based on your navigation setup
    router.push('/dashboard/chat');
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="relative p-2"
    >
      <Ionicons 
        name="chatbubbles-outline" 
        size={24} 
        color={isDarkMode ? '#9CA3AF' : '#4B5563'} 
      />
      {totalUnreadCount > 0 && (
        <View className="absolute -top-1 -right-1 bg-teal-500 rounded-full min-w-[18px] h-[18px] items-center justify-center px-1">
          <Text className="text-white text-xs font-bold">
            {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default ChatButton;
