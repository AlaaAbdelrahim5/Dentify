import { useTheme } from '../../../contexts/ThemeContext'
import { FaInbox } from 'react-icons/fa'
import Button from '../forms/Button'

/**
 * EmptyState Component
 * Displays a consistent empty state message across the application
 * Reusable for any "no data" scenario
 * 
 * @param {ReactComponent} icon - Icon to display (default: FaInbox)
 * @param {string} title - Main title text
 * @param {string} message - Description message
 * @param {ReactNode} action - Optional action button or component
 * @param {string} className - Additional CSS classes
 */
const EmptyState = ({ 
  icon: Icon = FaInbox, 
  title = 'No Data Found', 
  message = 'There are no items to display at this time.',
  action,
  className = ''
}) => {
  const { isDarkMode } = useTheme()

  return (
    <div className={`text-center py-12 ${className}`}>
      <Icon className={`w-16 h-16 mx-auto mb-4 ${
        isDarkMode ? 'text-gray-500' : 'text-gray-400'
      }`} />
      <h3 className={`text-lg font-semibold mb-2 ${
        isDarkMode ? 'text-gray-300' : 'text-gray-600'
      }`}>
        {title}
      </h3>
      <p className={`mb-6 ${
        isDarkMode ? 'text-gray-400' : 'text-gray-500'
      }`}>
        {message}
      </p>
      {action && action}
    </div>
  )
}

export default EmptyState
