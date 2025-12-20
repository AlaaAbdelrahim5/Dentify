import { forwardRef } from 'react'
import { useTheme } from '../../contexts/ThemeContext'

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
  
  // Country codes with flags and names (Arab countries first)
  const countryCodes = [
    // Arab Countries
    { value: '+970', label: '🇵🇸 Palestine (+970)', flag: '🇵🇸' },
    { value: '+962', label: '🇯🇴 Jordan (+962)', flag: '🇯🇴' },
    { value: '+20', label: '🇪🇬 Egypt (+20)', flag: '🇪🇬' },
    { value: '+966', label: '🇸🇦 Saudi Arabia (+966)', flag: '🇸🇦' },
    { value: '+971', label: '🇦🇪 UAE (+971)', flag: '🇦🇪' },
    { value: '+961', label: '🇱🇧 Lebanon (+961)', flag: '🇱🇧' },
    { value: '+963', label: '🇸🇾 Syria (+963)', flag: '🇸🇾' },
    { value: '+964', label: '🇮🇶 Iraq (+964)', flag: '🇮🇶' },
    { value: '+965', label: '🇰🇼 Kuwait (+965)', flag: '🇰🇼' },
    { value: '+974', label: '🇶🇦 Qatar (+974)', flag: '🇶🇦' },
    { value: '+973', label: '🇧🇭 Bahrain (+973)', flag: '🇧🇭' },
    { value: '+968', label: '🇴🇲 Oman (+968)', flag: '🇴🇲' },
    { value: '+967', label: '🇾🇪 Yemen (+967)', flag: '🇾🇪' },
    { value: '+212', label: '🇲🇦 Morocco (+212)', flag: '🇲🇦' },
    { value: '+213', label: '🇩🇿 Algeria (+213)', flag: '🇩🇿' },
    { value: '+216', label: '🇹🇳 Tunisia (+216)', flag: '🇹🇳' },
    { value: '+218', label: '🇱🇾 Libya (+218)', flag: '🇱🇾' },
    { value: '+249', label: '🇸🇩 Sudan (+249)', flag: '🇸🇩' },
    // Regional Countries
    { value: '+90', label: '🇹🇷 Turkey (+90)', flag: '🇹🇷' },
    { value: '+98', label: '🇮🇷 Iran (+98)', flag: '🇮🇷' },
    // International
    { value: '+1', label: '🇺🇸 USA (+1)', flag: '🇺🇸' },
    { value: '+44', label: '🇬🇧 UK (+44)', flag: '🇬🇧' },
    { value: '+33', label: '🇫🇷 France (+33)', flag: '🇫🇷' },
    { value: '+49', label: '🇩🇪 Germany (+49)', flag: '🇩🇪' },
    { value: '+39', label: '🇮🇹 Italy (+39)', flag: '🇮🇹' },
    { value: '+34', label: '🇪🇸 Spain (+34)', flag: '🇪🇸' },
  ]

  const selectedCountry = countryCodes.find(country => country.value === countryCode)

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
            {countryCodes.map((country) => (
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