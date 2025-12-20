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
      // Error handled by context
    }
  };

  const renderMessage = ({ item, index }) => {
    const isOwnMessage = item.senderId === userId;
    const showTime = index === 0 || 
      (messages[index - 1] && 
       Math.abs(item.createdAt?.toMillis() - messages[index - 1].createdAt?.toMillis()) > 300000);

    return (
      <View className="px-4 mb-1.5">
        {showTime && item.createdAt && (
          <View 
            className={`self-center px-3 py-1 rounded-full mb-3 ${
              isDarkMode ? 'bg-gray-800' : 'bg-gray-200'
            }`}
          >
            <Text className={`text-[10px] font-medium ${
              isDarkMode ? 'text-gray-500' : 'text-gray-600'
            }`}>
              {formatDistanceToNow(item.createdAt.toDate())}
            </Text>
          </View>
        )}
        <View className={`flex-row ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
          <View 
            className={`max-w-[75%] px-4 py-2.5 ${
              isOwnMessage 
                ? 'rounded-2xl rounded-br-sm' 
                : 'rounded-2xl rounded-bl-sm'
            }`}
            style={{
              backgroundColor: isOwnMessage 
                ? '#14B8A6' 
                : (isDarkMode ? '#374151' : '#FFFFFF'),
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 1
            }}
          >
            <Text className={`text-sm leading-5 ${
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
            paddingHorizontal: 16,
            paddingVertical: 12,
            backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
            borderBottomWidth: 1,
            borderBottomColor: isDarkMode ? '#374151' : '#E5E7EB'
          }}
        >
          {onBack && (
            <TouchableOpacity 
              onPress={onBack} 
              style={{
                marginRight: 12,
                width: 36,
                height: 36,
                borderRadius: 18,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isDarkMode ? '#374151' : '#F3F4F6'
              }}
            >
              <Ionicons name="chevron-back" size={22} color={isDarkMode ? '#fff' : '#000'} />
            </TouchableOpacity>
          )}
          {/* Profile Image or Avatar */}
          <View style={{ marginRight: 12, position: 'relative' }}>
            {imageUrl && !imageError ? (
              <Image
                source={{ uri: imageUrl }}
                style={{ 
                  width: 44, 
                  height: 44, 
                  borderRadius: 22
                }}
                onError={() => setImageError(true)}
              />
            ) : (
              <View 
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#14B8A6'
                }}
              >
                <Text className="text-white font-bold text-lg">
                  {otherUser?.name?.[0]?.toUpperCase() || '?'}
                </Text>
              </View>
            )}
            <View 
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 12,
                height: 12,
                backgroundColor: '#10B981',
                borderRadius: 6,
                borderWidth: 2,
                borderColor: isDarkMode ? '#1F2937' : '#FFFFFF'
              }}
            />
          </View>
          <View className="flex-1">
            <Text className={`font-semibold text-base ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`} numberOfLines={1}>
              {otherUser?.name || 'Unknown User'}
            </Text>
            <Text className={`text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <Text style={{ color: '#10B981' }}>● </Text>
              {otherUser?.role || 'User'}
            </Text>
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
            borderTopWidth: 1,
            borderTopColor: isDarkMode ? '#374151' : '#E5E7EB'
          }}
        >
          <View 
            className={`flex-1 flex-row items-center px-4 py-2 rounded-3xl mr-2 ${
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
              placeholder="Message..."
              placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'}
              className={`flex-1 text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
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
              width: 44,
              height: 44,
              backgroundColor: newMessage.trim() ? '#14B8A6' : (isDarkMode ? '#374151' : '#E5E7EB')
            }}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color="white" 
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatWindow;
