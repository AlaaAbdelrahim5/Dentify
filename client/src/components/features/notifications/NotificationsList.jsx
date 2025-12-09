import { useNotifications } from '../../../contexts/NotificationContext';
import { FiBell, FiCheck, FiTrash2 } from 'react-icons/fi';
import { formatDistanceToNow } from '../../../utils/dateUtils';

const NotificationsList = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

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
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
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
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-16 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 rounded-full flex items-center justify-center">
              <FiBell className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No notifications yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
              When you get notifications, they'll show up here
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`group relative bg-white dark:bg-gray-800 rounded-xl border transition-all cursor-pointer overflow-hidden ${
                !notification.read 
                  ? 'border-blue-500 dark:border-blue-500 shadow-md hover:shadow-xl' 
                  : 'border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {!notification.read && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-600 to-blue-400" />
              )}
              <div className="p-5">
                <div className="flex items-start gap-4">
                  {!notification.read && (
                    <div className="w-2.5 h-2.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0 animate-pulse" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className={`text-base font-bold ${
                        !notification.read 
                          ? 'text-gray-900 dark:text-white' 
                          : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {notification.title}
                      </h3>
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                        {notification.createdAt && formatDistanceToNow(notification.createdAt.toDate())}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {notification.body}
                    </p>
                    {notification.data && notification.data.type && (
                      <div className="mt-3">
                        <span className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-lg">
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
