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
      id: 'schedule', 
      label: 'Schedule', 
      icon: FaClock,
      description: 'Manage working hours and availability'
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

export default DentistSidebar