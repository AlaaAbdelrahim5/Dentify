import NotificationsList from '../components/features/notifications/NotificationsList';
import Navbar from '../components/layout/Navbar';

const NotificationsPage = () => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
        <NotificationsList />
      </div>
    </>
  );
};

export default NotificationsPage;
