import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { 
  FaCalendarAlt, 
  FaTooth, 
  FaXRay, 
  FaUserMd, 
  FaClock, 
  FaCheckCircle,
  FaExclamationTriangle,
  FaBell,
  FaSearch,
  FaFilter,
  FaSignOutAlt
} from 'react-icons/fa'
import { MdDashboard } from 'react-icons/md'
import { Navbar, Card, Button, Input, LoadingSpinner } from '../../components'
import { authUtils } from '../../utils/auth'
import { authAPI } from '../../services/api'
import { useTheme } from '../../contexts/ThemeContext'

const PatientDashboard = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isDarkMode } = useTheme()
  const [activeTab, setActiveTab] = useState('appointments')
  const [currentUser, setCurrentUser] = useState(null)
  const [patientProfile, setPatientProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

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
    { label: "Upcoming Appointments", value: upcomingAppointments.length, icon: FaCalendarAlt, color: "text-blue-600" },
    { label: "Total Visits", value: "12", icon: FaTooth, color: "text-teal-600" },
    { label: "X-ray Results", value: xrayResults.length, icon: FaXRay, color: "text-purple-600" },
    { label: "Active Treatments", value: "2", icon: FaUserMd, color: "text-green-600" }
  ]

  const getStatusBadge = (status) => {
    const badges = {
      confirmed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      completed: "bg-blue-100 text-blue-800",
      cancelled: "bg-red-100 text-red-800"
    }
    return badges[status] || "bg-gray-100 text-gray-800"
  }

  const getStatusIcon = (status) => {
    const icons = {
      confirmed: FaCheckCircle,
      pending: FaClock,
      completed: FaCheckCircle,
      cancelled: FaExclamationTriangle
    }
    return icons[status] || FaClock
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 to-gray-800'
        : 'bg-gradient-to-br from-teal-50 to-blue-50'
    }`}>
      {/* Unified Header */}
      <Navbar showDashboardInfo={true} dashboardTitle="Patient Dashboard" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Welcome back, {getUserFirstName()}!
          </h1>
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
            Here's an overview of your dental care journey.
          </p>
          {/* Show user info */}
          {patientProfile && (
            <div className={`mt-3 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <span className="font-medium">{getUserFullName()}</span>
              {currentUser?.email && <span> • {currentUser.email}</span>}
              {currentUser?.phone && <span> • {currentUser.phone}</span>}
              {patientProfile.city && <span> • {patientProfile.city}</span>}
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className={`hover:shadow-lg transition-shadow duration-200 ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'
            }`}>
              <Card.Content className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>{stat.label}</p>
                    <p className={`text-2xl font-bold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <stat.icon className={`text-xl ${stat.color}`} />
                  </div>
                </div>
              </Card.Content>
            </Card>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className={`border-b ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'appointments', label: 'Appointments', icon: FaCalendarAlt },
                { id: 'xrays', label: 'X-ray Results', icon: FaXRay },
                { id: 'history', label: 'Medical History', icon: FaTooth }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                    ${activeTab === tab.id
                      ? 'border-teal-500 text-teal-600'
                      : `border-transparent ${
                          isDarkMode 
                            ? 'text-gray-400 hover:text-gray-300 hover:border-gray-600' 
                            : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`
                    }
                  `}
                >
                  <tab.icon className="text-sm" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="space-y-6">
          {activeTab === 'appointments' && (
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <h2 className={`text-xl font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Your Appointments</h2>
                <div className="flex gap-3">
                  <Input
                    placeholder="Search appointments..."
                    icon={FaSearch}
                    className="w-64"
                  />
                  <Button variant="outline" className="flex items-center gap-2">
                    <FaFilter />
                    Filter
                  </Button>
                  <Button className="flex items-center gap-2">
                    <FaCalendarAlt />
                    Book New
                  </Button>
                </div>
              </div>

              {/* Upcoming Appointments */}
              <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                <Card.Header>
                  <h3 className={`text-lg font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Upcoming Appointments</h3>
                </Card.Header>
                <Card.Content className="p-0">
                  {upcomingAppointments.length > 0 ? (
                    <div className={`divide-y ${
                      isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
                    }`}>
                      {upcomingAppointments.map((appointment) => {
                        const StatusIcon = getStatusIcon(appointment.status)
                        return (
                          <div key={appointment.id} className={`p-6 transition-colors duration-200 ${
                            isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                          }`}>
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <h4 className={`font-medium ${
                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                  }`}>{appointment.service}</h4>
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(appointment.status)}`}>
                                    <StatusIcon className="mr-1" />
                                    {appointment.status}
                                  </span>
                                </div>
                                <div className={`grid grid-cols-1 md:grid-cols-3 gap-2 text-sm ${
                                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                  <div className="flex items-center">
                                    <FaUserMd className="mr-2" />
                                    {appointment.dentist}
                                  </div>
                                  <div className="flex items-center">
                                    <FaCalendarAlt className="mr-2" />
                                    {appointment.date} at {appointment.time}
                                  </div>
                                  <div className="flex items-center">
                                    <FaTooth className="mr-2" />
                                    {appointment.clinic}
                                  </div>
                                </div>
                              </div>
                              <div className="flex space-x-2 ml-4">
                                <Button variant="outline" size="sm">Reschedule</Button>
                                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">Cancel</Button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <FaCalendarAlt className={`mx-auto text-4xl mb-4 ${
                        isDarkMode ? 'text-gray-600' : 'text-gray-300'
                      }`} />
                      <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                        No upcoming appointments
                      </p>
                    </div>
                  )}
                </Card.Content>
              </Card>

              {/* Past Appointments */}
              <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                <Card.Header>
                  <h3 className={`text-lg font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Recent Appointments</h3>
                </Card.Header>
                <Card.Content className="p-0">
                  {pastAppointments.length > 0 ? (
                    <div className={`divide-y ${
                      isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
                    }`}>
                      {pastAppointments.map((appointment) => (
                        <div key={appointment.id} className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h4 className={`font-medium ${
                                  isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}>{appointment.service}</h4>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  <FaCheckCircle className="mr-1" />
                                  Completed
                                </span>
                              </div>
                              <div className={`grid grid-cols-1 md:grid-cols-3 gap-2 text-sm ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                <div className="flex items-center">
                                  <FaUserMd className="mr-2" />
                                  {appointment.dentist}
                                </div>
                                <div className="flex items-center">
                                  <FaCalendarAlt className="mr-2" />
                                  {appointment.date} at {appointment.time}
                                </div>
                                <div className="flex items-center">
                                  <FaTooth className="mr-2" />
                                  {appointment.clinic}
                                </div>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">View Details</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <FaCalendarAlt className={`mx-auto text-4xl mb-4 ${
                        isDarkMode ? 'text-gray-600' : 'text-gray-300'
                      }`} />
                      <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                        No past appointments
                      </p>
                    </div>
                  )}
                </Card.Content>
              </Card>
            </div>
          )}

          {activeTab === 'xrays' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className={`text-xl font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>X-ray Results</h2>
                <Input
                  placeholder="Search X-rays..."
                  icon={FaSearch}
                  className="w-64"
                />
              </div>

              <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                <Card.Content className="p-0">
                  {xrayResults.length > 0 ? (
                    <div className={`divide-y ${
                      isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
                    }`}>
                      {xrayResults.map((xray) => (
                        <div key={xray.id} className={`p-6 transition-colors duration-200 ${
                          isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h4 className={`font-medium ${
                                  isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}>{xray.type}</h4>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Available
                                </span>
                              </div>
                              <div className={`grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-2 ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                <div className="flex items-center">
                                  <FaCalendarAlt className="mr-2" />
                                  {xray.date}
                                </div>
                                <div className="flex items-center">
                                  <FaUserMd className="mr-2" />
                                  {xray.dentist}
                                </div>
                              </div>
                              <p className={`text-sm ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>{xray.result}</p>
                            </div>
                            <div className="flex space-x-2 ml-4">
                              <Button variant="outline" size="sm">View Image</Button>
                              <Button variant="outline" size="sm">Download</Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <FaXRay className={`mx-auto text-4xl mb-4 ${
                        isDarkMode ? 'text-gray-600' : 'text-gray-300'
                      }`} />
                      <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                        No X-ray results available
                      </p>
                    </div>
                  )}
                </Card.Content>
              </Card>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              <h2 className={`text-xl font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Medical History</h2>
              
              <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                <Card.Header>
                  <h3 className={`text-lg font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Treatment Timeline</h3>
                </Card.Header>
                <Card.Content>
                  <div className="text-center py-8">
                    <FaTooth className={`mx-auto text-4xl mb-4 ${
                      isDarkMode ? 'text-gray-600' : 'text-gray-300'
                    }`} />
                    <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                      Your treatment history will appear here
                    </p>
                  </div>
                </Card.Content>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PatientDashboard