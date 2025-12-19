import React from 'react';
import { View, Text, TouchableOpacity, FlatList, Image } from 'react-native';
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

const ConversationItem = React.memo(({ item, otherUser, unreadCount, isActive, onPress, isDarkMode }) => {
  const [imageError, setImageError] = React.useState(false);
  const imageUrl = getImageUrl(otherUser?.profileImage);

  React.useEffect(() => {
    if (otherUser) {
      console.log('ConversationItem - User:', otherUser.name, 'ProfileImage:', otherUser.profileImage, 'ImageURL:', imageUrl);
    }
  }, [otherUser, imageUrl]);

  const getBackgroundColor = () => {
    if (isActive) {
      return isDarkMode ? '#134E4A' : '#CCFBF1';
    }
    return isDarkMode ? '#1F2937' : '#FFFFFF';
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        marginHorizontal: 16,
        marginVertical: 6,
        padding: 14,
        borderRadius: 20,
        backgroundColor: getBackgroundColor(),
        borderWidth: isActive ? 2 : 0,
        borderColor: '#14B8A6',
        shadowColor: isActive ? '#14B8A6' : '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: isActive ? 0.25 : 0.08,
        shadowRadius: 12,
        elevation: isActive ? 5 : 2
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {/* Profile Image or Avatar */}
        <View style={{ marginRight: 14, position: 'relative' }}>
          {imageUrl && !imageError ? (
            <Image
              source={{ uri: imageUrl }}
              style={{ 
                width: 64, 
                height: 64, 
                borderRadius: 32,
                borderWidth: 3,
                borderColor: isActive ? '#14B8A6' : (isDarkMode ? '#374151' : '#E5E7EB')
              }}
              onError={() => setImageError(true)}
            />
          ) : (
            <View 
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#14B8A6',
                borderWidth: 3,
                borderColor: isActive ? '#0D9488' : (isDarkMode ? '#374151' : '#E5E7EB')
              }}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 24 }}>
                {otherUser?.name?.[0]?.toUpperCase() || '?'}
              </Text>
            </View>
          )}
          {/* Online indicator */}
          <View 
            style={{
              position: 'absolute',
              bottom: 2,
              right: 2,
              width: 18,
              height: 18,
              backgroundColor: '#10B981',
              borderRadius: 9,
              borderWidth: 3,
              borderColor: getBackgroundColor()
            }}
          />
        </View>
        
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={{
                fontWeight: '700',
                fontSize: 17,
                color: isDarkMode ? '#FFFFFF' : '#111827',
                marginBottom: 4
              }} numberOfLines={1}>
                {otherUser?.name || 'Unknown User'}
              </Text>
              {otherUser?.role && (
                <View style={{
                  paddingHorizontal: 10,
                  paddingVertical: 3,
                  borderRadius: 10,
                  backgroundColor: isDarkMode ? 'rgba(20, 184, 166, 0.25)' : 'rgba(20, 184, 166, 0.15)',
                  alignSelf: 'flex-start'
                }}>
                  <Text style={{
                    fontSize: 11,
                    fontWeight: '600',
                    textTransform: 'capitalize',
                    color: '#14B8A6'
                  }}>
                    {otherUser.role}
                  </Text>
                </View>
              )}
            </View>
            {item.lastMessageAt && (
              <Text style={{
                fontSize: 11,
                fontWeight: '600',
                color: isDarkMode ? '#9CA3AF' : '#6B7280'
              }}>
                {formatDistanceToNow(item.lastMessageAt.toDate())}
              </Text>
            )}
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
            <Text 
              style={{
                flex: 1,
                fontSize: 14,
                fontWeight: unreadCount > 0 ? '600' : '400',
                color: unreadCount > 0 
                  ? (isDarkMode ? '#D1D5DB' : '#374151')
                  : (isDarkMode ? '#9CA3AF' : '#6B7280'),
                lineHeight: 20
              }}
              numberOfLines={2}
            >
              {item.lastMessage || 'No messages yet'}
            </Text>
            
            {unreadCount > 0 && (
              <View 
                style={{
                  marginLeft: 12,
                  borderRadius: 14,
                  minWidth: 28,
                  height: 28,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: 10,
                  backgroundColor: '#14B8A6',
                  shadowColor: '#14B8A6',
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.5,
                  shadowRadius: 6,
                  elevation: 5
                }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '700' }}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const ConversationsList = ({ users = [], onSelectConversation }) => {
  const { conversations, activeConversation, setActiveConversation, userId } = useChat();
  const { isDarkMode } = useTheme();

  // Filter out conversations with no messages
  const conversationsWithMessages = conversations.filter(conv => 
    conv.lastMessage && conv.lastMessage.trim() !== ''
  );

  const getOtherUser = (conversation) => {
    if (!conversation || !conversation.participants) return null;
    const otherUserId = conversation.participants.find(p => p !== userId);
    
    const foundUser = users.find(u => u.id === otherUserId);
    
    return foundUser || { 
      id: otherUserId, 
      name: 'Unknown User',
      role: 'user'
    };
  };

  const handleSelectConversation = (conversation) => {
    setActiveConversation(conversation);
    onSelectConversation?.(conversation);
  };

  const renderConversation = ({ item }) => {
    const otherUser = getOtherUser(item);
    const unreadCount = item.unreadCount?.[userId] || 0;
    const isActive = activeConversation?.id === item.id;

    return (
      <ConversationItem
        item={item}
        otherUser={otherUser}
        unreadCount={unreadCount}
        isActive={isActive}
        onPress={() => handleSelectConversation(item)}
        isDarkMode={isDarkMode}
      />
    );
  };

  if (conversationsWithMessages.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <View style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
          backgroundColor: isDarkMode ? '#374151' : '#F3F4F6'
        }}>
          <Ionicons 
            name="chatbubbles-outline" 
            size={40} 
            color={isDarkMode ? '#4B5563' : '#9CA3AF'} 
          />
        </View>
        <Text style={{
          fontSize: 18,
          fontWeight: '600',
          marginBottom: 8,
          color: isDarkMode ? '#FFFFFF' : '#111827'
        }}>
          No conversations yet
        </Text>
        <Text style={{
          textAlign: 'center',
          color: isDarkMode ? '#9CA3AF' : '#4B5563'
        }}>
          Start a conversation to connect with others
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={conversationsWithMessages}
      renderItem={renderConversation}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingBottom: 20 }}
    />
  );
};

export default ConversationsList;
