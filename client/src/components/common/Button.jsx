import { useTheme } from '../../contexts/ThemeContext'

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  disabled = false,
  onClick,
  type = 'button',
  ...props 
}) => {
  const { isDarkMode } = useTheme()
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
  
  const getVariantClasses = () => {
    const variants = {
      primary: 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:shadow-lg focus:ring-teal-500',
      secondary: isDarkMode 
        ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 focus:ring-gray-400'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500',
      outline: isDarkMode
        ? 'border-2 border-teal-400 text-teal-400 hover:bg-teal-500 hover:text-white focus:ring-teal-500'
        : 'border-2 border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white focus:ring-teal-500',
      ghost: isDarkMode
        ? 'text-teal-400 hover:bg-gray-800 focus:ring-teal-500'
        : 'text-teal-600 hover:bg-teal-50 focus:ring-teal-500',
      success: 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:shadow-lg focus:ring-green-500',
      danger: 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:shadow-lg focus:ring-red-500',
      warning: 'bg-gradient-to-r from-yellow-600 to-yellow-700 text-white hover:shadow-lg focus:ring-yellow-500'
    }
    return variants[variant]
  }
  
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  }
  
  const classes = `${baseClasses} ${getVariantClasses()} ${sizes[size]} ${className}`
  
  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button