import { 
  FaFileImage,
  FaCheckCircle,
  FaChartBar,
  FaCog,
  FaHospital,
  FaClock
} from 'react-icons/fa'
import { MdPendingActions } from 'react-icons/md'
import { Card, Button, StatsOverview } from '../../../components'
import { useTheme } from '../../../contexts/ThemeContext'

const RadiologyOverview = ({ currentUser, userData, stats, onTabChange }) => {
  const { isDarkMode } = useTheme()

  const statsData = [
    {
      label: 'Total Requests',
      value: stats.totalRequests || 0,
      icon: FaFileImage,
      gradient: 'from-blue-600 to-cyan-600'
    },
    {
      label: 'Pending Requests',
      value: stats.pendingRequests || 0,
      icon: MdPendingActions,
      gradient: 'from-yellow-600 to-orange-600'
    },
    {
      label: 'Completed Today',
      value: stats.completedToday || 0,
      icon: FaCheckCircle,
      gradient: 'from-green-600 to-teal-600'
    },
    {
      label: 'This Month',
      value: stats.completedThisMonth || 0,
      icon: FaChartBar,
      gradient: 'from-purple-600 to-pink-600'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <StatsOverview stats={statsData} />

      {/* Center Information */}
      {userData && (
        <Card className="p-6">
          <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <FaHospital className="text-blue-600 dark:text-blue-400" />
            Center Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Center Name
              </p>
              <p className={`font-semibold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{userData.centerName}</p>
            </div>
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Registration Number
              </p>
              <p className={`font-semibold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{userData.registrationNumber}</p>
            </div>
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                City
              </p>
              <p className={`font-semibold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{userData.city}</p>
            </div>
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Email
              </p>
              <p className={`font-semibold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{currentUser?.email}</p>
            </div>
            {userData.website && (
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Website
                </p>
                <a 
                  href={userData.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-semibold mt-1 text-blue-600 hover:underline"
                >
                  {userData.website}
                </a>
              </div>
            )}
            {userData.supportedTypes && userData.supportedTypes.length > 0 && (
              <div className="md:col-span-2">
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Supported Imaging Types
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {userData.supportedTypes.map((type, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={() => onTabChange?.('requests')}
            className="flex items-center justify-center gap-2"
          >
            <FaFileImage />
            View All Requests
          </Button>
          <Button
            onClick={() => onTabChange?.('requests')}
            variant="secondary"
            className="flex items-center justify-center gap-2"
          >
            <FaClock />
            Pending Requests
          </Button>
          <Button
            onClick={() => onTabChange?.('settings')}
            variant="secondary"
            className="flex items-center justify-center gap-2"
          >
            <FaCog />
            Center Settings
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default RadiologyOverview
