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

  // Register service worker on mount
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/firebase-messaging-sw.js')
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

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

      // If user changed, reset notifications
      if (currentUserId && currentUserId !== userIdStr) {
        setNotifications([]);
        setUnreadCount(0);
      }
      
      setCurrentUserId(userIdStr);

      // Request notification permission and get FCM token
      requestNotificationPermission().then(token => {
        if (token) {
          console.log('FCM Token obtained:', token);
          setFcmToken(token);
          // Save FCM token to backend
          saveFcmTokenToBackend(token);
        } else {
          console.warn('Failed to get FCM token. Permission:', Notification.permission);
        }
      });

      // Listen for notifications from Firestore
      const unsubscribe = getUserNotifications(userIdStr, (notifs) => {
        setNotifications(notifs);
        const unread = notifs.filter(n => !n.read).length;
        setUnreadCount(unread);
      });

      return () => {
        unsubscribe && unsubscribe();
      };
    } catch (error) {
      console.error('Error initializing notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [currentUserId]);

  // Separate effect for foreground message listener
  useEffect(() => {
    const setupForegroundListener = async () => {
      try {
        const payload = await onMessageListener();
        console.log('Foreground message received:', payload);
        
        // Show browser notification
        if (Notification.permission === 'granted' && payload?.notification) {
          new Notification(payload.notification.title, {
            body: payload.notification.body,
            icon: '/logo.png',
            badge: '/badge.png'
          });
        }
        
        // Re-setup the listener (since it only fires once)
        setupForegroundListener();
      } catch (err) {
        console.error('Foreground message listener error:', err);
      }
    };

    setupForegroundListener();
  }, []);

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
      const accessToken = authUtils.getAccessToken();
      if (!accessToken) {
        console.warn('No access token available, skipping FCM token save');
        return;
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/fcm-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ fcmToken: token })
      });

      if (response.ok) {
        console.log('FCM token saved to backend successfully');
      } else {
        const error = await response.json();
        console.error('Failed to save FCM token:', error);
      }
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
