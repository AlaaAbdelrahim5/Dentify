import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  FaFileImage,
  FaCheckCircle,
  FaChartBar,
  FaCog,
  FaHospital,
  FaClock
} from 'react-icons/fa'
import { MdPendingActions } from 'react-icons/md'
import { Navbar, Card, Button, StatsOverview } from '../../components'
import { authUtils } from '../../utils/auth'
import { useTheme } from '../../contexts/ThemeContext'
import RadiologySidebar from '../../components/radiology/RadiologySidebar'
import RadiologyRequests from './radiology/RadiologyRequests'
import RadiologySettings from './radiology/RadiologySettings'

const RadiologyDashboard = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isDarkMode } = useTheme()
  const [activeTab, setActiveTab] = useState('overview')
  const [currentUser, setCurrentUser] = useState(null)
  const [radiologyData, setRadiologyData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    completedToday: 0,
    completedThisMonth: 0
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
      
      if (!user || user.role !== 'RadiologyCenter') {
        console.error('Access denied. User is not a radiology center:', user)
        navigate('/login', { replace: true })
        return
      }
      
      setCurrentUser(user)
      await fetchRadiologyData(user)
    }

    checkAuth()
  }, [navigate])

  // Fetch radiology center data
  const fetchRadiologyData = async (user) => {
    try {
      setIsLoading(true)
      const token = authUtils.getAccessToken()
      
      // Fetch radiology center profile
      const radiologyResponse = await fetch(`http://localhost:5000/api/radiology-centers/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (radiologyResponse.ok) {
        const data = await radiologyResponse.json()
        setRadiologyData(data.data || data)
        
        // Fetch dashboard statistics
        await fetchDashboardStats(token)
      } else {
        console.error('Failed to fetch radiology center data')
      }
    } catch (error) {
      console.error('Error fetching radiology center data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch dashboard statistics
  const fetchDashboardStats = async (token) => {
    try {
      const response = await fetch('http://localhost:5000/api/radiology-requests/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats || data.data || stats)
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    }
  }

  // Handle logout
  const handleLogout = async () => {
    try {
      await authUtils.logout()
      navigate('/', { replace: true })
    } catch (error) {
      console.error('Error during logout:', error)
      navigate('/', { replace: true })
    }
  }

  // Render overview tab content
  const renderOverview = () => {
    const statsData = [
      {
        label: 'Total Requests',
        value: stats.totalRequests,
        icon: FaFileImage,
        gradient: 'from-blue-600 to-cyan-600'
      },
      {
        label: 'Pending Requests',
        value: stats.pendingRequests,
        icon: MdPendingActions,
        gradient: 'from-yellow-600 to-orange-600'
      },
      {
        label: 'Completed Today',
        value: stats.completedToday,
        icon: FaCheckCircle,
        gradient: 'from-green-600 to-teal-600'
      },
      {
        label: 'This Month',
        value: stats.completedThisMonth,
        icon: FaChartBar,
        gradient: 'from-purple-600 to-pink-600'
      }
    ]

    return (
      <div className="space-y-6">
        {/* Statistics Cards */}
        <StatsOverview stats={statsData} />

        {/* Center Information */}
        {radiologyData && (
          <Card className="p-6">
            <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <FaHospital className="text-blue-600 dark:text-blue-400" />
              Center Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Center Name
                </p>
                <p className={`font-semibold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{radiologyData.centerName}</p>
              </div>
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Registration Number
                </p>
                <p className={`font-semibold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{radiologyData.registrationNumber}</p>
              </div>
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  City
                </p>
                <p className={`font-semibold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{radiologyData.city}</p>
              </div>
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Email
                </p>
                <p className={`font-semibold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{currentUser?.email}</p>
              </div>
              {radiologyData.website && (
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Website
                  </p>
                  <a 
                    href={radiologyData.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-semibold mt-1 text-blue-600 hover:underline"
                  >
                    {radiologyData.website}
                  </a>
                </div>
              )}
              {radiologyData.supportedTypes && radiologyData.supportedTypes.length > 0 && (
                <div className="md:col-span-2">
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Supported Imaging Types
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {radiologyData.supportedTypes.map((type, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => setActiveTab('requests')}
              className="flex items-center justify-center gap-2"
            >
              <FaFileImage />
              View All Requests
            </Button>
            <Button
              onClick={() => setActiveTab('requests')}
              variant="secondary"
              className="flex items-center justify-center gap-2"
            >
              <FaClock />
              Pending Requests
            </Button>
            <Button
              onClick={() => setActiveTab('settings')}
              variant="secondary"
              className="flex items-center justify-center gap-2"
            >
              <FaCog />
              Center Settings
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // Render content based on active tab
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )
    }

    switch (activeTab) {
      case 'overview':
        return renderOverview()
      case 'requests':
        return <RadiologyRequests radiologyData={radiologyData} onStatsUpdate={fetchDashboardStats} />
      case 'settings':
        return <RadiologySettings radiologyData={radiologyData} onUpdate={fetchRadiologyData} />
      default:
        return renderOverview()
    }
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Navbar 
        showDashboardInfo={true} 
        dashboardTitle="Radiology Center Dashboard"
        userRole="RadiologyCenter"
      />
      
      <div className="flex">
        <RadiologySidebar 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={handleLogout}
          radiologyData={radiologyData}
        />
        
        <main className="flex-1 p-6 ml-64">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {activeTab === 'overview' && 'Dashboard Overview'}
                {activeTab === 'requests' && 'Radiology Requests'}
                {activeTab === 'settings' && 'Center Settings'}
              </h1>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {activeTab === 'overview' && 'Welcome to your radiology center dashboard'}
                {activeTab === 'requests' && 'Manage all radiology imaging requests'}
                {activeTab === 'settings' && 'Configure your center information and preferences'}
              </p>
            </div>

            {/* Content */}
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  )
}

export default RadiologyDashboard
