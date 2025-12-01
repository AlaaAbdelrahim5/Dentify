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
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Notifications
          </h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiCheck className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>

      <div className="space-y-2">
        {notifications.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <FiBell className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No notifications yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              When you get notifications, they'll show up here
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer ${
                !notification.read ? 'border-l-4 border-blue-600' : ''
              }`}
            >
              <div className="p-4">
                <div className="flex items-start gap-4">
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                          {notification.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {notification.body}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-500 whitespace-nowrap">
                        {notification.createdAt && formatDistanceToNow(notification.createdAt.toDate())}
                      </span>
                    </div>
                    {notification.data && (
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                        {notification.data.type && (
                          <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                            {notification.data.type}
                          </span>
                        )}
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
