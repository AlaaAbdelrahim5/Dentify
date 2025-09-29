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
import { Logo, Card, Button, Input } from '../../components'
import { authUtils } from '../../utils/auth'

const PatientDashboard = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState('appointments')
  const [currentUser, setCurrentUser] = useState(null)
  const [welcomeMessage, setWelcomeMessage] = useState('')

  // Check authentication and get user data
  useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = await authUtils.isAuthenticated()
      
      if (!isAuthenticated) {
        // If not authenticated, redirect to login
        navigate('/login', { replace: true })
        return
      }
      
      const user = authUtils.getCurrentUser()
      setCurrentUser(user)

      // Check for welcome message from login
      if (location.state?.message) {
        setWelcomeMessage(location.state.message)
        // Clear the message after 5 seconds
        setTimeout(() => setWelcomeMessage(''), 5000)
      }
    }

    checkAuth()
  }, [navigate, location.state])

  const handleLogout = () => {
    authUtils.logout()
    navigate('/login', { replace: true })
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
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      {/* Welcome Message */}
      {welcomeMessage && (
        <div className="bg-green-50 border-b border-green-200 px-4 py-3">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <FaCheckCircle className="text-green-600" />
              <p className="text-green-800 font-medium">{welcomeMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Logo size="text-xl" />
              <div className="hidden md:flex items-center space-x-2">
                <MdDashboard className="text-gray-400" />
                <span className="text-gray-600 text-sm">Patient Dashboard</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <FaBell className="text-gray-400 hover:text-teal-600 cursor-pointer" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">2</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {currentUser ? authUtils.getUserInitials() : 'U'}
                  </span>
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700">
                  {currentUser ? authUtils.getUserName() : 'User'}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-red-600"
                  title="Logout"
                >
                  <FaSignOutAlt />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {currentUser ? currentUser.fullName.split(' ')[0] : 'User'}!
          </h1>
          <p className="text-gray-600">Here's an overview of your dental care journey.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
              <Card.Content className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg bg-gray-50`}>
                    <stat.icon className={`text-xl ${stat.color}`} />
                  </div>
                </div>
              </Card.Content>
            </Card>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
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
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
                <h2 className="text-xl font-semibold text-gray-900">Your Appointments</h2>
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
              <Card>
                <Card.Header>
                  <h3 className="text-lg font-medium text-gray-900">Upcoming Appointments</h3>
                </Card.Header>
                <Card.Content className="p-0">
                  {upcomingAppointments.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                      {upcomingAppointments.map((appointment) => {
                        const StatusIcon = getStatusIcon(appointment.status)
                        return (
                          <div key={appointment.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <h4 className="font-medium text-gray-900">{appointment.service}</h4>
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(appointment.status)}`}>
                                    <StatusIcon className="mr-1" />
                                    {appointment.status}
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
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
                      <FaCalendarAlt className="mx-auto text-4xl text-gray-300 mb-4" />
                      <p className="text-gray-500">No upcoming appointments</p>
                    </div>
                  )}
                </Card.Content>
              </Card>

              {/* Past Appointments */}
              <Card>
                <Card.Header>
                  <h3 className="text-lg font-medium text-gray-900">Recent Appointments</h3>
                </Card.Header>
                <Card.Content className="p-0">
                  {pastAppointments.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                      {pastAppointments.map((appointment) => (
                        <div key={appointment.id} className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h4 className="font-medium text-gray-900">{appointment.service}</h4>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  <FaCheckCircle className="mr-1" />
                                  Completed
                                </span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
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
                      <FaCalendarAlt className="mx-auto text-4xl text-gray-300 mb-4" />
                      <p className="text-gray-500">No past appointments</p>
                    </div>
                  )}
                </Card.Content>
              </Card>
            </div>
          )}

          {activeTab === 'xrays' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">X-ray Results</h2>
                <Input
                  placeholder="Search X-rays..."
                  icon={FaSearch}
                  className="w-64"
                />
              </div>

              <Card>
                <Card.Content className="p-0">
                  {xrayResults.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                      {xrayResults.map((xray) => (
                        <div key={xray.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h4 className="font-medium text-gray-900">{xray.type}</h4>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Available
                                </span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
                                <div className="flex items-center">
                                  <FaCalendarAlt className="mr-2" />
                                  {xray.date}
                                </div>
                                <div className="flex items-center">
                                  <FaUserMd className="mr-2" />
                                  {xray.dentist}
                                </div>
                              </div>
                              <p className="text-sm text-gray-700">{xray.result}</p>
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
                      <FaXRay className="mx-auto text-4xl text-gray-300 mb-4" />
                      <p className="text-gray-500">No X-ray results available</p>
                    </div>
                  )}
                </Card.Content>
              </Card>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Medical History</h2>
              
              <Card>
                <Card.Header>
                  <h3 className="text-lg font-medium text-gray-900">Treatment Timeline</h3>
                </Card.Header>
                <Card.Content>
                  <div className="text-center py-8">
                    <FaTooth className="mx-auto text-4xl text-gray-300 mb-4" />
                    <p className="text-gray-500">Your treatment history will appear here</p>
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