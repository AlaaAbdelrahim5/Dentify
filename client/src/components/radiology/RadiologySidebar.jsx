import { useState } from 'react'
import { 
  FaFileImage,
  FaCog,
  FaChartBar,
  FaXRay,
  FaHospital,
  FaSignOutAlt,
  FaCheckCircle,
  FaClock
} from 'react-icons/fa'
import { MdDashboard, MdPendingActions } from 'react-icons/md'
import { useTheme } from '../../contexts/ThemeContext'

const RadiologySidebar = ({ activeTab, onTabChange, onLogout, radiologyData }) => {
  const { isDarkMode } = useTheme()

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: MdDashboard },
    { id: 'requests', label: 'Imaging Requests', icon: FaFileImage },
    { id: 'settings', label: 'Settings', icon: FaCog }
  ]

  return (
    <aside className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-72 border-r transition-colors duration-300 z-30 ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="h-full overflow-y-auto my-2">
        {/* Navigation Menu */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? isDarkMode
                      ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg'
                      : 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md'
                    : isDarkMode
                      ? 'text-gray-300 hover:bg-gray-700'
                      : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}

export default RadiologySidebar
