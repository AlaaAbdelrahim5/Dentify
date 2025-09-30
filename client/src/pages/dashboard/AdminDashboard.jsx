import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { 
  FaHospital,
  FaUserMd, 
  FaXRay, 
  FaUsers,
  FaCalendarAlt,
  FaBell,
  FaSearch,
  FaFilter,
  FaSignOutAlt,
  FaPlus,
  FaChartBar,
  FaCog
} from 'react-icons/fa'
import { MdDashboard, MdPendingActions } from 'react-icons/md'
import { Logo, Card, Button, Input } from '../../components'
import { authUtils } from '../../utils/auth'
import ClinicsManagement from './admin/ClinicsManagement'
import RadiologyManagement from './admin/RadiologyManagement'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState('overview')
  const [currentUser, setCurrentUser] = useState(null)
  const [welcomeMessage, setWelcomeMessage] = useState('')
  const [stats, setStats] = useState({
    totalClinics: 0,
    pendingDentists: 0,
    radiologyCenters: 0,
    totalPatients: 0
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
      
      // Check if user is admin
      if (!user || user.role !== 'Admin') {
        navigate('/dashboard', { replace: true })
        return
      }
      
      setCurrentUser(user)

      if (location.state?.message) {
        setWelcomeMessage(location.state.message)
        setTimeout(() => setWelcomeMessage(''), 5000)
      }
    }

    checkAuth()
  }, [navigate, location.state])

  // Handle logout
  const handleLogout = async () => {
    await authUtils.logout()
    navigate('/login', { replace: true })
  }

  // Mock data - Replace with actual API calls later
  useEffect(() => {
    // Simulate loading stats
    setStats({
      totalClinics: 12,
      pendingDentists: 5,
      radiologyCenters: 8,
      totalPatients: 245
    })
  }, [])

  const sidebarItems = [
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
      description: 'Review and approve dentist registrations',
      badge: stats.pendingDentists > 0 ? stats.pendingDentists : null
    },
    { 
      id: 'radiology', 
      label: 'Radiology Centers', 
      icon: FaXRay,
      description: 'Manage radiology centers'
    },
    { 
      id: 'analytics', 
      label: 'Analytics', 
      icon: FaChartBar,
      description: 'System analytics and reports'
    }
  ]

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">System Overview</h2>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex items-center gap-2"
          >
            <FaFilter className="w-4 h-4" />
            Filter
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
          >
            <FaSearch className="w-4 h-4" />
            Search
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Clinics</p>
              <p className="text-3xl font-bold text-blue-800">{stats.totalClinics}</p>
            </div>
            <FaHospital className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 text-sm font-medium">Pending Dentists</p>
              <p className="text-3xl font-bold text-yellow-800">{stats.pendingDentists}</p>
            </div>
            <MdPendingActions className="w-8 h-8 text-yellow-600" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Radiology Centers</p>
              <p className="text-3xl font-bold text-green-800">{stats.radiologyCenters}</p>
            </div>
            <FaXRay className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Total Patients</p>
              <p className="text-3xl font-bold text-purple-800">{stats.totalPatients}</p>
            </div>
            <FaUsers className="w-8 h-8 text-purple-600" />
          </div>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activities</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">New clinic registered: "Smile Dental Center"</p>
              <p className="text-xs text-gray-500">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">Dentist approval pending: Dr. Ahmad Salem</p>
              <p className="text-xs text-gray-500">4 hours ago</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">New radiology center added: "Advanced Imaging"</p>
              <p className="text-xs text-gray-500">1 day ago</p>
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
      case 'clinics':
        return <ClinicsManagement />
      case 'dentists':
        return (
          <div className="text-center py-12">
            <FaUserMd className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Dentist Approvals</h3>
            <p className="text-gray-500 mb-6">This section will be implemented next</p>
            <Button variant="primary">Coming Soon</Button>
          </div>
        )
      case 'radiology':
        return <RadiologyManagement />
      case 'analytics':
        return (
          <div className="text-center py-12">
            <FaChartBar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Analytics & Reports</h3>
            <p className="text-gray-500 mb-6">This section will be implemented next</p>
            <Button variant="primary">Coming Soon</Button>
          </div>
        )
      default:
        return renderOverview()
    }
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      {/* Welcome Message */}
      {welcomeMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fadeInUp">
          <div className="flex items-center gap-2">
            <FaBell className="w-4 h-4" />
            <span>{welcomeMessage}</span>
          </div>
        </div>
      )}

      <div className="flex">
        {/* Sidebar */}
        <div className="w-80 bg-white shadow-xl min-h-screen">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <Logo size="text-xl" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-semibold">
                {currentUser.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{currentUser.name || 'Admin'}</h3>
                <p className="text-sm text-gray-500">System Administrator</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4">
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
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <div className="flex-1">
                      <div className="font-medium">{item.label}</div>
                    </div>
                    {item.badge && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </nav>

          {/* Logout Button */}
          <div className="p-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 text-left"
            >
              <FaSignOutAlt className="w-5 h-5 text-red-600" />
              <div className="flex-1">
                <div className="font-medium">Logout</div>
              </div>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {renderTabContent()}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard