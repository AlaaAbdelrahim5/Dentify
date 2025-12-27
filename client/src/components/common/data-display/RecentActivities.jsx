import { useTheme } from '../../../contexts/ThemeContext'
import Card from '../layout/Card'

/**
 * RecentActivities Component
 * Consistent recent activities section for dashboard overview pages
 * 
 * @param {Array} activities - Array of activity objects with { message, time, color }
 * @param {string} title - Section title (default: "Recent Activities")
 */
const RecentActivities = ({ activities = [], title = "Recent Activities" }) => {
  const { isDarkMode } = useTheme()

  if (!activities || activities.length === 0) {
    return null
  }

  return (
    <Card className="p-6">
      <h3 className={`text-lg font-semibold mb-4 ${
        isDarkMode ? 'text-gray-100' : 'text-gray-800'
      }`}>
        {title}
      </h3>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div 
            key={index}
            className={`flex items-center gap-4 p-3 rounded-lg ${
              isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${
              activity.color === 'green' ? 'bg-green-500' :
              activity.color === 'yellow' ? 'bg-yellow-500' :
              activity.color === 'blue' ? 'bg-blue-500' :
              activity.color === 'red' ? 'bg-red-500' :
              'bg-gray-500'
            }`}></div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${
                isDarkMode ? 'text-gray-200' : 'text-gray-800'
              }`}>
                {activity.message}
              </p>
              <p className={`text-xs ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {activity.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default RecentActivities
