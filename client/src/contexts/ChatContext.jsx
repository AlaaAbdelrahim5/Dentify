import { createContext, useContext, useEffect, useState } from 'react';
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

  useEffect(() => {
    // Get user from token
    const token = authUtils.getAccessToken();
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      console.log('Decoded JWT token:', decoded); // Debug log
      const currentUserId = decoded.userId || decoded.id;
      console.log('Extracted userId:', currentUserId); // Debug log
      setUserId(currentUserId);

      // Listen for conversations
      const unsubscribe = getUserConversations(currentUserId, (convs) => {
        setConversations(convs);
        
        // Calculate total unread count
        const total = convs.reduce((sum, conv) => {
          return sum + (conv.unreadCount?.[currentUserId] || 0);
        }, 0);
        setTotalUnreadCount(total);
      });

      return () => unsubscribe && unsubscribe();
    } catch (error) {
      console.error('Error initializing chat:', error);
    }
  }, []);

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
      await markMessagesAsRead(conversationId || activeConversation?.id, userId);
    } catch (error) {
      console.error('Error marking conversation as read:', error);
    }
  };

  const value = {
    conversations,
    activeConversation,
    messages,
    totalUnreadCount,
    userId,
    setActiveConversation,
    startConversation,
    sendChatMessage,
    markConversationAsRead
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
