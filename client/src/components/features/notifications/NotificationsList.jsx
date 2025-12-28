import { useNotifications } from '../../../contexts/NotificationContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { FiBell, FiCheck, FiTrash2 } from 'react-icons/fi';
import { formatDistanceToNow } from '../../../utils/dateUtils';

const NotificationsList = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { isDarkMode } = useTheme();

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.link) {
      window.location.href = notification.link;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          {unreadCount > 0 && (
            <p className={`text-sm font-medium ${
              isDarkMode ? 'text-blue-400' : 'text-blue-600'
            }`}>
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all shadow-sm hover:shadow-md"
          >
            <FiCheck className="w-4 h-4" />
            <span className="font-medium">Mark all as read</span>
          </button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className={`rounded-2xl shadow-lg border p-16 text-center ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
            <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
              isDarkMode ? 'bg-gradient-to-br from-blue-900/30 to-blue-800/20' : 'bg-gradient-to-br from-blue-100 to-blue-50'
            }`}>
              <FiBell className={`w-10 h-10 ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`} />
            </div>
            <h3 className={`text-xl font-bold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              No notifications yet
            </h3>
            <p className={`max-w-sm mx-auto ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              When you get notifications, they'll show up here
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`group relative rounded-xl border transition-all cursor-pointer overflow-hidden ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              } ${
                !notification.read 
                  ? `border-blue-500 shadow-md hover:shadow-xl` 
                  : `${isDarkMode ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'} shadow-sm hover:shadow-lg`
              }`}
            >
              {!notification.read && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-600 to-blue-400" />
              )}
              <div className="p-5">
                <div className="flex items-start gap-4">
                  {/* Sender Avatar */}
                  {notification.data?.senderImage ? (
                    <img
                      src={notification.data.senderImage.startsWith('http') || notification.data.senderImage.startsWith('data:') 
                        ? notification.data.senderImage 
                        : `${import.meta.env.VITE_API_URL}${notification.data.senderImage}`
                      }
                      alt={notification.data?.senderName || 'User'}
                      className="w-10 h-10 rounded-full object-cover shadow-md shrink-0"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-md ${
                      isDarkMode ? 'bg-gradient-to-br from-teal-600 to-cyan-600' : 'bg-gradient-to-br from-teal-500 to-cyan-500'
                    }`}>
                      <span className="text-white text-sm font-bold">
                        {notification.data?.senderName?.[0]?.toUpperCase() || notification.title?.[0]?.toUpperCase() || 'N'}
                      </span>
                    </div>
                  )}
                  {!notification.read && (
                    <div className="w-2.5 h-2.5 bg-blue-600 rounded-full mt-1.5 shrink-0 animate-pulse" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className={`text-base font-bold ${
                        !notification.read 
                          ? (isDarkMode ? 'text-white' : 'text-gray-900') 
                          : (isDarkMode ? 'text-gray-300' : 'text-gray-700')
                      }`}>
                        {notification.title}
                      </h3>
                      <span className={`text-xs font-medium whitespace-nowrap px-2 py-1 rounded-full ${
                        isDarkMode ? 'text-gray-400 bg-gray-700' : 'text-gray-500 bg-gray-100'
                      }`}>
                        {notification.createdAt && formatDistanceToNow(notification.createdAt.toDate())}
                      </span>
                    </div>
                    <p className={`text-sm leading-relaxed ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {notification.body}
                    </p>
                    {notification.data && notification.data.type && (
                      <div className="mt-3">
                        <span className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg ${
                          isDarkMode 
                            ? 'bg-gradient-to-r from-blue-900/30 to-blue-800/20 text-blue-400' 
                            : 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700'
                        }`}>
                          {notification.data.type}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsList;
