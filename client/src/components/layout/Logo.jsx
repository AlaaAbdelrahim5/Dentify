import { FaTooth } from 'react-icons/fa'
import { useTheme } from '../../contexts/ThemeContext'

const Logo = ({ className = "", size = "text-3xl" }) => {
  const { isDarkMode } = useTheme()
  
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="bg-gradient-to-r from-teal-500 to-cyan-600 p-3 rounded-xl">
        <FaTooth className={`${size} text-white`} />
      </div>
      <div className="flex flex-col">
        <h1 className={`${size} font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent`}>
          Dentify
        </h1>
        <p className={`text-sm font-medium ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>Dental Clinic Management</p>
      </div>
    </div>
  )
}

export default Logo