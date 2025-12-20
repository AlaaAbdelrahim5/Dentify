import { useTheme } from '../../contexts/ThemeContext'
import { FaExclamationTriangle } from 'react-icons/fa'
import { Button } from './'

/**
 * ErrorState Component
 * Displays a consistent error state message across the application
 * Reusable for any error scenario
 * 
 * @param {ReactComponent} icon - Icon to display (default: FaExclamationTriangle)
 * @param {string} title - Main title text
 * @param {string} message - Error message description
 * @param {Function} onRetry - Optional retry action handler
 * @param {string} retryText - Text for retry button
 * @param {string} className - Additional CSS classes
 */
const ErrorState = ({ 
  icon: Icon = FaExclamationTriangle, 
  title = 'Something Went Wrong', 
  message = 'An error occurred while loading data. Please try again.',
  onRetry,
  retryText = 'Try Again',
  className = ''
}) => {
  const { isDarkMode } = useTheme()

  return (
    <div className={`text-center py-12 ${className}`}>
      <Icon className="w-16 h-16 mx-auto mb-4 text-red-500" />
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
      {onRetry && (
        <Button onClick={onRetry} variant="primary">
          {retryText}
        </Button>
      )}
    </div>
  )
}

export default ErrorState
