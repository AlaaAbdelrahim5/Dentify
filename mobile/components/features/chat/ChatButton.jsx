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
        name="chatbubbles-outline" 
        size={24} 
        color={isDarkMode ? '#10B981' : '#14B8A6'} 
      />
      {totalUnreadCount > 0 && (
        <View className="absolute -top-1 -right-1 bg-teal-500 rounded-full min-w-[18px] h-[18px] items-center justify-center px-1"
          style={{
            shadowColor: '#14B8A6',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.4,
            shadowRadius: 4,
            elevation: 4
          }}
        >
          <Text className="text-white text-xs font-bold">
            {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default ChatButton;
