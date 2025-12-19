import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useChat } from '../../../contexts/ChatContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { formatDistanceToNow } from '../../../utils/dateUtils';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.1.15:5000';

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  return `${API_BASE_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
};

const ChatWindow = ({ conversation, otherUser, onBack }) => {
  const { messages, sendChatMessage, markConversationAsRead, userId } = useChat();
  const { isDarkMode } = useTheme();
  const [newMessage, setNewMessage] = useState('');
  const [imageError, setImageError] = useState(false);
  const flatListRef = useRef(null);

  const imageUrl = getImageUrl(otherUser?.profileImage);

  useEffect(() => {
    if (otherUser) {
      console.log('ChatWindow - User:', otherUser.name, 'ProfileImage:', otherUser.profileImage, 'ImageURL:', imageUrl);
    }
  }, [otherUser, imageUrl]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  useEffect(() => {
    // Mark messages as read when opening conversation
    if (conversation?.id) {
      markConversationAsRead(conversation.id);
    }
  }, [conversation?.id]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await sendChatMessage(newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const renderMessage = ({ item, index }) => {
    const isOwnMessage = item.senderId === userId;
    const showTime = index === 0 || 
      (messages[index - 1] && 
       Math.abs(item.createdAt?.toMillis() - messages[index - 1].createdAt?.toMillis()) > 300000); // 5 minutes

    return (
      <View className="px-4 mb-3">
        {showTime && item.createdAt && (
          <View 
            className={`self-center px-3 py-1.5 rounded-full mb-4 ${
              isDarkMode ? 'bg-gray-800' : 'bg-gray-200'
            }`}
          >
            <Text className={`text-xs font-medium ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {formatDistanceToNow(item.createdAt.toDate())}
            </Text>
          </View>
        )}
        <View className={`flex-row ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
          <View 
            className={`max-w-[75%] px-4 py-3 ${
              isOwnMessage 
                ? 'rounded-3xl rounded-br-lg' 
                : 'rounded-3xl rounded-bl-lg'
            }`}
            style={{
              backgroundColor: isOwnMessage 
                ? '#14B8A6' 
                : (isDarkMode ? '#374151' : '#F3F4F6'),
              shadowColor: isOwnMessage ? '#14B8A6' : '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: isOwnMessage ? 0.3 : 0.05,
              shadowRadius: 3,
              elevation: 2
            }}
          >
            <Text className={`text-base leading-5 ${
              isOwnMessage 
                ? 'text-white' 
                : (isDarkMode ? 'text-white' : 'text-gray-900')
            }`}>
              {item.message}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (!conversation) {
    return (
      <View className={`flex-1 items-center justify-center ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <View className={`w-24 h-24 rounded-full items-center justify-center mb-4 ${
          isDarkMode ? 'bg-gray-800' : 'bg-gray-200'
        }`}>
          <Ionicons 
            name="chatbubbles-outline" 
            size={48} 
            color={isDarkMode ? '#5EEAD4' : '#14B8A6'} 
          />
        </View>
        <Text className={`text-xl font-bold mb-2 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Select a conversation
        </Text>
        <Text className={`text-center ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Choose a conversation from the list to start chatting
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
      keyboardVerticalOffset={100}
    >
      <View className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
        {/* Chat Header */}
        <View 
          className={`flex-row items-center px-5 py-4 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 5
          }}
        >
          <View className="flex-row items-center flex-1">
            {onBack && (
              <TouchableOpacity 
                onPress={onBack} 
                className="mr-4 p-2 rounded-full"
                style={{ backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' }}
              >
                <Ionicons name="arrow-back" size={20} color={isDarkMode ? '#fff' : '#000'} />
              </TouchableOpacity>
            )}
            {/* Profile Image or Avatar */}
            <View className="mr-3 relative">
              {imageUrl && !imageError ? (
                <Image
                  source={{ uri: imageUrl }}
                  style={{ 
                    width: 44, 
                    height: 44, 
                    borderRadius: 22,
                    borderWidth: 2,
                    borderColor: '#14B8A6'
                  }}
                  onError={() => setImageError(true)}
                />
              ) : (
                <View 
                  className="w-11 h-11 rounded-full items-center justify-center"
                  style={{
                    backgroundColor: '#14B8A6',
                    borderWidth: 2,
                    borderColor: '#0D9488'
                  }}
                >
                  <Text className="text-white font-bold text-base">
                    {otherUser?.name?.[0]?.toUpperCase() || '?'}
                  </Text>
                </View>
              )}
              <View 
                className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full"
                style={{
                  borderWidth: 2,
                  borderColor: isDarkMode ? '#1F2937' : '#FFFFFF'
                }}
              />
            </View>
            <View className="flex-1">
              <Text className={`font-bold text-base ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`} numberOfLines={1}>
                {otherUser?.name || 'Unknown User'}
              </Text>
              <Text className={`text-xs font-medium capitalize ${
                isDarkMode ? 'text-teal-400' : 'text-teal-600'
              }`}>
                {otherUser?.role || 'User'} • Online
              </Text>
            </View>
          </View>
        </View>

        {/* Messages Area */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 16 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Message Input */}
        <View 
          className={`flex-row items-end px-4 py-3 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 5
          }}
        >
          <View 
            className={`flex-1 flex-row items-center px-4 py-2 rounded-3xl mr-3 ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
            }`}
            style={{
              minHeight: 44,
              maxHeight: 100
            }}
          >
            <TextInput
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type a message..."
              placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
              className={`flex-1 text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
              multiline
              maxLength={1000}
              style={{ paddingTop: 10, paddingBottom: 10 }}
            />
          </View>
          <TouchableOpacity
            onPress={handleSendMessage}
            disabled={!newMessage.trim()}
            className="rounded-full items-center justify-center"
            style={{
              width: 48,
              height: 48,
              backgroundColor: newMessage.trim() ? '#14B8A6' : (isDarkMode ? '#374151' : '#E5E7EB'),
              shadowColor: newMessage.trim() ? '#14B8A6' : '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: newMessage.trim() ? 0.4 : 0.1,
              shadowRadius: 4,
              elevation: 3
            }}
          >
            <Ionicons 
              name="send" 
              size={22} 
              color="white" 
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatWindow;
