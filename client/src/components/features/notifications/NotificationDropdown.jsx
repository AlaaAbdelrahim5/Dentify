import { useState, useEffect } from 'react';
import { useNotifications } from '../../../contexts/NotificationContext';
import { FiBell, FiX, FiCheck } from 'react-icons/fi';
import { formatDistanceToNow } from '../../../utils/dateUtils';
import { useTheme } from '../../../contexts/ThemeContext';

const NotificationDropdown = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const { isDarkMode } = useTheme();

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    // Handle navigation based on notification type
    if (notification.link) {
      window.location.href = notification.link;
    }
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2.5 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 group ${
          isDarkMode 
            ? 'hover:bg-gradient-to-br from-teal-500/20 to-cyan-500/20 hover:shadow-lg hover:shadow-teal-500/20' 
            : 'hover:bg-gradient-to-br from-teal-50 to-cyan-50 hover:shadow-md'
        }`}
        title="Notifications"
      >
        <div className={`relative transition-all duration-200 ${
          isDarkMode
            ? 'text-gray-400 group-hover:text-teal-400'
            : 'text-gray-600 group-hover:text-teal-600'
        }`}>
          <FiBell className="w-6 h-6" strokeWidth={2.5} />
          {unreadCount > 0 && (
            <>
              {/* Animated ping effect */}
              <span className="absolute -top-1 -right-1 flex h-5 w-5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gradient-to-r from-red-500 to-pink-500 opacity-75"></span>
                <span className="relative inline-flex items-center justify-center rounded-full h-5 w-5 bg-gradient-to-r from-red-500 to-pink-600 text-white text-[10px] font-bold shadow-lg ring-2 ring-white dark:ring-gray-800">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              </span>
            </>
          )}
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className={`absolute right-0 z-20 mt-3 w-96 rounded-2xl shadow-2xl border backdrop-blur-xl overflow-hidden animate-in fade-in slide-in-from-top-2 ${
            isDarkMode
              ? 'bg-gray-800/95 border-gray-700/50 shadow-gray-900/50'
              : 'bg-white/95 border-gray-200/50 shadow-gray-200/50'
          }`}>
            {/* Header */}
            <div className={`flex items-center justify-between p-4 border-b backdrop-blur-sm ${
              isDarkMode
                ? 'border-gray-700/50 bg-gradient-to-r from-gray-900/50 to-gray-800/50'
                : 'border-gray-200/50 bg-gradient-to-r from-gray-50 to-white'
            }`}>
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${
                  isDarkMode ? 'bg-teal-500/20' : 'bg-teal-100'
                }`}>
                  <FiBell className={`w-5 h-5 ${
                    isDarkMode ? 'text-teal-400' : 'text-teal-600'
                  }`} />
                </div>
                <h3 className={`text-lg font-bold ${
                  isDarkMode ? 'text-gray-100' : 'text-gray-900'
                }`}>
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                    isDarkMode
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className={`p-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-1.5 ${
                      isDarkMode
                        ? 'text-teal-400 hover:bg-teal-500/20'
                        : 'text-teal-600 hover:bg-teal-50'
                    }`}
                    title="Mark all as read"
                  >
                    <FiCheck className="w-4 h-4" strokeWidth={2.5} />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 ${
                    isDarkMode
                      ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/70'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <FiX className="w-5 h-5" strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto max-h-96 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
              {notifications.length === 0 ? (
                <div className={`p-12 text-center ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
                    isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100'
                  }`}>
                    <FiBell className="w-10 h-10 opacity-50" />
                  </div>
                  <p className="text-base font-semibold">No notifications yet</p>
                  <p className="text-sm mt-1 opacity-75">We'll notify you when something arrives</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 border-b transition-all duration-200 hover:scale-[1.02] cursor-pointer ${
                      isDarkMode
                        ? 'border-gray-700/50 hover:bg-gray-700/50'
                        : 'border-gray-200/50 hover:bg-gray-50'
                    } ${
                      !notification.read
                        ? isDarkMode
                          ? 'bg-teal-500/10 border-l-4 border-l-teal-500'
                          : 'bg-teal-50 border-l-4 border-l-teal-500'
                        : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {!notification.read && (
                        <div className="w-2.5 h-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full mt-1.5 flex-shrink-0 shadow-lg shadow-teal-500/50 animate-pulse" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold ${
                          isDarkMode ? 'text-gray-100' : 'text-gray-900'
                        }`}>
                          {notification.title}
                        </p>
                        <p className={`text-sm mt-1 line-clamp-2 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {notification.body}
                        </p>
                        <p className={`text-xs mt-2 font-medium ${
                          isDarkMode ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                          {notification.createdAt && formatDistanceToNow(notification.createdAt.toDate())}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className={`p-3 border-t backdrop-blur-sm ${
                isDarkMode
                  ? 'border-gray-700/50 bg-gray-900/50'
                  : 'border-gray-200/50 bg-gray-50'
              }`}>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    window.location.href = '/notifications';
                  }}
                  className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-[1.02] active:scale-95 ${
                    isDarkMode
                      ? 'bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-teal-400 hover:from-teal-500/30 hover:to-cyan-500/30'
                      : 'bg-gradient-to-r from-teal-50 to-cyan-50 text-teal-600 hover:from-teal-100 hover:to-cyan-100'
                  }`}
                >
                  View all notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationDropdown;
