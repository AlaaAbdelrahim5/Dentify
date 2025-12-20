import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { Navbar, NotificationsList } from '../components';
import { useTheme } from '../contexts/ThemeContext';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  return (
    <>
      <Navbar showDashboardInfo={true} dashboardTitle="Notifications" />
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header with Back Button */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md ${
                  isDarkMode
                    ? 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700'
                    : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
                }`}
              >
                <FaArrowLeft className="w-4 h-4" />
                <span className="font-medium">Back</span>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Notifications
                </h1>
              </div>
            </div>
          </div>
          
          <NotificationsList />
        </div>
      </div>
    </>
  );
};

export default NotificationsPage;
