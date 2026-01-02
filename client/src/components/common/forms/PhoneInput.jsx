import { forwardRef } from 'react'
import { useTheme } from '../../../contexts/ThemeContext'
import { COUNTRY_CODES } from '../../../utils/constants'

const PhoneInput = forwardRef(({ 
  label, 
  countryCode,
  phoneNumber,
  onCountryChange,
  onPhoneChange,
  error, 
  icon: Icon,
  className = '',
  placeholder = 'Enter phone number',
  ...props 
}, ref) => {
  const { isDarkMode } = useTheme()

  const selectedCountry = COUNTRY_CODES.find(country => country.value === countryCode)

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
        
        <div className="flex">
          {/* Country Code Selector */}
          <select
            value={countryCode}
            onChange={onCountryChange}
            className={`
              rounded-l-lg border border-r-0 py-3 text-sm shadow-sm transition-all duration-200 appearance-none
              focus:border-teal-500 focus:ring-2 focus:ring-teal-500 focus:ring-opacity-20
              cursor-pointer text-transparent w-24 shrink-0
              ${isDarkMode 
                ? 'border-gray-600 bg-gray-700 hover:border-gray-500'
                : 'border-gray-300 bg-white hover:border-gray-400'
              }
              ${Icon ? 'pl-10 pr-8' : 'pl-3 pr-8'}
              ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
            `}
          >
            {COUNTRY_CODES.map((country) => (
              <option key={country.value} value={country.value} className={`py-1 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {country.label}
              </option>
            ))}
          </select>
          
          {/* Display only the selected country code in the select box */}
          <div className={`absolute top-1/2 transform -translate-y-1/2 pointer-events-none z-20 text-sm font-medium ${
            Icon ? 'left-10' : 'left-3'
          } ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {selectedCountry?.value || '+970'}
          </div>
          
          {/* Country Code Dropdown Arrow */}
          <div className={`absolute top-1/2 transform -translate-y-1/2 pointer-events-none z-10 ${Icon ? 'left-20' : 'left-16'}`}>
            <svg className={`h-4 w-4 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>

          {/* Phone Number Input */}
          <input
            ref={ref}
            type="tel"
            value={phoneNumber}
            onChange={onPhoneChange}
            placeholder={placeholder}
            className={`
              flex-1 rounded-r-lg border py-3 px-3 text-sm shadow-sm transition-all duration-200
              focus:border-teal-500 focus:ring-2 focus:ring-teal-500 focus:ring-opacity-20
              ${isDarkMode 
                ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
              }
              ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
            `}
            {...props}
          />
        </div>
        
        {/* Display selected country flag in the phone input */}
        {selectedCountry && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <span className="text-lg">{selectedCountry.flag}</span>
          </div>
        )}
      </div>
      
      {error && (
        <p className={`mt-2 text-sm ${
          isDarkMode ? 'text-red-400' : 'text-red-600'
        }`}>{error}</p>
      )}
    </div>
  )
})

PhoneInput.displayName = 'PhoneInput'

export default PhoneInput