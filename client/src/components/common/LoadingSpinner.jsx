import { useTheme } from '../../contexts/ThemeContext'

const LoadingSpinner = ({ size = 'md', text = 'Loading...', className = '' }) => {
  const { isDarkMode } = useTheme()
  
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
    xl: 'w-16 h-16 border-4'
  }

  return (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      <div 
        className={`
          ${sizeClasses[size]} 
          rounded-full animate-spin border-solid
          ${isDarkMode 
            ? 'border-teal-800 border-t-teal-400' 
            : 'border-teal-200 border-t-teal-600'
          }
        `}
      ></div>
      {text && (
        <p className={`text-sm ${
          isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>{text}</p>
      )}
    </div>
  )
}

export default LoadingSpinner