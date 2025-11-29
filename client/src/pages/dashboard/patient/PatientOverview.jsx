import { useState, useEffect } from 'react'
import { FaTooth, FaUserMd, FaCalendarAlt } from 'react-icons/fa'
import { Card, Button, StatusBadge } from '../../../components'
import { useTheme } from '../../../contexts/ThemeContext'
import { appointmentsAPI } from '../../../services/api'

const PatientOverview = ({ userData, onTabChange }) => {
  const { isDarkMode } = useTheme()
  const [upcomingAppointments, setUpcomingAppointments] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setIsLoading(true)
        // Backend returns { success: true, data: [...] } for patient appointments
        const response = await appointmentsAPI.getMyAppointments()
        const appointments = response.data || response.appointments || []
        
        // Filter upcoming appointments (not cancelled or completed)
        const now = new Date()
        const upcoming = appointments
          .filter(apt => {
            const aptDate = new Date(apt.appointmentDate)
            return aptDate >= now && apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED'
          })
          .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
          .slice(0, 2)
        
        setUpcomingAppointments(upcoming)
      } catch (error) {
        console.error('Error fetching appointments:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAppointments()
  }, [])

  const getStatusBadge = (status) => {
    const statusMap = {
      confirmed: { label: 'Confirmed', color: 'green' },
      pending: { label: 'Pending', color: 'yellow' },
      completed: { label: 'Completed', color: 'blue' },
      cancelled: { label: 'Cancelled', color: 'red' }
    }
    return statusMap[status] || { label: status, color: 'gray' }
  }

  const getUserFirstName = () => {
    if (userData?.firstName) {
      return userData.firstName
    }
    return 'there'
  }

  return (
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
            {userData?.city && (
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                📍 {userData.city}
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

      {/* Upcoming Appointments Preview */}
      {isLoading ? (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="h-6 w-40 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
            <div className="h-8 w-20 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
          </div>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="p-4 rounded-lg border bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
                <div className="h-5 w-32 bg-gray-300 dark:bg-gray-600 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-48 bg-gray-300 dark:bg-gray-600 rounded animate-pulse mb-1"></div>
                <div className="h-4 w-40 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </Card>
      ) : upcomingAppointments.length > 0 ? (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-lg font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Next Appointments</h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onTabChange?.('appointments')}
            >
              View All
            </Button>
          </div>
          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => {
              // Use startTime for the actual appointment time
              const startTime = new Date(appointment.startTime)
              const formattedDate = startTime.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
              const formattedTime = startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
              
              return (
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
                    }`}>{appointment.treatment?.treatmentType || 'Appointment'}</h4>
                    <StatusBadge 
                      status={appointment.status.toLowerCase()}
                      label={getStatusBadge(appointment.status.toLowerCase()).label}
                    />
                  </div>
                  <div className={`text-sm space-y-1 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <p className="flex items-center">
                      <FaUserMd className="mr-2" />
                      Dr. {appointment.dentist?.firstName} {appointment.dentist?.lastName}
                    </p>
                    <p className="flex items-center">
                      <FaCalendarAlt className="mr-2" />
                      {formattedDate} at {formattedTime}
                    </p>
                    {appointment.clinic && (
                      <p className="text-xs">
                        📍 {appointment.clinic.clinicName}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      ) : null}
    </div>
  )
}

export default PatientOverview
