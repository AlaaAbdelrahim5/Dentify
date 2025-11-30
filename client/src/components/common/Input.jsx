import { forwardRef } from 'react'
import { useTheme } from '../../contexts/ThemeContext'

const Input = forwardRef(({ 
  label, 
  type = 'text', 
  placeholder, 
  error, 
  icon: Icon,
  className = '',
  ...props 
}, ref) => {
  const { isDarkMode } = useTheme()
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className={`block text-sm font-medium mb-2 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className={`h-5 w-5 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`} />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          className={`
            block w-full rounded-lg border px-3 py-3 text-sm shadow-sm transition-all duration-200
            focus:border-teal-500 focus:ring-2 focus:ring-teal-500 focus:ring-opacity-20
            ${isDarkMode 
              ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
              : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
            }
            ${Icon ? 'pl-10 pr-3' : 'px-3'}
            ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className={`mt-2 text-sm ${
          isDarkMode ? 'text-red-400' : 'text-red-600'
        }`}>{error}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input