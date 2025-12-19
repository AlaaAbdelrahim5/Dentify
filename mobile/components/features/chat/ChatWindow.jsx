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
  // If it's a data URI (base64), return as-is
  if (imagePath.startsWith('data:')) {
    return imagePath;
  }
  // If it's already a full URL, return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  // Otherwise, construct the URL
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
      <View className="px-5 mb-2.5">
        {showTime && item.createdAt && (
          <View 
            className={`self-center px-4 py-2 rounded-full mb-5 ${
              isDarkMode ? 'bg-gray-800' : 'bg-gray-200'
            }`}
          >
            <Text className={`text-xs font-semibold ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {formatDistanceToNow(item.createdAt.toDate())}
            </Text>
          </View>
        )}
        <View className={`flex-row ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
          <View 
            className={`max-w-[78%] px-5 py-3.5 ${
              isOwnMessage 
                ? 'rounded-3xl rounded-br-md' 
                : 'rounded-3xl rounded-bl-md'
            }`}
            style={{
              backgroundColor: isOwnMessage 
                ? '#14B8A6' 
                : (isDarkMode ? '#374151' : '#FFFFFF'),
              shadowColor: isOwnMessage ? '#14B8A6' : '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isOwnMessage ? 0.35 : 0.08,
              shadowRadius: 4,
              elevation: 3
            }}
          >
            <Text className={`text-[15px] leading-6 ${
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
      <View className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {/* Chat Header */}
        <View 
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 16,
            backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.12,
            shadowRadius: 6,
            elevation: 8
          }}
        >
          <View className="flex-row items-center flex-1">
            {onBack && (
              <TouchableOpacity 
                onPress={onBack} 
                className="mr-3 p-2.5 rounded-full"
                style={{ backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' }}
              >
                <Ionicons name="arrow-back" size={22} color={isDarkMode ? '#fff' : '#000'} />
              </TouchableOpacity>
            )}
            {/* Profile Image or Avatar */}
            <View className="mr-4 relative">
              {imageUrl && !imageError ? (
                <Image
                  source={{ uri: imageUrl }}
                  style={{ 
                    width: 52, 
                    height: 52, 
                    borderRadius: 26,
                    borderWidth: 3,
                    borderColor: '#14B8A6'
                  }}
                  onError={() => setImageError(true)}
                />
              ) : (
                <View 
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 26,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#14B8A6',
                    borderWidth: 3,
                    borderColor: '#0D9488'
                  }}
                >
                  <Text className="text-white font-bold text-xl">
                    {otherUser?.name?.[0]?.toUpperCase() || '?'}
                  </Text>
                </View>
              )}
              <View 
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 16,
                  height: 16,
                  backgroundColor: '#10B981',
                  borderRadius: 8,
                  borderWidth: 3,
                  borderColor: isDarkMode ? '#1F2937' : '#FFFFFF'
                }}
              />
            </View>
            <View className="flex-1">
              <Text className={`font-bold text-lg ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`} numberOfLines={1}>
                {otherUser?.name || 'Unknown User'}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                <View style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: '#10B981',
                  marginRight: 6
                }} />
                <Text className={`text-sm font-semibold capitalize ${
                  isDarkMode ? 'text-teal-400' : 'text-teal-600'
                }`}>
                  {otherUser?.role || 'User'} • Online
                </Text>
              </View>
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
          className={`flex-row items-end px-5 py-4 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: 0.12,
            shadowRadius: 6,
            elevation: 8
          }}
        >
          <View 
            className={`flex-1 flex-row items-center px-5 py-2.5 rounded-3xl mr-3 ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
            }`}
            style={{
              minHeight: 48,
              maxHeight: 120
            }}
          >
            <TextInput
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type a message..."
              placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
              className={`flex-1 text-[15px] ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
              multiline
              maxLength={1000}
              style={{ paddingTop: 11, paddingBottom: 11 }}
            />
          </View>
          <TouchableOpacity
            onPress={handleSendMessage}
            disabled={!newMessage.trim()}
            className="rounded-full items-center justify-center"
            style={{
              width: 52,
              height: 52,
              backgroundColor: newMessage.trim() ? '#14B8A6' : (isDarkMode ? '#374151' : '#E5E7EB'),
              shadowColor: newMessage.trim() ? '#14B8A6' : '#000',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: newMessage.trim() ? 0.5 : 0.1,
              shadowRadius: 6,
              elevation: newMessage.trim() ? 5 : 2
            }}
          >
            <Ionicons 
              name="send" 
              size={24} 
              color="white" 
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatWindow;
