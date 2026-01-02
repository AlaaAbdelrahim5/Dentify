import { 
  FaFileImage,
  FaCheckCircle,
  FaChartBar,
  FaXRay,
  FaHospital
} from 'react-icons/fa'
import { MdPendingActions } from 'react-icons/md'
import { Card, StatsOverview, WelcomeCard } from '../../../components'
import { useTheme } from '../../../contexts/ThemeContext'

const RadiologyOverview = ({ currentUser, userData, stats, onTabChange }) => {
  const { isDarkMode } = useTheme()

  // Ensure stats has default values
  const safeStats = {
    totalRequests: stats?.totalRequests || 0,
    pendingRequests: stats?.pendingRequests || 0,
    completedToday: stats?.completedToday || 0,
    completedThisMonth: stats?.completedThisMonth || 0
  }

  const statsData = [
    {
      label: 'Total Requests',
      value: safeStats.totalRequests,
      icon: FaFileImage,
      gradient: 'from-blue-600 to-cyan-600'
    },
    {
      label: 'Pending Requests',
      value: safeStats.pendingRequests,
      icon: MdPendingActions,
      gradient: 'from-yellow-600 to-orange-600'
    },
    {
      label: 'Completed Today',
      value: safeStats.completedToday,
      icon: FaCheckCircle,
      gradient: 'from-green-600 to-teal-600'
    },
    {
      label: 'This Month',
      value: safeStats.completedThisMonth,
      icon: FaChartBar,
      gradient: 'from-purple-600 to-pink-600'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <WelcomeCard
        title={userData?.centerName || 'Radiology Center'}
        subtitle={`${userData?.city || 'City'} • Registration: ${userData?.registrationNumber || 'N/A'}`}
        icon={FaXRay}
        iconGradient="from-green-600 to-teal-600"
      />

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
    </div>
  )
}

export default RadiologyOverview
