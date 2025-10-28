import { useState } from 'react'
import { 
  FaUsers,
  FaUserTie,
  FaUserMd,
  FaCalendarAlt,
  FaChartBar,
  FaCog
} from 'react-icons/fa'
import { MdDashboard } from 'react-icons/md'
import { useTheme } from '../../contexts/ThemeContext'

const ClinicSidebar = ({ activeTab, setActiveTab, stats }) => {
  const { isDarkMode } = useTheme()

  const sidebarItems = [
    { 
      id: 'overview', 
      label: 'Overview', 
      icon: MdDashboard,
      description: 'Clinic overview and statistics'
    },
    { 
      id: 'secretaries', 
      label: 'Secretaries', 
      icon: FaUserTie,
      description: 'Manage clinic secretaries',
      badge: stats.totalSecretaries > 0 ? stats.totalSecretaries : null
    },
    { 
      id: 'dentists', 
      label: 'Dentists', 
      icon: FaUserMd,
      description: 'Manage clinic dentists',
      badge: stats.totalDentists > 0 ? stats.totalDentists : null
    },
    { 
      id: 'appointments', 
      label: 'Appointments', 
      icon: FaCalendarAlt,
      description: 'Manage appointments',
      badge: stats.pendingAppointments > 0 ? stats.pendingAppointments : null
    },
    { 
      id: 'patients', 
      label: 'Patients', 
      icon: FaUsers,
      description: 'Manage patients'
    },
    { 
      id: 'analytics', 
      label: 'Analytics', 
      icon: FaChartBar,
      description: 'Clinic analytics and reports'
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: FaCog,
      description: 'Clinic settings and configuration'
    }
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
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
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
                {item.badge && (
                  <span className="ml-auto bg-teal-500 text-white text-xs px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}

export default ClinicSidebar