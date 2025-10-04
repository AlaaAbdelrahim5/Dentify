import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  FaUsers,
  FaUserTie,
  FaCalendarAlt,
  FaClock,
  FaPlus,
  FaSearch,
  FaFilter,
  FaChartBar,
  FaCog,
  FaUserMd
} from 'react-icons/fa'
import { MdDashboard } from 'react-icons/md'
import { Navbar, Card, Button } from '../../components'
import { authUtils } from '../../utils/auth'
import { useTheme } from '../../contexts/ThemeContext'
import ClinicSidebar from '../../components/clinic/ClinicSidebar'
import SecretariesManagement from './clinic/SecretariesManagement'
import DentistsManagement from './clinic/DentistsManagement'

const ClinicDashboard = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isDarkMode } = useTheme()
  const [activeTab, setActiveTab] = useState('overview')
  const [currentUser, setCurrentUser] = useState(null)
  const [clinicData, setClinicData] = useState(null)
  const [stats, setStats] = useState({
    totalSecretaries: 0,
    totalDentists: 0,
    todayAppointments: 0,
    totalPatients: 0,
    pendingAppointments: 0
  })

  // Check authentication and get user data
  useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = await authUtils.isAuthenticated()
      
      if (!isAuthenticated) {
        navigate('/login', { replace: true })
        return
      }
      
      const user = authUtils.getCurrentUser()
      
      // Check if user is clinic
      if (!user || user.role !== 'Clinic') {
        navigate('/dashboard', { replace: true })
        return
      }
      
      setCurrentUser(user)
      // TODO: Fetch clinic data from API
    }

    checkAuth()
  }, [navigate, location.state])

  // Mock data - Replace with actual API calls later
  useEffect(() => {
    // Simulate loading stats
    setStats({
      totalSecretaries: 3,
      totalDentists: 5,
      todayAppointments: 12,
      totalPatients: 156,
      pendingAppointments: 8
    })

    // Mock clinic data
    setClinicData({
      clinicName: "Smile Dental Center",
      city: "Damascus",
      registrationNumber: "DC001",
      location: "Downtown Area"
    })
  }, [])

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
            Welcome to {clinicData?.clinicName || 'Your Clinic'}
          </h2>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {clinicData?.city} • Registration: {clinicData?.registrationNumber}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex items-center gap-2"
          >
            <FaFilter className="w-4 h-4" />
            Filter
          </Button>
          <Button
            variant="primary"
            className="flex items-center gap-2"
          >
            <FaPlus className="w-4 h-4" />
            Quick Add
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className={`p-6 border ${isDarkMode 
          ? 'bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-700/30' 
          : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>Secretaries</p>
              <p className={`text-3xl font-bold ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>{stats.totalSecretaries}</p>
            </div>
            <FaUserTie className={`w-8 h-8 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          </div>
        </Card>

        <Card className={`p-6 border ${isDarkMode 
          ? 'bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-700/30' 
          : 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>Dentists</p>
              <p className={`text-3xl font-bold ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>{stats.totalDentists}</p>
            </div>
            <FaUserMd className={`w-8 h-8 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
          </div>
        </Card>

        <Card className={`p-6 border ${isDarkMode 
          ? 'bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 border-yellow-700/30' 
          : 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>Today's Appointments</p>
              <p className={`text-3xl font-bold ${isDarkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>{stats.todayAppointments}</p>
            </div>
            <FaCalendarAlt className={`w-8 h-8 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
          </div>
        </Card>

        <Card className={`p-6 border ${isDarkMode 
          ? 'bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-700/30' 
          : 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>Total Patients</p>
              <p className={`text-3xl font-bold ${isDarkMode ? 'text-purple-300' : 'text-purple-800'}`}>{stats.totalPatients}</p>
            </div>
            <FaUsers className={`w-8 h-8 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
          </div>
        </Card>

        <Card className={`p-6 border ${isDarkMode 
          ? 'bg-gradient-to-br from-red-900/20 to-red-800/20 border-red-700/30' 
          : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>Pending</p>
              <p className={`text-3xl font-bold ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>{stats.pendingAppointments}</p>
            </div>
            <FaClock className={`w-8 h-8 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
          </div>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card className="p-6">
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Recent Activities</h3>
        <div className="space-y-4">
          <div className={`flex items-center gap-4 p-3 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>New secretary added: Sarah Ahmed</p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>2 hours ago</p>
            </div>
          </div>
          <div className={`flex items-center gap-4 p-3 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Appointment scheduled: John Doe with Dr. Smith</p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>4 hours ago</p>
            </div>
          </div>
          <div className={`flex items-center gap-4 p-3 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Patient record updated: Maria Johnson</p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>1 day ago</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview()
      case 'secretaries':
        return <SecretariesManagement />
      case 'dentists':
        return <DentistsManagement />
      case 'appointments':
        return (
          <div className="text-center py-12">
            <FaCalendarAlt className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Appointment Management</h3>
            <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>This section will be implemented next</p>
            <Button variant="primary">Coming Soon</Button>
          </div>
        )
      case 'patients':
        return (
          <div className="text-center py-12">
            <FaUsers className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Patient Management</h3>
            <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>This section will be implemented next</p>
            <Button variant="primary">Coming Soon</Button>
          </div>
        )
      case 'analytics':
        return (
          <div className="text-center py-12">
            <FaChartBar className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Analytics & Reports</h3>
            <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>This section will be implemented next</p>
            <Button variant="primary">Coming Soon</Button>
          </div>
        )
      case 'settings':
        return (
          <div className="text-center py-12">
            <FaCog className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Clinic Settings</h3>
            <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>This section will be implemented next</p>
            <Button variant="primary">Coming Soon</Button>
          </div>
        )
      default:
        return renderOverview()
    }
  }

  if (!currentUser) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
          : 'bg-gradient-to-br from-teal-50 to-blue-50'
      }`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
        : 'bg-gradient-to-br from-teal-50 to-blue-50'
    }`}>
      {/* Unified Header */}
      <Navbar showDashboardInfo={true} dashboardTitle="Clinic Dashboard" />

      {/* Fixed Sidebar */}
      <ClinicSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        stats={stats} 
      />

      {/* Main Content with left margin to account for fixed sidebar */}
      <div className="ml-80 pt-20">
        <div className="p-8">
          {renderTabContent()}
        </div>
      </div>
    </div>
  )
}

export default ClinicDashboard