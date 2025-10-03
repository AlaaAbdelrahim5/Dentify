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
    <div className={`fixed left-0 top-20 w-80 shadow-xl ${
      isDarkMode ? 'bg-gray-800 border-r border-gray-700' : 'bg-white'
    }`} style={{height: 'calc(100vh - 5rem)', overflowY: 'auto'}}>
      {/* Navigation */}
      <nav className="p-4 pt-6">
        <div className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left relative ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg'
                    : isDarkMode 
                      ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <div className="flex-1">
                  <div className="font-medium">{item.label}</div>
                </div>
                {item.badge && (
                  <span className="bg-teal-500 text-white text-xs px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

export default ClinicSidebar