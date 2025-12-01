import { createContext, useContext, useEffect, useState } from 'react';
import {
  requestNotificationPermission,
  onMessageListener,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '../services/firebase/notificationService';
import { jwtDecode } from 'jwt-decode';
import { authUtils } from '../utils/auth';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [fcmToken, setFcmToken] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    // Get user from token
    const token = authUtils.getAccessToken();
    
    // If no token, reset everything
    if (!token) {
      setNotifications([]);
      setUnreadCount(0);
      setFcmToken(null);
      setCurrentUserId(null);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const userId = decoded.userId || decoded.id;
      const userIdStr = String(userId);
      
      console.log('NotificationContext - User ID:', userId, 'Type:', typeof userId);

      // If user changed, reset notifications
      if (currentUserId && currentUserId !== userIdStr) {
        console.log('NotificationContext - User changed, resetting notifications');
        setNotifications([]);
        setUnreadCount(0);
      }
      
      setCurrentUserId(userIdStr);

      // Request notification permission
      requestNotificationPermission().then(token => {
        if (token) {
          setFcmToken(token);
          // Save FCM token to backend
          saveFcmTokenToBackend(token);
        }
      });

      // Listen for notifications - convert userId to string
      console.log('NotificationContext - Listening for notifications with userId:', userIdStr);
      
      const unsubscribe = getUserNotifications(userIdStr, (notifs) => {
        console.log('NotificationContext - Received notifications:', notifs);
        setNotifications(notifs);
        const unread = notifs.filter(n => !n.read).length;
        setUnreadCount(unread);
        console.log('NotificationContext - Unread count:', unread);
      });

      // Listen for foreground messages
      onMessageListener()
        .then((payload) => {
          console.log('Received foreground message:', payload);
          // Show browser notification
          if (Notification.permission === 'granted') {
            new Notification(payload.notification.title, {
              body: payload.notification.body,
              icon: '/logo.png'
            });
          }
        })
        .catch((err) => console.log('Failed to receive message:', err));

      return () => {
        console.log('NotificationContext - Cleaning up listener');
        unsubscribe && unsubscribe();
      };
    } catch (error) {
      console.error('Error initializing notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [currentUserId]);

  // Separate effect to watch for storage changes (login/logout events)
  useEffect(() => {
    const handleStorageChange = () => {
      const token = authUtils.getAccessToken();
      if (!token) {
        setCurrentUserId(null);
        setNotifications([]);
        setUnreadCount(0);
        setFcmToken(null);
      } else {
        try {
          const decoded = jwtDecode(token);
          const userId = decoded.userId || decoded.id;
          const userIdStr = String(userId);
          
          // Trigger re-fetch by updating currentUserId
          if (currentUserId !== userIdStr) {
            setCurrentUserId(userIdStr);
          }
        } catch (error) {
          console.error('Error decoding token on storage change:', error);
        }
      }
    };

    // Listen for storage events (changes in other tabs)
    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically in case of same-tab changes
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [currentUserId]);

  const saveFcmTokenToBackend = async (token) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/users/fcm-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ fcmToken: token })
      });
    } catch (error) {
      console.error('Error saving FCM token:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = authUtils.getAccessToken();
      if (!token) return;

      const decoded = jwtDecode(token);
      const userId = decoded.userId || decoded.id;
      const userIdStr = String(userId);

      await markAllNotificationsAsRead(userIdStr);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const value = {
    notifications,
    unreadCount,
    fcmToken,
    markAsRead,
    markAllAsRead
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
