const LoadingSpinner = ({ size = 'md', color = 'teal' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
    xl: 'w-16 h-16 border-4'
  }

  const colorClasses = {
    teal: 'border-teal-200 border-t-teal-600',
    blue: 'border-blue-200 border-t-blue-600',
    gray: 'border-gray-200 border-t-gray-600'
  }

  return (
    <div className="flex items-center justify-center">
      <div 
        className={`
          ${sizeClasses[size]} 
          ${colorClasses[color]} 
          rounded-full animate-spin
        `}
      ></div>
    </div>
  )
}

export default LoadingSpinner