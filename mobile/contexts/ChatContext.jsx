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
          setUserId(null);
          setConversations([]);
          setActiveConversation(null);
          setMessages([]);
          setTotalUnreadCount(0);
          setIsLoadingConversations(false);
          return;
        }

        const decoded = jwtDecode(currentToken);
        
        // Ensure userId is a number to match database format
        const currentUserId = Number(decoded.userId || decoded.id);
        
        if (!currentUserId || isNaN(currentUserId)) {
          setIsLoadingConversations(false);
          return;
        }
        
        // Always update userId to ensure it's current
        setUserId(currentUserId);
        setIsLoadingConversations(true);

        // Listen for conversations
        const unsubscribe = getUserConversations(currentUserId, (convs) => {
          setConversations(convs);
          setIsLoadingConversations(false);
        });

        return () => {
          unsubscribe && unsubscribe();
        };
      } catch (error) {
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
      throw error;
    }
  };

  const sendChatMessage = async (message, type = 'text') => {
    if (!activeConversation || !userId) return;

    try {
      await sendMessage(activeConversation.id, userId, message, type);
    } catch (error) {
      throw error;
    }
  };

  const markConversationAsRead = async (conversationId) => {
    if (!userId) return;
    
    try {
      await markMessagesAsRead(conversationId, userId);
    } catch (error) {
      // Silent fail
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
