import { useState } from 'react'
import { 
  FaUsers,
  FaCalendarAlt,
  FaChartBar,
  FaCog,
  FaClock,
  FaStethoscope,
  FaFileAlt,
  FaMoneyBillWave,
  FaXRay
} from 'react-icons/fa'
import { MdDashboard } from 'react-icons/md'
import { useTheme } from '../../contexts/ThemeContext'

const DentistSidebar = ({ activeTab, setActiveTab, stats }) => {
  const { isDarkMode } = useTheme()

  const sidebarItems = [
    { 
      id: 'overview', 
      label: 'Overview', 
      icon: MdDashboard,
      description: 'Dashboard overview and statistics'
    },
    { 
      id: 'appointments', 
      label: 'Appointments', 
      icon: FaCalendarAlt,
      description: 'Manage appointments',
      badge: stats.todayAppointments > 0 ? stats.todayAppointments : null
    },
    { 
      id: 'patients', 
      label: 'My Patients', 
      icon: FaUsers,
      description: 'Manage patient records',
      badge: stats.totalPatients > 0 ? stats.totalPatients : null
    },
    { 
      id: 'treatments', 
      label: 'Treatments', 
      icon: FaStethoscope,
      description: 'Treatment plans and procedures'
    },
    { 
      id: 'payments', 
      label: 'Payments', 
      icon: FaMoneyBillWave,
      description: 'Track and manage payments'
    },
    { 
      id: 'radiology', 
      label: 'Radiology', 
      icon: FaXRay,
      description: 'Diagnostic imaging requests'
    },
    { 
      id: 'reports', 
      label: 'Reports', 
      icon: FaFileAlt,
      description: 'Medical reports and documentation'
    },
    { 
      id: 'analytics', 
      label: 'Analytics', 
      icon: FaChartBar,
      description: 'Performance analytics and insights'
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: FaCog,
      description: 'Profile and preferences'
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

export default DentistSidebar