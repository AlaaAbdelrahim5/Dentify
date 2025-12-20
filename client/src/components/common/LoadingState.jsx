import { useTheme } from '../../contexts/ThemeContext'

/**
 * LoadingState Component
 * Unified loading component that displays a spinner with optional text
 * Combines functionality of both LoadingState and LoadingSpinner
 * Reusable for any loading scenario
 * 
 * @param {string} message - Loading message (default: 'Loading...')
 * @param {string} text - Alias for message for backward compatibility
 * @param {string} className - Additional CSS classes
 * @param {string} size - Spinner size: 'sm', 'md', 'lg', 'xl' (default: 'lg')
 * @param {boolean} centered - Whether to center the spinner with padding (default: true)
 */
const LoadingState = ({ 
  message,
  text,
  className = '',
  size = 'lg',
  centered = true
}) => {
  const { isDarkMode } = useTheme()
  const displayText = message || text || 'Loading...'

  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
    xl: 'w-16 h-16 border-4'
  }

  return (
    <div className={`flex flex-col items-center justify-center ${centered ? 'py-12' : ''} ${className}`}>
      <div 
        className={`
          ${sizeClasses[size]} 
          rounded-full animate-spin border-solid
          ${isDarkMode 
            ? 'border-teal-800 border-t-teal-400' 
            : 'border-teal-200 border-t-teal-600'
          }
          ${displayText ? 'mb-4' : ''}
        `}
      ></div>
      {displayText && (
        <p className={`text-sm ${
          isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>{displayText}</p>
      )}
    </div>
  )
}

export default LoadingState
