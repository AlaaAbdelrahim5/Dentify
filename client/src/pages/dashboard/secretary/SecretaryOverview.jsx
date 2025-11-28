import { useState, useEffect } from 'react'
import { 
  FaCalendarAlt,
  FaUsers,
  FaClock,
  FaCheckCircle,
  FaUserMd,
  FaPlus,
  FaFilter,
  FaPhone,
  FaEnvelope
} from 'react-icons/fa'
import { Card, Button } from '../../../components'
import { useTheme } from '../../../contexts/ThemeContext'
import { authUtils } from '../../../utils/auth'

const SecretaryOverview = ({ userData, stats, onTabChange }) => {
  const { isDarkMode } = useTheme()
  const [todayAppointments, setTodayAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch today's appointments
  useEffect(() => {
    fetchTodayAppointments()
  }, [])

  const fetchTodayAppointments = async () => {
    try {
      setLoading(true)
      const token = authUtils.getAccessToken()
      
      // Get today's date range
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const response = await fetch('http://localhost:5000/api/appointments/clinic', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        const appointments = data.appointments || []
        
        // Filter today's appointments
        const todayAppts = appointments.filter(apt => {
          const aptDate = new Date(apt.date)
          return aptDate.toDateString() === today.toDateString()
        })
        
        setTodayAppointments(todayAppts)
      }
    } catch (error) {
      console.error('Error fetching today appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  // Get stats with defaults
  const secretaryStats = {
    todayAppointments: todayAppointments.length || 0,
    pendingAppointments: todayAppointments.filter(a => a.status === 'scheduled').length || 0,
    confirmedAppointments: todayAppointments.filter(a => a.status === 'confirmed').length || 0,
    totalPatients: stats?.totalPatients || 0,
    totalDentists: stats?.totalDentists || 0
  }

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A'
    try {
      const [hours, minutes] = timeString.split(':')
      const hour = parseInt(hours)
      const ampm = hour >= 12 ? 'PM' : 'AM'
      const displayHour = hour % 12 || 12
      return `${displayHour}:${minutes} ${ampm}`
    } catch (error) {
      return timeString
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      scheduled: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    }
    
    const darkStyles = {
      scheduled: 'bg-yellow-900/30 text-yellow-400 border-yellow-700/30',
      confirmed: 'bg-blue-900/30 text-blue-400 border-blue-700/30',
      completed: 'bg-green-900/30 text-green-400 border-green-700/30',
      cancelled: 'bg-red-900/30 text-red-400 border-red-700/30'
    }

    return isDarkMode ? darkStyles[status] || darkStyles.scheduled : styles[status] || styles.scheduled
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
            Welcome, {userData?.firstName || 'Secretary'}!
          </h2>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {userData?.clinic?.clinicName || 'Clinic'} • {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => onTabChange?.('appointments')}
          >
            <FaFilter className="w-4 h-4" />
            View All
          </Button>
          <Button
            variant="primary"
            className="flex items-center gap-2"
            onClick={() => onTabChange?.('appointments')}
          >
            <FaPlus className="w-4 h-4" />
            New Appointment
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
              <p className={`text-sm font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>Today's Appointments</p>
              <p className={`text-3xl font-bold ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>{secretaryStats.todayAppointments}</p>
            </div>
            <FaCalendarAlt className={`w-8 h-8 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          </div>
        </Card>

        <Card className={`p-6 border ${isDarkMode 
          ? 'bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 border-yellow-700/30' 
          : 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>Pending</p>
              <p className={`text-3xl font-bold ${isDarkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>{secretaryStats.pendingAppointments}</p>
            </div>
            <FaClock className={`w-8 h-8 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
          </div>
        </Card>

        <Card className={`p-6 border ${isDarkMode 
          ? 'bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-700/30' 
          : 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>Confirmed</p>
              <p className={`text-3xl font-bold ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>{secretaryStats.confirmedAppointments}</p>
            </div>
            <FaCheckCircle className={`w-8 h-8 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
          </div>
        </Card>

        <Card className={`p-6 border ${isDarkMode 
          ? 'bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-700/30' 
          : 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>Total Patients</p>
              <p className={`text-3xl font-bold ${isDarkMode ? 'text-purple-300' : 'text-purple-800'}`}>{secretaryStats.totalPatients}</p>
            </div>
            <FaUsers className={`w-8 h-8 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
          </div>
        </Card>

        <Card className={`p-6 border ${isDarkMode 
          ? 'bg-gradient-to-br from-teal-900/20 to-teal-800/20 border-teal-700/30' 
          : 'bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`}>Dentists</p>
              <p className={`text-3xl font-bold ${isDarkMode ? 'text-teal-300' : 'text-teal-800'}`}>{secretaryStats.totalDentists}</p>
            </div>
            <FaUserMd className={`w-8 h-8 ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`} />
          </div>
        </Card>
      </div>

      {/* Today's Schedule */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
            Today's Schedule
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onTabChange?.('appointments')}
          >
            View All
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
            <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading appointments...</p>
          </div>
        ) : todayAppointments.length === 0 ? (
          <div className="text-center py-8">
            <FaCalendarAlt className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>No appointments scheduled for today</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayAppointments.slice(0, 5).map((appointment) => (
              <div
                key={appointment.id}
                className={`p-4 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800' 
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                } transition-colors cursor-pointer`}
                onClick={() => onTabChange?.('appointments')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`p-3 rounded-lg ${
                      isDarkMode ? 'bg-teal-900/30' : 'bg-teal-100'
                    }`}>
                      <FaClock className={`w-5 h-5 ${
                        isDarkMode ? 'text-teal-400' : 'text-teal-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                          {appointment.patient?.firstName} {appointment.patient?.lastName}
                        </p>
                        <span className={`px-2 py-1 text-xs rounded-full border ${getStatusBadge(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        with Dr. {appointment.dentist?.firstName} {appointment.dentist?.lastName}
                      </p>
                      {appointment.patient?.user?.phone && (
                        <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} flex items-center gap-1 mt-1`}>
                          <FaPhone className="w-3 h-3" />
                          {appointment.patient.user.phone}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`}>
                      {formatTime(appointment.time)}
                    </p>
                    {appointment.reason && (
                      <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                        {appointment.reason}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
          isDarkMode ? 'hover:bg-gray-800/70' : 'hover:bg-gray-50'
        }`} onClick={() => onTabChange?.('appointments')}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
              <FaCalendarAlt className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <div>
              <h4 className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                Manage Appointments
              </h4>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Schedule & view appointments
              </p>
            </div>
          </div>
        </Card>

        <Card className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
          isDarkMode ? 'hover:bg-gray-800/70' : 'hover:bg-gray-50'
        }`} onClick={() => onTabChange?.('patients')}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
              <FaUsers className={`w-6 h-6 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
            </div>
            <div>
              <h4 className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                Patient Records
              </h4>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                View & manage patients
              </p>
            </div>
          </div>
        </Card>

        <Card className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
          isDarkMode ? 'hover:bg-gray-800/70' : 'hover:bg-gray-50'
        }`} onClick={() => onTabChange?.('dentists')}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${isDarkMode ? 'bg-teal-900/30' : 'bg-teal-100'}`}>
              <FaUserMd className={`w-6 h-6 ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`} />
            </div>
            <div>
              <h4 className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                Dentists Schedule
              </h4>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                View dentist availability
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default SecretaryOverview
