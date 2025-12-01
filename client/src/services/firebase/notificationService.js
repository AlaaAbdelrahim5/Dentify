import { messaging } from '../../config/firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { db } from '../../config/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp,
  getDocs,
  limit
} from 'firebase/firestore';

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

// Request notification permission and get FCM token
export const requestNotificationPermission = async () => {
  try {
    if (!messaging) {
      console.log('Messaging not supported');
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, { vapidKey: VAPID_KEY });
      console.log('FCM Token:', token);
      return token;
    } else {
      console.log('Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
};

// Listen for foreground messages
export const onMessageListener = () => {
  return new Promise((resolve) => {
    if (!messaging) {
      console.log('Messaging not supported');
      return;
    }
    
    onMessage(messaging, (payload) => {
      console.log('Message received:', payload);
      resolve(payload);
    });
  });
};

// Add notification to Firestore
export const createNotification = async (notificationData) => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const docRef = await addDoc(notificationsRef, {
      ...notificationData,
      read: false,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Get notifications for a user
export const getUserNotifications = (userId, callback) => {
  console.log('getUserNotifications called with userId:', userId, 'Type:', typeof userId);
  
  const notificationsRef = collection(db, 'notifications');
  const q = query(
    notificationsRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  console.log('Setting up Firestore listener for notifications...');

  return onSnapshot(q, (snapshot) => {
    console.log('Firestore snapshot received, docs count:', snapshot.docs.length);
    const notifications = snapshot.docs.map(doc => {
      const data = doc.data();
      console.log('Notification doc:', doc.id, data);
      return {
        id: doc.id,
        ...data
      };
    });
    console.log('Processed notifications:', notifications);
    callback(notifications);
  }, (error) => {
    console.error('Firestore listener error:', error);
  });
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId) => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      read: true,
      readAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read for a user
export const markAllNotificationsAsRead = async (userId) => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('read', '==', false)
    );
    
    const snapshot = await getDocs(q);
    const updatePromises = snapshot.docs.map(document => 
      updateDoc(doc(db, 'notifications', document.id), {
        read: true,
        readAt: serverTimestamp()
      })
    );
    
    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Send notification (call this from your backend)
export const sendNotification = async (notificationData) => {
  try {
    // This should be called from your backend with Firebase Admin SDK
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(notificationData)
    });
    return await response.json();
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};
