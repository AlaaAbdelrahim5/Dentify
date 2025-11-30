import { useTheme } from '../../contexts/ThemeContext'
import { 
  FaUsers,
  FaCalendarAlt,
  FaChartBar,
  FaCog,
  FaClock,
  FaStethoscope,
  FaFileAlt,
  FaMoneyBillWave,
  FaXRay,
  FaHospital,
  FaUserMd,
  FaUserShield,
  FaUserTie,
  FaTooth,
  FaHistory,
  FaHome,
  FaSearch,
  FaFileImage
} from 'react-icons/fa'
import { MdDashboard, MdPendingActions } from 'react-icons/md'
import ThemeToggle from './ThemeToggle'

const Sidebar = ({ activeTab, setActiveTab, userType, stats = {}, dashboardTitle = '', isSidebarOpen = false, onClose = null }) => {
  const { isDarkMode } = useTheme()

  // Define menu items for each user type
  const menuConfig = {
    admin: [
      { 
        id: 'overview', 
        label: 'Overview', 
        icon: MdDashboard,
        description: 'System overview and statistics'
      },
      { 
        id: 'clinics', 
        label: 'Clinics', 
        icon: FaHospital,
        description: 'Manage dental clinics'
      },
      { 
        id: 'dentists', 
        label: 'Dentist Approvals', 
        icon: FaUserMd,
        description: 'Review and approve dentist registrations'
      },
      { 
        id: 'radiology', 
        label: 'Radiology Centers', 
        icon: FaXRay,
        description: 'Manage radiology centers'
      },
      { 
        id: 'admins', 
        label: 'Admin Management', 
        icon: FaUserShield,
        description: 'Manage system administrators'
      },
      { 
        id: 'analytics', 
        label: 'Analytics', 
        icon: FaChartBar,
        description: 'System analytics and reports'
      }
    ],
    clinic: [
      { 
        id: 'overview', 
        label: 'Overview', 
        icon: MdDashboard,
        description: 'Clinic overview and statistics'
      },
      { 
        id: 'appointments', 
        label: 'Appointments', 
        icon: FaCalendarAlt,
        description: 'Manage appointments'
      },
      { 
        id: 'patients', 
        label: 'Patients', 
        icon: FaUsers,
        description: 'Manage patients'
      },
      { 
        id: 'dentists', 
        label: 'Dentists', 
        icon: FaUserMd,
        description: 'Manage clinic dentists'
      },
      { 
        id: 'secretaries', 
        label: 'Secretaries', 
        icon: FaUserTie,
        description: 'Manage clinic secretaries'
      },
      { 
        id: 'analytics', 
        label: 'Analytics', 
        icon: FaChartBar,
        description: 'Clinic analytics and reports'
      }
    ],
    dentist: [
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
        description: 'Manage appointments'
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
        id: 'patients', 
        label: 'My Patients', 
        icon: FaUsers,
        description: 'Manage patient records'
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
      }
    ],
    patient: [
      { 
        id: 'overview', 
        label: 'Overview', 
        icon: MdDashboard
      },
      { 
        id: 'appointments', 
        label: 'Appointments', 
        icon: FaCalendarAlt
      },
      { 
        id: 'history', 
        label: 'Treatments', 
        icon: FaTooth
      },
      { 
        id: 'payments', 
        label: 'Payments', 
        icon: FaMoneyBillWave
      },
      { 
        id: 'xrays', 
        label: 'X-ray Results', 
        icon: FaXRay
      },
      { 
        id: 'find-dentist', 
        label: 'Find a Dentist', 
        icon: FaUserMd
      },
      { 
        id: 'find-clinic', 
        label: 'Find a Clinic', 
        icon: FaSearch
      }
    ],
    radiology: [
      { 
        id: 'overview', 
        label: 'Overview', 
        icon: MdDashboard
      },
      { 
        id: 'requests', 
        label: 'Imaging Requests', 
        icon: FaFileImage
      }
    ],
    secretary: [
      { 
        id: 'overview', 
        label: 'Overview', 
        icon: MdDashboard,
        description: 'Dashboard overview'
      },
      { 
        id: 'appointments', 
        label: 'Appointments', 
        icon: FaCalendarAlt,
        description: 'Manage clinic appointments'
      },
      { 
        id: 'treatments', 
        label: 'Treatments', 
        icon: FaStethoscope,
        description: 'View treatment plans'
      },
      { 
        id: 'payments', 
        label: 'Payments', 
        icon: FaMoneyBillWave,
        description: 'Track and manage payments'
      },
      { 
        id: 'patients', 
        label: 'Patients', 
        icon: FaUsers,
        description: 'View patient records'
      },
      { 
        id: 'dentists', 
        label: 'Dentists', 
        icon: FaUserMd,
        description: 'View dentists directory'
      },
      { 
        id: 'reports', 
        label: 'Reports', 
        icon: FaFileAlt,
        description: 'Clinic reports and statistics'
      }
    ]
  }

  // Get menu items for current user type
  const menuItems = menuConfig[userType] || []

  return (
    <>
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-72 border-r transition-all duration-300 z-50 ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      } ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
      <div className="h-full overflow-y-auto my-2 flex flex-col">
        {/* Navigation Menu */}
        <nav className="p-4 space-y-2 flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? isDarkMode
                      ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-500/30'
                      : 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/30'
                    : isDarkMode
                      ? 'text-gray-300 hover:bg-gray-700/70 hover:text-white'
                      : 'text-gray-700 hover:bg-gray-100 hover:shadow-sm'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-200 ${
                  isActive ? '' : 'group-hover:scale-110'
                }`} />
                <span className="font-semibold flex-1 text-left">{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Dashboard Title at Bottom */}
        {dashboardTitle && (
          <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700/50' : 'border-gray-200/50'}`}>
            <div className={`flex items-center justify-between px-4 py-3.5 rounded-xl border shadow-lg ${
              isDarkMode 
                ? 'bg-gradient-to-r from-teal-900/40 to-cyan-900/40 border-teal-700/50 shadow-teal-900/30' 
                : 'bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200/50 shadow-teal-500/10'
            }`}>
              <div className="flex items-center space-x-3">
                <div className={`p-2.5 rounded-xl shadow-md ${
                  isDarkMode ? 'bg-gradient-to-br from-teal-500/30 to-cyan-500/30' : 'bg-gradient-to-br from-teal-100 to-cyan-100'
                }`}>
                  <MdDashboard className={`text-xl ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`} />
                </div>
                <div className="flex flex-col">
                  <span className={`text-xs font-semibold ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>Dashboard</span>
                  <span className={`text-sm font-bold ${
                    isDarkMode ? 'text-gray-100' : 'text-gray-800'
                  }`}>{dashboardTitle.replace(' Dashboard', '')}</span>
                </div>
              </div>
              <ThemeToggle />
            </div>
          </div>
        )}
      </div>
    </aside>
    </>
  )
}

export default Sidebar
