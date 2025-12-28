import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { Navbar, NotificationsList, PageHeader, Button } from '../components';
import { useTheme } from '../contexts/ThemeContext';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  return (
    <>
      <Navbar showDashboardInfo={true} dashboardTitle="Notifications" />
      <div className={`min-h-screen pt-16 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
          : 'bg-gradient-to-br from-gray-50 to-gray-100'
      }`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header with Back Button */}
          <PageHeader
            title="Notifications"
            actions={
              <Button
                variant="secondary"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2"
              >
                <FaArrowLeft className="w-4 h-4" />
                <span className="font-medium">Back</span>
              </Button>
            }
          />
          
          <div className="mt-8">
            <NotificationsList />
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationsPage;
