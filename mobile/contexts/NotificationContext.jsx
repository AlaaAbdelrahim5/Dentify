import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '../services/firebase/notificationService';
import { jwtDecode } from 'jwt-decode';
import { authUtils } from '../utils/auth';
import { storage } from '../utils/storage';

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
  const [currentUserId, setCurrentUserId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Listen for user changes (login/logout/switch)
  useEffect(() => {
    const checkUserChange = async () => {
      const timestamp = await storage.getItem('dentify_user_changed');
      if (timestamp) {
        setRefreshKey(Number(timestamp));
      }
    };

    // Check immediately
    checkUserChange();

    // Set up polling to detect changes
    const interval = setInterval(checkUserChange, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let unsubscribe = null;
    
    const initializeNotifications = async () => {
      try {
        // Get user from token
        const token = await authUtils.getAccessToken();
        
        // If no token, reset everything
        if (!token) {
          setNotifications([]);
          setUnreadCount(0);
          setCurrentUserId(null);
          return;
        }

        const decoded = jwtDecode(token);
        const userId = decoded.userId || decoded.id;
        const userIdStr = String(userId);

        // If user changed, reset notifications first
        if (currentUserId && currentUserId !== userIdStr) {
          // Cleanup previous subscription
          if (unsubscribe) {
            unsubscribe();
            unsubscribe = null;
          }
          setNotifications([]);
          setUnreadCount(0);
        }
        
        setCurrentUserId(userIdStr);

        // Listen for notifications - convert userId to string
        try {
          unsubscribe = getUserNotifications(userIdStr, (notifs) => {
            setNotifications(notifs);
            const unread = notifs.filter(n => !n.read).length;
            setUnreadCount(unread);
          });
        } catch (firebaseError) {
          console.log('Firebase notifications not available, continuing without notifications');
          setNotifications([]);
          setUnreadCount(0);
        }
      } catch (error) {
        console.log('Notification initialization error, continuing without notifications');
        setNotifications([]);
        setUnreadCount(0);
      }
    };

    initializeNotifications();

    // Cleanup on unmount or when effect reruns
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [refreshKey]);

  const markAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
    } catch (error) {
      // Silent fail
    }
  };

  const markAllAsRead = async () => {
    if (!currentUserId) return;
    
    try {
      await markAllNotificationsAsRead(currentUserId);
    } catch (error) {
      // Silent fail
    }
  };

  const refresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        refresh
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
