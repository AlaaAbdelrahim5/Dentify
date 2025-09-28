import { forwardRef } from 'react'

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
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <select
          ref={ref}
          value={value}
          onChange={onChange}
          className={`
            block w-full rounded-lg border border-gray-300 py-3 text-sm
            bg-white shadow-sm transition-all duration-200 appearance-none cursor-pointer
            focus:border-teal-500 focus:ring-2 focus:ring-teal-500 focus:ring-opacity-20
            hover:border-gray-400
            ${Icon ? 'pl-10 pr-10' : 'pl-3 pr-10'}
            ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
            ${!value ? 'text-gray-500' : 'text-gray-900'}
          `}
          {...props}
        >
          <option value="" disabled className="text-gray-500">
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value} className="text-gray-900 py-2">
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Dropdown Arrow */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
})

Select.displayName = 'Select'

export default Select