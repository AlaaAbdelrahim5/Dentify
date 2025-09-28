import { forwardRef } from 'react'

const Input = forwardRef(({ 
  label, 
  type = 'text', 
  placeholder, 
  error, 
  icon: Icon,
  className = '',
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
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          className={`
            block w-full rounded-lg border border-gray-300 px-3 py-3 text-sm
            placeholder-gray-500 shadow-sm transition-all duration-200
            focus:border-teal-500 focus:ring-2 focus:ring-teal-500 focus:ring-opacity-20
            ${Icon ? 'pl-10' : 'pl-3'}
            ${type === 'password' || placeholder?.toLowerCase().includes('password') ? 'pr-10' : 'pr-3'}
            ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input