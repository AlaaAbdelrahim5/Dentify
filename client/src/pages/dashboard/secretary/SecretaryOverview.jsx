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
import { Card, Button, StatsOverview, LoadingSpinner, StatusBadge } from '../../../components'
import { useTheme } from '../../../contexts/ThemeContext'
import { appointmentsAPI, patientsAPI, dentistsAPI } from '../../../services/api'

const SecretaryOverview = ({ userData, stats: propStats, onTabChange }) => {
  const { isDarkMode } = useTheme()
  const [todayAppointments, setTodayAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDentists: 0
  })

  // Fetch all data
  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      
      // Get today's date range
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      // Fetch appointments and dentists using API methods
      const [appointmentsRes, dentistsRes] = await Promise.allSettled([
        appointmentsAPI.getClinicAppointments(),
        dentistsAPI.getForClinic()
      ])

      // Parse appointments - backend returns { appointments: [...] }
      let appointments = []
      if (appointmentsRes.status === 'fulfilled') {
        appointments = appointmentsRes.value?.appointments || []
      }
      
      // Filter today's appointments using startTime
      const todayAppts = appointments.filter(apt => {
        const aptDate = new Date(apt.startTime)
        aptDate.setHours(0, 0, 0, 0)
        return aptDate.getTime() === today.getTime()
      })
      
      setTodayAppointments(todayAppts)

      // Calculate unique patients from appointments (clinic-specific)
      const uniquePatientIds = new Set()
      appointments.forEach(apt => {
        if (apt.patientId) {
          uniquePatientIds.add(apt.patientId)
        }
      })
      const patientsCount = uniquePatientIds.size

      // Parse dentists - backend returns { success: true, data: [...] }
      let dentistsCount = 0
      if (dentistsRes.status === 'fulfilled') {
        const dentists = dentistsRes.value?.data || []
        dentistsCount = dentists.length
      }

      setStats({
        totalPatients: patientsCount,
        totalDentists: dentistsCount
      })
    } catch (error) {
      console.error('Error fetching secretary data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Get stats with defaults - count only PENDING appointments (not CONFIRMED, COMPLETED, or CANCELLED)
  const secretaryStats = {
    todayAppointments: todayAppointments.length || 0,
    pendingAppointments: todayAppointments.filter(a => a.status === 'PENDING').length || 0,
    confirmedAppointments: todayAppointments.filter(a => a.status === 'CONFIRMED').length || 0,
    totalPatients: stats.totalPatients || 0,
    totalDentists: stats.totalDentists || 0
  }

  // Sort today's appointments by time (ascending)
  const sortedTodayAppointments = [...todayAppointments].sort((a, b) => {
    const timeA = new Date(a.startTime).getTime()
    const timeB = new Date(b.startTime).getTime()
    return timeA - timeB
  })


  const getStatusBadge = (status) => {
    const statusLower = status?.toLowerCase() || 'pending'
    // Match StatusBadge component colors: confirmed = green, completed = blue, pending = yellow, cancelled = red
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      scheduled: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      confirmed: 'bg-green-100 text-green-800 border-green-200',
      completed: 'bg-blue-100 text-blue-800 border-blue-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    }
    
    const darkStyles = {
      pending: 'bg-yellow-900/20 text-yellow-400 border-yellow-800',
      scheduled: 'bg-yellow-900/20 text-yellow-400 border-yellow-800',
      confirmed: 'bg-green-900/20 text-green-400 border-green-800',
      completed: 'bg-blue-900/20 text-blue-400 border-blue-800',
      cancelled: 'bg-red-900/20 text-red-400 border-red-800'
    }

    return isDarkMode ? darkStyles[statusLower] || darkStyles.pending : styles[statusLower] || styles.pending
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className={`p-6 rounded-xl ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      } shadow-lg`}>
        <div>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
            Welcome, {userData?.firstName || 'Secretary'}!
          </h2>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {userData?.clinic?.clinicName || 'Clinic'} • {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsOverview stats={[
        {
          label: 'Today\'s Appointments',
          value: secretaryStats.todayAppointments,
          icon: FaCalendarAlt,
          gradient: 'from-blue-600 to-cyan-600'
        },
        {
          label: 'Pending',
          value: secretaryStats.pendingAppointments,
          icon: FaClock,
          gradient: 'from-yellow-600 to-orange-600'
        },
        {
          label: 'Confirmed',
          value: secretaryStats.confirmedAppointments,
          icon: FaCheckCircle,
          gradient: 'from-green-600 to-teal-600'
        },
        {
          label: 'Total Patients',
          value: secretaryStats.totalPatients,
          icon: FaUsers,
          gradient: 'from-purple-600 to-pink-600'
        },
        {
          label: 'Dentists',
          value: secretaryStats.totalDentists,
          icon: FaUserMd,
          gradient: 'from-teal-600 to-cyan-600'
        }
      ]} />

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
            <LoadingSpinner size="md" text="Loading appointments..." />
          </div>
        ) : todayAppointments.length === 0 ? (
          <div className="text-center py-8">
            <FaCalendarAlt className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>No appointments scheduled for today</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedTodayAppointments.slice(0, 5).map((appointment) => (
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
                        <StatusBadge status={appointment.status} label={appointment.status} />
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
                      {new Date(appointment.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
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
    </div>
  )
}

export default SecretaryOverview
