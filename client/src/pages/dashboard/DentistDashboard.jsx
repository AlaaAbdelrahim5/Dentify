import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  FaUsers,
  FaCalendarAlt,
  FaClock,
  FaStethoscope,
  FaFileAlt,
  FaChartBar,
  FaPlus,
  FaSearch,
  FaFilter,
  FaCog
} from 'react-icons/fa'
import { MdDashboard } from 'react-icons/md'
import { Navbar, Card, Button } from '../../components'
import { authUtils } from '../../utils/auth'
import { useTheme } from '../../contexts/ThemeContext'
import DentistSidebar from '../../components/dentist/DentistSidebar'
import DentistAppointments from './dentist/DentistAppointments'
import DentistPatients from './dentist/DentistPatients'
import DentistSchedule from './dentist/DentistSchedule'
import DentistSettings from './dentist/DentistSettings'
// Import dentist-specific page components (to be created)
// import DentistTreatments from './dentist/DentistTreatments'
// import DentistReports from './dentist/DentistReports'

const DentistDashboard = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isDarkMode } = useTheme()
  const [activeTab, setActiveTab] = useState('overview')
  const [currentUser, setCurrentUser] = useState(null)
  const [dentistData, setDentistData] = useState(null)
  const [stats, setStats] = useState({
    todayAppointments: 0,
    totalPatients: 0,
    pendingTreatments: 0,
    completedToday: 0,
    weeklyRevenue: 0
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
      
      if (!user || user.role !== 'Dentist') {
        console.error('Access denied. User is not a dentist:', user)
        navigate('/login', { replace: true })
        return
      }
      
      setCurrentUser(user)
      await fetchDentistData(user)
    }

    checkAuth()
  }, [navigate])

  // Fetch dentist-specific data
  const fetchDentistData = async (user) => {
    try {
      const token = authUtils.getAccessToken()
      
      // Fetch dentist profile
      const dentistResponse = await fetch(`http://localhost:5000/api/dentists/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (dentistResponse.ok) {
        const dentistData = await dentistResponse.json()
        setDentistData(dentistData.data)
        
        // Fetch dashboard statistics
        await fetchDashboardStats(token)
      } else {
        console.error('Failed to fetch dentist data')
      }
    } catch (error) {
      console.error('Error fetching dentist data:', error)
    }
  }

  // Fetch dashboard statistics
  const fetchDashboardStats = async (token) => {
    try {
      const response = await fetch('http://localhost:5000/api/dentists/dashboard-stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats || stats)
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    }
  }

  // Render overview tab
  const renderOverview = () => (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className={`p-6 rounded-xl ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      } shadow-lg`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>
              Welcome back, Dr. {dentistData?.firstName || 'Doctor'}!
            </h1>
            <p className={`mt-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {dentistData?.specialization?.join(', ') || 'General Practice'} • {dentistData?.clinic?.name || 'Clinic'}
            </p>
          </div>
          <div className={`p-4 rounded-full ${
            isDarkMode ? 'bg-teal-900' : 'bg-teal-100'
          }`}>
            <FaStethoscope className="w-8 h-8 text-teal-600" />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className={`p-6 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Today's Appointments</p>
              <p className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>{stats.todayAppointments}</p>
            </div>
            <FaCalendarAlt className="w-8 h-8 text-blue-500" />
          </div>
        </Card>

        <Card className={`p-6 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Total Patients</p>
              <p className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>{stats.totalPatients}</p>
            </div>
            <FaUsers className="w-8 h-8 text-green-500" />
          </div>
        </Card>

        <Card className={`p-6 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Pending Treatments</p>
              <p className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>{stats.pendingTreatments}</p>
            </div>
            <FaStethoscope className="w-8 h-8 text-orange-500" />
          </div>
        </Card>

        <Card className={`p-6 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Completed Today</p>
              <p className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>{stats.completedToday}</p>
            </div>
            <FaFileAlt className="w-8 h-8 text-purple-500" />
          </div>
        </Card>
      </div>

      {/* Today's Schedule */}
      <Card className={`p-6 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-xl font-semibold ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>Today's Schedule</h2>
          <Button variant="outline" size="sm">
            <FaPlus className="w-4 h-4 mr-2" />
            Add Appointment
          </Button>
        </div>
        
        {/* Placeholder for today's appointments */}
        <div className="text-center py-8">
          <FaCalendarAlt className={`w-12 h-12 mx-auto mb-4 ${
            isDarkMode ? 'text-gray-500' : 'text-gray-400'
          }`} />
          <p className={`${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>No appointments scheduled for today</p>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className={`p-6 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <h2 className={`text-xl font-semibold mb-6 ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>Quick Actions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            variant="outline" 
            className="p-4 h-auto flex-col"
            onClick={() => setActiveTab('appointments')}
          >
            <FaCalendarAlt className="w-6 h-6 mb-2" />
            <span>Manage Appointments</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="p-4 h-auto flex-col"
            onClick={() => setActiveTab('patients')}
          >
            <FaUsers className="w-6 h-6 mb-2" />
            <span>View Patients</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="p-4 h-auto flex-col"
            onClick={() => setActiveTab('schedule')}
          >
            <FaClock className="w-6 h-6 mb-2" />
            <span>Update Schedule</span>
          </Button>
        </div>
      </Card>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview()
      case 'appointments':
        return <DentistAppointments />
      case 'patients':
        return <DentistPatients />
      case 'schedule':
        return <DentistSchedule />
      case 'treatments':
        return (
          <div className="text-center py-12">
            <FaStethoscope className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Treatment Management</h3>
            <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Manage treatment plans and procedures</p>
            <Button variant="primary">Coming Soon</Button>
          </div>
        )
      case 'reports':
        return (
          <div className="text-center py-12">
            <FaFileAlt className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Medical Reports</h3>
            <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Generate and manage medical reports</p>
            <Button variant="primary">Coming Soon</Button>
          </div>
        )
      case 'analytics':
        return (
          <div className="text-center py-12">
            <FaChartBar className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Analytics & Insights</h3>
            <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>View performance analytics and insights</p>
            <Button variant="primary">Coming Soon</Button>
          </div>
        )
      case 'settings':
        return <DentistSettings />
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
      <Navbar showDashboardInfo={true} dashboardTitle="Dentist Dashboard" />

      {/* Fixed Sidebar */}
      <DentistSidebar 
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

export default DentistDashboard