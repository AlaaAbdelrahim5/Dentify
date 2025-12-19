import React from 'react';
import { View, Text, TouchableOpacity, FlatList, Image } from 'react-native';
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
        marginHorizontal: 12,
        marginVertical: 8,
        padding: 16,
        borderRadius: 16,
        backgroundColor: getBackgroundColor(),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {/* Profile Image or Avatar */}
        <View style={{ marginRight: 16, position: 'relative' }}>
          {imageUrl && !imageError ? (
            <Image
              source={{ uri: imageUrl }}
              style={{ 
                width: 56, 
                height: 56, 
                borderRadius: 28,
                borderWidth: 2,
                borderColor: isDarkMode ? '#14B8A6' : '#5EEAD4'
              }}
              onError={() => setImageError(true)}
            />
          ) : (
            <View 
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isDarkMode ? '#14B8A6' : '#5EEAD4',
                borderWidth: 2,
                borderColor: isDarkMode ? '#0D9488' : '#2DD4BF'
              }}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 20 }}>
                {otherUser?.name?.[0]?.toUpperCase() || '?'}
              </Text>
            </View>
          )}
          {/* Online indicator */}
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
        
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}>
              <Text style={{
                fontWeight: 'bold',
                fontSize: 16,
                marginRight: 8,
                color: isDarkMode ? '#FFFFFF' : '#111827'
              }} numberOfLines={1}>
                {otherUser?.name || 'Unknown User'}
              </Text>
              {otherUser?.role && (
                <View style={{
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 12,
                  backgroundColor: isDarkMode ? 'rgba(20, 184, 166, 0.2)' : '#CCFBF1'
                }}>
                  <Text style={{
                    fontSize: 12,
                    fontWeight: '500',
                    textTransform: 'capitalize',
                    color: isDarkMode ? '#5EEAD4' : '#0F766E'
                  }}>
                    {otherUser.role}
                  </Text>
                </View>
              )}
            </View>
            {item.lastMessageAt && (
              <Text style={{
                fontSize: 12,
                fontWeight: '500',
                color: isDarkMode ? '#9CA3AF' : '#6B7280'
              }}>
                {formatDistanceToNow(item.lastMessageAt.toDate())}
              </Text>
            )}
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text 
              style={{
                flex: 1,
                fontSize: 14,
                fontWeight: unreadCount > 0 ? '600' : 'normal',
                color: unreadCount > 0 
                  ? (isDarkMode ? '#FFFFFF' : '#111827')
                  : (isDarkMode ? '#9CA3AF' : '#4B5563')
              }}
              numberOfLines={1}
            >
              {item.lastMessage || 'No messages yet'}
            </Text>
            
            {unreadCount > 0 && (
              <View 
                style={{
                  marginLeft: 12,
                  borderRadius: 12,
                  minWidth: 24,
                  height: 24,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: 8,
                  backgroundColor: '#14B8A6',
                  shadowColor: '#14B8A6',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.4,
                  shadowRadius: 4,
                  elevation: 4
                }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' }}>
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

  if (conversations.length === 0) {
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
      data={conversations}
      renderItem={renderConversation}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingBottom: 20 }}
    />
  );
};

export default ConversationsList;
