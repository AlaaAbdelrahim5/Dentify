import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useChat } from '../../../contexts/ChatContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { formatDistanceToNow } from '../../../utils/dateUtils';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

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
        marginHorizontal: 0,
        marginBottom: 2,
        paddingHorizontal: 18,
        paddingVertical: 14,
        backgroundColor: isActive ? (isDarkMode ? 'rgba(20, 184, 166, 0.15)' : 'rgba(20, 184, 166, 0.08)') : 'transparent',
        borderLeftWidth: isActive ? 1.5 : 0,
        borderLeftColor: '#14B8A6',
        shadowColor: isActive ? '#14B8A6' : 'transparent',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isActive ? 0.2 : 0,
        shadowRadius: 4,
        elevation: isActive ? 3 : 0
      }}
      activeOpacity={0.7}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {/* Profile Image or Avatar */}
        <View style={{ marginRight: 14, position: 'relative' }}>
          {imageUrl && !imageError ? (
            <Image
              source={{ uri: imageUrl }}
              style={{ 
                width: 60, 
                height: 60, 
                borderRadius: 30,
                borderWidth: isActive ? 1.5 : 0,
                borderColor: '#14B8A6'
              }}
              onError={() => setImageError(true)}
            />
          ) : (
            <View 
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#14B8A6',
                borderWidth: isActive ? 1.5 : 0,
                borderColor: '#0D9488'
              }}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 24 }}>
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
              borderWidth: 2.5,
              borderColor: isDarkMode ? '#111827' : '#FFFFFF'
            }}
          />
        </View>
        
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={{
              fontWeight: '700',
              fontSize: 17,
              letterSpacing: -0.3,
              color: isDarkMode ? '#FFFFFF' : '#111827',
              flex: 1
            }} numberOfLines={1}>
              {otherUser?.name || 'Unknown User'}
            </Text>
            {item.lastMessageAt && (
              <Text style={{
                fontSize: 12,
                fontWeight: '600',
                color: isDarkMode ? '#6B7280' : '#9CA3AF',
                marginLeft: 10
              }}>
                {formatDistanceToNow(item.lastMessageAt.toDate())}
              </Text>
            )}
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {otherUser?.role && (
              <View style={{
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 4,
                backgroundColor: isDarkMode ? 'rgba(20, 184, 166, 0.2)' : 'rgba(20, 184, 166, 0.12)',
                marginRight: 8
              }}>
                <Text style={{
                  fontSize: 10,
                  fontWeight: '600',
                  textTransform: 'capitalize',
                  color: '#14B8A6'
                }}>
                  {otherUser.role}
                </Text>
              </View>
            )}
            <Text 
              style={{
                flex: 1,
                fontSize: 14,
                fontWeight: unreadCount > 0 ? '500' : '400',
                color: isDarkMode ? '#9CA3AF' : '#6B7280'
              }}
              numberOfLines={1}
            >
              {item.lastMessage || 'No messages yet'}
            </Text>
            
            {unreadCount > 0 && (
              <View 
                style={{
                  marginLeft: 8,
                  borderRadius: 10,
                  minWidth: 20,
                  height: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: 6,
                  backgroundColor: '#14B8A6'
                }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}>
                  {unreadCount > 99 ? '99' : unreadCount}
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
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

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

  // Filter conversations based on search query
  const filteredConversations = conversationsWithMessages.filter(conv => {
    if (!searchQuery.trim()) return true;
    const otherUser = getOtherUser(conv);
    const userName = otherUser?.name?.toLowerCase() || '';
    const userRole = otherUser?.role?.toLowerCase() || '';
    const lastMessage = conv.lastMessage?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return userName.includes(query) || userRole.includes(query) || lastMessage.includes(query);
  });

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
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={{
          backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
          borderBottomWidth: 1,
          borderBottomColor: isDarkMode ? '#374151' : '#E5E7EB'
        }}>
          {/* Search Bar */}
          <View style={{
            paddingHorizontal: 16,
            paddingVertical: 12
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor: isDarkMode ? '#374151' : '#F3F4F6'
            }}>
              <Ionicons name="search" size={18} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search messages..."
                placeholderTextColor={isDarkMode ? '#6B7280' : '#9CA3AF'}
                style={{
                  flex: 1,
                  marginLeft: 8,
                  fontSize: 15,
                  color: isDarkMode ? '#FFFFFF' : '#111827'
                }}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

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
      </View>
    );
  }

  const emptySearchResult = searchQuery.trim() && filteredConversations.length === 0;

  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View style={{
        backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: isDarkMode ? '#374151' : '#E5E7EB'
      }}>
        {/* Search Bar */}
        <View style={{
          paddingHorizontal: 16,
          paddingVertical: 12
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 20,
            backgroundColor: isDarkMode ? '#374151' : '#F3F4F6'
          }}>
            <Ionicons name="search" size={18} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search messages..."
              placeholderTextColor={isDarkMode ? '#6B7280' : '#9CA3AF'}
              style={{
                flex: 1,
                marginLeft: 8,
                fontSize: 15,
                color: isDarkMode ? '#FFFFFF' : '#111827'
              }}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {emptySearchResult ? (
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
              name="search-outline" 
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
            No results found
          </Text>
          <Text style={{
            textAlign: 'center',
            color: isDarkMode ? '#9CA3AF' : '#4B5563'
          }}>
            Try searching with different keywords
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredConversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
};

export default ConversationsList;
