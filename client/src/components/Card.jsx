import { useTheme } from '../contexts/ThemeContext'

const Card = ({ children, className = '', hover = false, ...props }) => {
  const { isDarkMode } = useTheme()
  
  return (
    <div 
      className={`
        rounded-xl shadow-lg overflow-hidden transition-colors duration-300
        ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'}
        ${hover ? 'hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}

const CardHeader = ({ children, className = '' }) => {
  const { isDarkMode } = useTheme()
  
  return (
    <div className={`px-6 py-4 ${isDarkMode ? 'border-b border-gray-700' : 'border-b border-gray-100'} ${className}`}>
      {children}
    </div>
  )
}

const CardContent = ({ children, className = '' }) => {
  return (
    <div className={`px-6 py-4 ${className}`}>
      {children}
    </div>
  )
}

const CardFooter = ({ children, className = '' }) => {
  const { isDarkMode } = useTheme()
  
  return (
    <div className={`px-6 py-4 ${isDarkMode ? 'border-t border-gray-700' : 'border-t border-gray-100'} ${className}`}>
      {children}
    </div>
  )
}

Card.Header = CardHeader
Card.Content = CardContent
Card.Footer = CardFooter

export default Card