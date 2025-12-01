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

  useEffect(() => {
    // Get user from token
    const token = authUtils.getAccessToken();
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      const userId = decoded.userId || decoded.id;

      // Request notification permission
      requestNotificationPermission().then(token => {
        if (token) {
          setFcmToken(token);
          // Save FCM token to backend
          saveFcmTokenToBackend(token);
        }
      });

      // Listen for notifications
      const unsubscribe = getUserNotifications(userId, (notifs) => {
        setNotifications(notifs);
        const unread = notifs.filter(n => !n.read).length;
        setUnreadCount(unread);
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

      return () => unsubscribe && unsubscribe();
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  }, []);

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

      await markAllNotificationsAsRead(userId);
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
