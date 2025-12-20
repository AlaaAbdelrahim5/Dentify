import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ActivityIndicator, TouchableOpacity, Modal, TextInput, FlatList, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useChat } from '../../contexts/ChatContext';
import { useTheme } from '../../contexts/ThemeContext';
import { authUtils } from '../../utils/auth';
import ConversationsList from '../../components/features/chat/ConversationsList';
import ChatWindow from '../../components/features/chat/ChatWindow';
import { userAPI } from '../../services/api';

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

const ChatScreen = () => {
  const { activeConversation, setActiveConversation, userId, startConversation } = useChat();
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Fetch users list for displaying names in conversations
    const fetchUsers = async () => {
      try {
        setIsLoadingUsers(true);
        const response = await userAPI.getAll();
        
        // Handle both response formats: direct array or wrapped in data property
        const usersData = Array.isArray(response) ? response : (response.data || []);
        
        // Filter users based on role
        const currentUser = authUtils.getCurrentUser();
        const currentUserRole = currentUser?.role?.toLowerCase();
        
        const filteredUsers = usersData.filter(u => {
          // Exclude current user
          if (u.id === userId) return false;
          
          // If current user is a patient, exclude other patients
          if (currentUserRole === 'patient' && u.role?.toLowerCase() === 'patient') {
            return false;
          }
          
          return true;
        });
        
        setUsers(filteredUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [userId]);

  const getOtherUser = (conversation) => {
    if (!conversation) {
      return null;
    }
    const otherUserId = conversation.participants.find(p => p !== userId);
    const foundUser = users.find(u => u.id === otherUserId);
    return foundUser;
  };

  const handleStartConversation = async (user) => {
    try {
      const conversation = await startConversation(user.id);
      setIsNewChatModalOpen(false);
      setSearchTerm('');
      setActiveConversation(conversation);
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const UserItem = React.memo(({ item }) => {
    const [imageError, setImageError] = useState(false);
    const imageUrl = getImageUrl(item.profileImage);

    return (
      <TouchableOpacity
        onPress={() => handleStartConversation(item)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 16,
          marginBottom: 8,
          borderRadius: 12,
          backgroundColor: isDarkMode ? '#1F2937' : '#F9FAFB'
        }}
      >
        {imageUrl && !imageError ? (
          <Image
            source={{ uri: imageUrl }}
            style={{ width: 48, height: 48, borderRadius: 24, marginRight: 12 }}
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: '#14B8A6',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12
          }}>
            <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 18 }}>
              {item.name?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={{
            fontWeight: 'bold',
            marginBottom: 4,
            color: isDarkMode ? '#FFFFFF' : '#111827'
          }}>
            {item.name}
          </Text>
          <Text style={{
            fontSize: 14,
            color: isDarkMode ? '#9CA3AF' : '#4B5563'
          }}>
            {item.email}
          </Text>
          <Text style={{
            fontSize: 12,
            marginTop: 4,
            textTransform: 'capitalize',
            color: isDarkMode ? '#5EEAD4' : '#0D9488'
          }}>
            {item.role}
          </Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={isDarkMode ? '#6B7280' : '#9CA3AF'}
        />
      </TouchableOpacity>
    );
  });

  if (isLoadingUsers) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: isDarkMode ? '#111827' : '#FFFFFF' }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#14B8A6" />
          <Text style={{ marginTop: 16, color: isDarkMode ? '#9CA3AF' : '#4B5563' }}>
            Loading conversations...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDarkMode ? '#111827' : '#FFFFFF' }}>
      {/* Header */}
      {!activeConversation && (
        <View 
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingVertical: 16,
            backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 5
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isDarkMode ? '#374151' : '#F3F4F6'
              }}
            >
              <Ionicons name="chevron-back" size={20} color={isDarkMode ? '#FFFFFF' : '#111827'} />
            </TouchableOpacity>
            <Text style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: isDarkMode ? '#FFFFFF' : '#111827'
            }}>
              Messages
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setIsNewChatModalOpen(true)}
            style={{
              borderRadius: 24,
              padding: 12,
              backgroundColor: '#14B8A6',
              shadowColor: '#14B8A6',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.4,
              shadowRadius: 4,
              elevation: 4
            }}
          >
            <Ionicons name="create-outline" size={22} color="white" />
          </TouchableOpacity>
        </View>
      )}

      <View style={{ flex: 1, flexDirection: 'row' }}>
        {/* Conversations List */}
        <View style={{
          width: '100%',
          display: activeConversation ? 'none' : 'flex',
          backgroundColor: isDarkMode ? '#111827' : '#FFFFFF'
        }}>
          <ConversationsList 
            users={users}
            onSelectConversation={(conversation) => {
              // On mobile, we show chat window in full screen
            }}
          />
        </View>

        {/* Chat Window */}
        {activeConversation && (
          <View style={{ flex: 1 }}>
            <ChatWindow 
              conversation={activeConversation}
              otherUser={getOtherUser(activeConversation)}
              onBack={() => setActiveConversation(null)}
            />
          </View>
        )}
      </View>

      {/* New Chat Modal */}
      <Modal
        visible={isNewChatModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setIsNewChatModalOpen(false);
          setSearchTerm('');
        }}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <View style={{
            marginTop: 'auto',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: '80%',
            backgroundColor: isDarkMode ? '#111827' : '#FFFFFF'
          }}>
            {/* Modal Header */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 24,
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: isDarkMode ? '#374151' : '#E5E7EB'
            }}>
              <Text style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: isDarkMode ? '#FFFFFF' : '#111827'
              }}>
                New Conversation
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setIsNewChatModalOpen(false);
                  setSearchTerm('');
                }}
                style={{ padding: 8 }}
              >
                <Ionicons name="close" size={24} color={isDarkMode ? '#fff' : '#000'} />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderRadius: 12,
                backgroundColor: isDarkMode ? '#1F2937' : '#F3F4F6'
              }}>
                <Ionicons name="search" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                <TextInput
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                  placeholder="Search by name or email..."
                  placeholderTextColor={isDarkMode ? '#6B7280' : '#9CA3AF'}
                  style={{
                    flex: 1,
                    marginLeft: 8,
                    color: isDarkMode ? '#FFFFFF' : '#111827'
                  }}
                />
              </View>
            </View>

            {/* Users List */}
            <FlatList
              data={filteredUsers}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
              ListEmptyComponent={
                <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 48 }}>
                  <Ionicons
                    name="people-outline"
                    size={48}
                    color={isDarkMode ? '#4B5563' : '#9CA3AF'}
                  />
                  <Text style={{
                    marginTop: 16,
                    textAlign: 'center',
                    color: isDarkMode ? '#9CA3AF' : '#4B5563'
                  }}>
                    {searchTerm ? 'No users found' : 'No users available'}
                  </Text>
                </View>
              }
              renderItem={({ item }) => <UserItem item={item} />}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ChatScreen;
