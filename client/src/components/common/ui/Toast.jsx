import { useEffect } from 'react'
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa'
import { useTheme } from '../../../contexts/ThemeContext'

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  const { isDarkMode } = useTheme()
  
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: isDarkMode ? 'bg-green-600' : 'bg-green-500',
          icon: <FaCheckCircle className="w-5 h-5" />
        }
      case 'error':
        return {
          bg: isDarkMode ? 'bg-red-600' : 'bg-red-500',
          icon: <FaExclamationTriangle className="w-5 h-5" />
        }
      case 'info':
        return {
          bg: isDarkMode ? 'bg-blue-600' : 'bg-blue-500',
          icon: <FaInfoCircle className="w-5 h-5" />
        }
      case 'warning':
        return {
          bg: isDarkMode ? 'bg-yellow-600' : 'bg-yellow-500',
          icon: <FaExclamationTriangle className="w-5 h-5" />
        }
      default:
        return {
          bg: isDarkMode ? 'bg-green-600' : 'bg-green-500',
          icon: <FaCheckCircle className="w-5 h-5" />
        }
    }
  }

  const { bg, icon } = getTypeStyles()

  return (
    <div className="fixed top-20 right-4 z-9999 animate-slide-in-right">
      <div className={`${bg} text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 min-w-75 max-w-md`}>
        <div className="shrink-0">
          {icon}
        </div>
        <p className="flex-1 font-medium">{message}</p>
        <button
          onClick={onClose}
          className="shrink-0 hover:bg-white/20 p-1 rounded transition-colors"
        >
          <FaTimes className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default Toast
