import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  getUserConversations,
  createOrGetConversation,
  sendMessage,
  listenToMessages,
  markMessagesAsRead
} from '../services/firebase/chatService';
import { jwtDecode } from 'jwt-decode';
import { authUtils } from '../utils/auth';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [userId, setUserId] = useState(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        // Get user from token
        const currentToken = await authUtils.getAccessToken();
        
        if (!currentToken) {
          // Clear all state if no token
          console.log('ChatContext: No token found, clearing state');
          setUserId(null);
          setConversations([]);
          setActiveConversation(null);
          setMessages([]);
          setTotalUnreadCount(0);
          setIsLoadingConversations(false);
          return;
        }

        const decoded = jwtDecode(currentToken);
        console.log('ChatContext: Decoded JWT token:', decoded);
        
        // Ensure userId is a number to match database format
        const currentUserId = Number(decoded.userId || decoded.id);
        console.log('ChatContext: Extracted userId:', currentUserId, 'Type:', typeof currentUserId);
        
        if (!currentUserId || isNaN(currentUserId)) {
          console.error('ChatContext: Invalid userId extracted from token');
          setIsLoadingConversations(false);
          return;
        }
        
        // Always update userId to ensure it's current
        setUserId(currentUserId);
        setIsLoadingConversations(true);

        // Listen for conversations
        console.log('ChatContext: Setting up listener for userId:', currentUserId);
        const unsubscribe = getUserConversations(currentUserId, (convs) => {
          console.log('ChatContext: Received', convs.length, 'conversations for user', currentUserId);
          console.log('ChatContext: Conversations:', convs);
          setConversations(convs);
          setIsLoadingConversations(false);
        });

        return () => {
          console.log('ChatContext: Cleaning up listener for user', currentUserId);
          unsubscribe && unsubscribe();
        };
      } catch (error) {
        console.error('ChatContext: Error initializing chat:', error);
        // Clear state on error
        setUserId(null);
        setConversations([]);
        setActiveConversation(null);
        setMessages([]);
        setTotalUnreadCount(0);
        setIsLoadingConversations(false);
      }
    };

    initializeChat();
  }, []);

  // Recalculate total unread count when conversations or activeConversation changes
  useEffect(() => {
    if (!userId) return;
    
    const total = conversations.reduce((sum, conv) => {
      // Don't count unread messages from the currently active conversation
      if (activeConversation?.id === conv.id) {
        return sum;
      }
      return sum + (conv.unreadCount?.[userId] || 0);
    }, 0);
    
    console.log('ChatContext: Recalculated total unread count:', total, 'activeConversation:', activeConversation?.id);
    setTotalUnreadCount(total);
  }, [conversations, activeConversation, userId]);

  useEffect(() => {
    if (!activeConversation) {
      setMessages([]);
      return;
    }

    // Listen for messages in active conversation
    const unsubscribe = listenToMessages(activeConversation.id, (msgs) => {
      setMessages(msgs);
    });

    return () => unsubscribe && unsubscribe();
  }, [activeConversation]);

  const startConversation = async (otherUserId) => {
    try {
      const conversation = await createOrGetConversation(userId, otherUserId);
      setActiveConversation(conversation);
      return conversation;
    } catch (error) {
      console.error('Error starting conversation:', error);
      throw error;
    }
  };

  const sendChatMessage = async (message, type = 'text') => {
    if (!activeConversation || !userId) return;

    try {
      await sendMessage(activeConversation.id, userId, message, type);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const markConversationAsRead = async (conversationId) => {
    if (!userId) return;
    
    try {
      await markMessagesAsRead(conversationId, userId);
    } catch (error) {
      console.error('Error marking conversation as read:', error);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversation,
        setActiveConversation,
        messages,
        totalUnreadCount,
        userId,
        isLoadingConversations,
        startConversation,
        sendChatMessage,
        markConversationAsRead
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
