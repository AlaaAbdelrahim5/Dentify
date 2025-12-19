import React, { createContext, useContext, useEffect, useState } from 'react';
import {
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
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
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
        
        console.log('NotificationContext - User ID:', userId, 'Type:', typeof userId);

        // If user changed, reset notifications
        if (currentUserId && currentUserId !== userIdStr) {
          console.log('NotificationContext - User changed, resetting notifications');
          setNotifications([]);
          setUnreadCount(0);
        }
        
        setCurrentUserId(userIdStr);

        // Listen for notifications - convert userId to string
        console.log('NotificationContext - Listening for notifications with userId:', userIdStr);
        
        const unsubscribe = getUserNotifications(userIdStr, (notifs) => {
          console.log('NotificationContext - Received notifications:', notifs);
          setNotifications(notifs);
          const unread = notifs.filter(n => !n.read).length;
          setUnreadCount(unread);
          console.log('NotificationContext - Unread count:', unread);
        });

        return () => {
          console.log('NotificationContext - Cleaning up listener');
          unsubscribe && unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing notifications:', error);
        setNotifications([]);
        setUnreadCount(0);
      }
    };

    initializeNotifications();
  }, [currentUserId]);

  const markAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!currentUserId) return;
    
    try {
      await markAllNotificationsAsRead(currentUserId);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
