import { useEffect } from 'react'
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa'

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
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
          bg: 'bg-green-500',
          icon: <FaCheckCircle className="w-5 h-5" />
        }
      case 'error':
        return {
          bg: 'bg-red-500',
          icon: <FaExclamationTriangle className="w-5 h-5" />
        }
      case 'info':
        return {
          bg: 'bg-blue-500',
          icon: <FaInfoCircle className="w-5 h-5" />
        }
      default:
        return {
          bg: 'bg-green-500',
          icon: <FaCheckCircle className="w-5 h-5" />
        }
    }
  }

  const { bg, icon } = getTypeStyles()

  return (
    <div className="fixed top-20 right-4 z-[9999] animate-slide-in-right">
      <div className={`${bg} text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] max-w-md`}>
        <div className="flex-shrink-0">
          {icon}
        </div>
        <p className="flex-1 font-medium">{message}</p>
        <button
          onClick={onClose}
          className="flex-shrink-0 hover:bg-white/20 p-1 rounded transition-colors"
        >
          <FaTimes className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default Toast
