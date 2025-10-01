import { forwardRef } from 'react'
import { useTheme } from '../contexts/ThemeContext'

const Select = forwardRef(({ 
  label, 
  options = [],
  placeholder = 'Select an option',
  error, 
  icon: Icon,
  className = '',
  value,
  onChange,
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
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <Icon className={`h-5 w-5 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`} />
          </div>
        )}
        <select
          ref={ref}
          value={value}
          onChange={onChange}
          className={`
            block w-full rounded-lg border py-3 text-sm shadow-sm transition-all duration-200 appearance-none cursor-pointer
            focus:border-teal-500 focus:ring-2 focus:ring-teal-500 focus:ring-opacity-20
            ${isDarkMode 
              ? 'border-gray-600 bg-gray-700 hover:border-gray-500'
              : 'border-gray-300 bg-white hover:border-gray-400'
            }
            ${Icon ? 'pl-10 pr-10' : 'pl-3 pr-10'}
            ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
            ${!value 
              ? (isDarkMode ? 'text-gray-400' : 'text-gray-500')
              : (isDarkMode ? 'text-white' : 'text-gray-900')
            }
          `}
          {...props}
        >
          <option value="" disabled className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value} className={`py-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Dropdown Arrow */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg className={`h-5 w-5 ${
            isDarkMode ? 'text-gray-500' : 'text-gray-400'
          }`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      {error && (
        <p className={`mt-2 text-sm ${
          isDarkMode ? 'text-red-400' : 'text-red-600'
        }`}>{error}</p>
      )}
    </div>
  )
})

Select.displayName = 'Select'

export default Select