import { db } from '../../config/firebase';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  doc,
  getDocs,
  setDoc,
  getDoc,
  limit,
  startAfter,
  or,
  and
} from 'firebase/firestore';

// Create or get a chat conversation
export const createOrGetConversation = async (userId1, userId2) => {
  try {
    // Check if conversation already exists
    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('participants', 'array-contains', userId1)
    );

    const snapshot = await getDocs(q);
    const existingConversation = snapshot.docs.find(doc => {
      const participants = doc.data().participants;
      return participants.includes(userId2);
    });

    if (existingConversation) {
      return { id: existingConversation.id, ...existingConversation.data() };
    }

    // Create new conversation
    const conversationData = {
      participants: [userId1, userId2],
      createdAt: serverTimestamp(),
      lastMessage: null,
      lastMessageAt: null,
      unreadCount: {
        [userId1]: 0,
        [userId2]: 0
      }
    };

    const docRef = await addDoc(conversationsRef, conversationData);
    return { id: docRef.id, ...conversationData };
  } catch (error) {
    console.error('Error creating/getting conversation:', error);
    throw error;
  }
};

// Get all conversations for a user
export const getUserConversations = (userId, callback) => {
  const conversationsRef = collection(db, 'conversations');
  const q = query(
    conversationsRef,
    where('participants', 'array-contains', userId)
  );

  return onSnapshot(q, (snapshot) => {
    const conversations = snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .sort((a, b) => {
        // Sort by lastMessageAt, putting null values at the end
        if (!a.lastMessageAt && !b.lastMessageAt) return 0;
        if (!a.lastMessageAt) return 1;
        if (!b.lastMessageAt) return -1;
        return b.lastMessageAt.toMillis() - a.lastMessageAt.toMillis();
      });
    callback(conversations);
  });
};

// Send a message
export const sendMessage = async (conversationId, senderId, message, type = 'text') => {
  try {
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const messageData = {
      senderId,
      message,
      type, // 'text', 'image', 'file'
      createdAt: serverTimestamp(),
      read: false
    };

    const docRef = await addDoc(messagesRef, messageData);

    // Update conversation's last message
    const conversationRef = doc(db, 'conversations', conversationId);
    const conversationDoc = await getDoc(conversationRef);
    const conversationData = conversationDoc.data();
    
    // Increment unread count for the other participant
    const otherParticipant = conversationData.participants.find(p => p !== senderId);
    const unreadCount = { ...conversationData.unreadCount };
    unreadCount[otherParticipant] = (unreadCount[otherParticipant] || 0) + 1;

    await updateDoc(conversationRef, {
      lastMessage: message,
      lastMessageAt: serverTimestamp(),
      unreadCount
    });

    return docRef.id;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Listen to messages in a conversation
export const listenToMessages = (conversationId, callback, limitCount = 50) => {
  const messagesRef = collection(db, 'conversations', conversationId, 'messages');
  const q = query(
    messagesRef,
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).reverse(); // Reverse to show oldest first
    callback(messages);
  });
};

// Mark messages as read
export const markMessagesAsRead = async (conversationId, userId) => {
  try {
    const conversationRef = doc(db, 'conversations', conversationId);
    const conversationDoc = await getDoc(conversationRef);
    const conversationData = conversationDoc.data();
    
    const unreadCount = { ...conversationData.unreadCount };
    unreadCount[userId] = 0;

    await updateDoc(conversationRef, {
      unreadCount
    });

    // Mark all messages as read
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(
      messagesRef,
      where('senderId', '!=', userId),
      where('read', '==', false)
    );

    const snapshot = await getDocs(q);
    const updatePromises = snapshot.docs.map(document =>
      updateDoc(doc(db, 'conversations', conversationId, 'messages', document.id), {
        read: true
      })
    );

    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};

// Delete a message
export const deleteMessage = async (conversationId, messageId) => {
  try {
    const messageRef = doc(db, 'conversations', conversationId, 'messages', messageId);
    await updateDoc(messageRef, {
      deleted: true,
      deletedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

// Search conversations
export const searchConversations = async (userId, searchTerm) => {
  try {
    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('participants', 'array-contains', userId)
    );

    const snapshot = await getDocs(q);
    const conversations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Filter by search term on client side
    return conversations.filter(conv =>
      conv.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  } catch (error) {
    console.error('Error searching conversations:', error);
    throw error;
  }
};
