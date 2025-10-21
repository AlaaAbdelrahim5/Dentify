import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  FaCalendarAlt, 
  FaTooth, 
  FaXRay, 
  FaUserMd, 
  FaClock, 
  FaCheckCircle,
  FaExclamationTriangle,
  FaSearch,
  FaFilter,
  FaPlus
} from 'react-icons/fa'
import { 
  Navbar, 
  Card, 
  Button, 
  Input, 
  LoadingSpinner,
  StatsOverview,
  PageHeader,
  DataTable,
  StatusBadge
} from '../../components'
import { authUtils } from '../../utils/auth'
import { authAPI } from '../../services/api'
import { useTheme } from '../../contexts/ThemeContext'
import PatientSidebar from '../../components/patient/PatientSidebar'
import PatientAppointments from './patient/PatientAppointments'

const PatientDashboard = () => {
  const navigate = useNavigate()
  const { isDarkMode } = useTheme()
  const [activeTab, setActiveTab] = useState('overview')
  const [currentUser, setCurrentUser] = useState(null)
  const [patientProfile, setPatientProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Check authentication and fetch user data from backend
  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Check if user is authenticated
        const isAuthenticated = await authUtils.isAuthenticated()
        
        if (!isAuthenticated) {
          console.log('PatientDashboard: User not authenticated, redirecting to login')
          navigate('/login', { replace: true })
          return
        }
        
        // Get user from storage first (for immediate display)
        const user = authUtils.getCurrentUser()
        console.log('PatientDashboard: User from storage:', user)
        
        // Check if user should be redirected to a different dashboard
        if (user && user.role !== 'Patient') {
          console.log('PatientDashboard: User is not a patient, redirecting to correct dashboard')
          const dashboardRoute = authUtils.getDashboardRoute()
          if (dashboardRoute !== '/patient/dashboard') {
            navigate(dashboardRoute, { replace: true })
            return
          }
        }
        
        setCurrentUser(user)

        // Fetch fresh user data from backend
        try {
          console.log('PatientDashboard: Fetching fresh user data from backend...')
          const response = await authAPI.getCurrentUser()
          console.log('PatientDashboard: Backend response:', response)
          
          if (response && response.user) {
            const freshUser = response.user
            setCurrentUser(freshUser)
            
            // Extract patient profile
            if (freshUser.patient) {
              setPatientProfile(freshUser.patient)
              console.log('PatientDashboard: Patient profile loaded:', freshUser.patient)
            }
            
            // Update stored user data
            const remember = authUtils.shouldRemember()
            authUtils.setUser(freshUser, remember)
          }
        } catch (apiError) {
          console.error('PatientDashboard: Failed to fetch fresh user data:', apiError)
          // Continue with cached user data if API fails
          if (user && user.patient) {
            setPatientProfile(user.patient)
          }
        }

      } catch (error) {
        console.error('PatientDashboard: Error during initialization:', error)
        setError('Failed to load dashboard data')
      } finally {
        setIsLoading(false)
      }
    }

    initializeDashboard()
  }, [navigate])

  const handleLogout = async () => {
    try {
      console.log('PatientDashboard: Starting logout process')
      authUtils.logout()
      console.log('PatientDashboard: Logout completed, navigating to login page')
      navigate('/login', { replace: true })
    } catch (error) {
      console.error('PatientDashboard: Error during logout:', error)
      navigate('/login', { replace: true })
    }
  }

  // Get user's full name
  const getUserFullName = () => {
    if (patientProfile) {
      return `${patientProfile.firstName} ${patientProfile.lastName}`
    }
    if (currentUser?.patient) {
      return `${currentUser.patient.firstName} ${currentUser.patient.lastName}`
    }
    return authUtils.getUserName()
  }

  // Get user's first name
  const getUserFirstName = () => {
    if (patientProfile?.firstName) {
      return patientProfile.firstName
    }
    if (currentUser?.patient?.firstName) {
      return currentUser.patient.firstName
    }
    const fullName = authUtils.getUserName()
    return fullName.split(' ')[0]
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-900 to-gray-800'
          : 'bg-gradient-to-br from-teal-50 to-blue-50'
      }`}>
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className={`mt-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Loading your dashboard...
          </p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-900 to-gray-800'
          : 'bg-gradient-to-br from-teal-50 to-blue-50'
      }`}>
        <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <Card.Content className="p-8 text-center">
            <FaExclamationTriangle className={`mx-auto text-4xl mb-4 ${
              isDarkMode ? 'text-red-400' : 'text-red-600'
            }`} />
            <h2 className={`text-xl font-bold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Error Loading Dashboard</h2>
            <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {error}
            </p>
            <Button onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </Card.Content>
        </Card>
      </div>
    )
  }

  // Sample data
  const upcomingAppointments = [
    {
      id: 1,
      dentist: "Dr. Sarah Johnson",
      date: "2025-01-05",
      time: "10:00 AM",
      service: "Teeth Cleaning",
      status: "confirmed",
      clinic: "Dental Care Center"
    },
    {
      id: 2,
      dentist: "Dr. Michael Smith",
      date: "2025-01-15",
      time: "2:30 PM", 
      service: "Root Canal",
      status: "pending",
      clinic: "Advanced Dental Clinic"
    }
  ]

  const pastAppointments = [
    {
      id: 3,
      dentist: "Dr. Sarah Johnson", 
      date: "2024-12-20",
      time: "11:00 AM",
      service: "Dental Checkup",
      status: "completed",
      clinic: "Dental Care Center"
    }
  ]

  const xrayResults = [
    {
      id: 1,
      date: "2024-12-20",
      type: "Panoramic X-ray",
      dentist: "Dr. Sarah Johnson",
      status: "available",
      result: "Normal - No issues detected"
    }
  ]

  const stats = [
    { 
      label: "Upcoming Appointments", 
      value: upcomingAppointments.length, 
      icon: FaCalendarAlt, 
      gradient: "from-blue-600 to-blue-400"
    },
    { 
      label: "Total Visits", 
      value: "12", 
      icon: FaTooth, 
      gradient: "from-teal-600 to-cyan-600"
    },
    { 
      label: "X-ray Results", 
      value: xrayResults.length, 
      icon: FaXRay, 
      gradient: "from-purple-600 to-pink-600"
    },
    { 
      label: "Active Treatments", 
      value: "2", 
      icon: FaUserMd, 
      gradient: "from-green-600 to-emerald-600"
    }
  ]

  const getStatusBadge = (status) => {
    const statusMap = {
      confirmed: { label: 'Confirmed', color: 'green' },
      pending: { label: 'Pending', color: 'yellow' },
      completed: { label: 'Completed', color: 'blue' },
      cancelled: { label: 'Cancelled', color: 'red' }
    }
    return statusMap[status] || { label: status, color: 'gray' }
  }

  // Render Overview Tab
  const renderOverview = () => (
    <div className="space-y-8">
      {/* Welcome Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-bold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Welcome back, {getUserFirstName()}!
            </h1>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
              {getUserFullName()}
              {currentUser?.email && <span> • {currentUser.email}</span>}
            </p>
            {patientProfile?.city && (
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                📍 {patientProfile.city}
              </p>
            )}
          </div>
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
            isDarkMode 
              ? 'bg-gradient-to-br from-teal-600 to-cyan-600' 
              : 'bg-gradient-to-br from-teal-500 to-cyan-500'
          }`}>
            <FaTooth className="w-8 h-8 text-white" />
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <StatsOverview stats={stats} />

      {/* Upcoming Appointments Preview */}
      {upcomingAppointments.length > 0 && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-lg font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Next Appointments</h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setActiveTab('appointments')}
            >
              View All
            </Button>
          </div>
          <div className="space-y-4">
            {upcomingAppointments.slice(0, 2).map((appointment) => (
              <div 
                key={appointment.id}
                className={`p-4 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-800/50 border-gray-700' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className={`font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{appointment.service}</h4>
                  <StatusBadge 
                    status={appointment.status}
                    label={getStatusBadge(appointment.status).label}
                  />
                </div>
                <div className={`text-sm space-y-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  <p className="flex items-center">
                    <FaUserMd className="mr-2" />
                    {appointment.dentist}
                  </p>
                  <p className="flex items-center">
                    <FaCalendarAlt className="mr-2" />
                    {appointment.date} at {appointment.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )

  // Render X-rays Tab
  const renderXrays = () => {
    const xrayColumns = [
      { key: 'type', label: 'X-ray Type' },
      { key: 'date', label: 'Date' },
      { key: 'dentist', label: 'Dentist' },
      { key: 'result', label: 'Result' },
      { key: 'status', label: 'Status' },
      { key: 'actions', label: 'Actions', className: 'text-right' }
    ]

    const renderXrayRow = (xray, index) => (
      <tr 
        key={xray.id}
        className={`transition-colors duration-150 ${
          isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
        }`}
      >
        <td className="px-6 py-4">
          <span className={`font-medium ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>{xray.type}</span>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center">
            <FaCalendarAlt className={`mr-2 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
              {xray.date}
            </span>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center">
            <FaUserMd className={`mr-2 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
              {xray.dentist}
            </span>
          </div>
        </td>
        <td className="px-6 py-4">
          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
            {xray.result}
          </span>
        </td>
        <td className="px-6 py-4">
          <StatusBadge 
            status="active"
            label="Available"
          />
        </td>
        <td className="px-6 py-4 text-right">
          <div className="flex justify-end space-x-2">
            <Button variant="outline" size="sm">View Image</Button>
            <Button variant="ghost" size="sm">Download</Button>
          </div>
        </td>
      </tr>
    )

    return (
      <div className="space-y-6">
        <PageHeader
          title="X-ray Results"
          description="View and download your X-ray images"
          actions={
            <Input
              placeholder="Search X-rays..."
              icon={FaSearch}
              className="w-64"
            />
          }
        />

        <DataTable
          columns={xrayColumns}
          data={xrayResults}
          renderRow={renderXrayRow}
          emptyMessage="No X-ray results available yet"
          emptyIcon={FaXRay}
          emptyTitle="No X-rays"
        />
      </div>
    )
  }

  // Render Medical History Tab
  const renderHistory = () => (
    <div className="space-y-6">
      <PageHeader
        title="Medical History"
        description="Your complete dental treatment timeline"
      />
      
      <Card className="p-8">
        <div className="text-center py-12">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${
            isDarkMode 
              ? 'bg-gradient-to-br from-gray-700 to-gray-800' 
              : 'bg-gradient-to-br from-gray-100 to-gray-200'
          }`}>
            <FaTooth className={`w-10 h-10 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`} />
          </div>
          <h3 className={`text-xl font-bold mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>Treatment History</h3>
          <p className={`text-sm max-w-md mx-auto ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Your complete treatment history and medical records will appear here
          </p>
        </div>
      </Card>
    </div>
  )

  // Render Settings Tab
  const renderSettings = () => (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account settings and preferences"
      />
      
      <Card className="p-8">
        <div className="text-center py-12">
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
            Settings page coming soon
          </p>
        </div>
      </Card>
    </div>
  )

  // Tab content renderer
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview()
      case 'appointments':
        return <PatientAppointments />
      case 'xrays':
        return renderXrays()
      case 'history':
        return renderHistory()
      case 'settings':
        return renderSettings()
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
        <LoadingSpinner size="lg" />
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
      <Navbar showDashboardInfo={true} dashboardTitle="Patient Dashboard" />

      {/* Fixed Sidebar */}
      <PatientSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
      />

      {/* Main Content with left margin to account for fixed sidebar */}
      <div className="ml-72 pt-20">
        <div className="p-8">
          {renderTabContent()}
        </div>
      </div>
    </div>
  )
}

export default PatientDashboard
