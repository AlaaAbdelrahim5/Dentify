import { FaCheck, FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa'
import { useTheme } from '../../../contexts/ThemeContext'

/**
 * Alert Component - Displays inline alert messages with different variants
 * @param {string} variant - 'success', 'error', 'warning', or 'info'
 * @param {string} title - Bold title text for the alert
 * @param {string|React.ReactNode} message - Message content (can be string or JSX)
 * @param {function} onClose - Optional close handler
 * @param {string} className - Additional CSS classes
 */
const Alert = ({ 
  variant = 'info', 
  title, 
  message, 
  onClose,
  className = '' 
}) => {
  const { isDarkMode } = useTheme()
  
  const variants = {
    success: {
      bg: isDarkMode ? 'bg-green-900/20' : 'bg-green-50',
      border: isDarkMode ? 'border-green-800' : 'border-green-200',
      icon: <FaCheck className={isDarkMode ? 'text-green-400' : 'text-green-600'} />,
      titleColor: isDarkMode ? 'text-green-300' : 'text-green-800',
      messageColor: isDarkMode ? 'text-green-400' : 'text-green-600'
    },
    error: {
      bg: isDarkMode ? 'bg-red-900/20' : 'bg-red-50',
      border: isDarkMode ? 'border-red-800' : 'border-red-200',
      icon: <FaExclamationTriangle className={isDarkMode ? 'text-red-400' : 'text-red-600'} />,
      titleColor: isDarkMode ? 'text-red-300' : 'text-red-800',
      messageColor: isDarkMode ? 'text-red-400' : 'text-red-600'
    },
    warning: {
      bg: isDarkMode ? 'bg-yellow-900/20' : 'bg-yellow-50',
      border: isDarkMode ? 'border-yellow-800' : 'border-yellow-200',
      icon: <FaExclamationTriangle className={isDarkMode ? 'text-yellow-400' : 'text-yellow-600'} />,
      titleColor: isDarkMode ? 'text-yellow-300' : 'text-yellow-800',
      messageColor: isDarkMode ? 'text-yellow-400' : 'text-yellow-700'
    },
    info: {
      bg: isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50',
      border: isDarkMode ? 'border-blue-800' : 'border-blue-200',
      icon: <FaInfoCircle className={isDarkMode ? 'text-blue-400' : 'text-blue-600'} />,
      titleColor: isDarkMode ? 'text-blue-300' : 'text-blue-800',
      messageColor: isDarkMode ? 'text-blue-400' : 'text-blue-600'
    }
  }

  const styles = variants[variant] || variants.info

  return (
    <div className={`p-4 ${styles.bg} border ${styles.border} rounded-lg ${className}`}>
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5">{styles.icon}</div>
        <div className="flex-1">
          {title && (
            <h3 className={`font-medium ${styles.titleColor}`}>
              {title}
            </h3>
          )}
          {message && (
            <p className={`text-sm ${title ? 'mt-1' : ''} ${styles.messageColor}`}>
              {message}
            </p>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`shrink-0 ${styles.messageColor} hover:opacity-70 transition-opacity`}
          >
            <FaTimes className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

export default Alert
