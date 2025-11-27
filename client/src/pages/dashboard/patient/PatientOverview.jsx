import { FaTooth, FaUserMd, FaCalendarAlt } from 'react-icons/fa'
import { Card, Button, StatusBadge } from '../../../components'
import { useTheme } from '../../../contexts/ThemeContext'

const PatientOverview = ({ userData, onTabChange }) => {
  const { isDarkMode } = useTheme()

  // Sample upcoming appointments
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
      {upcomingAppointments.length > 0 && (
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
}

export default PatientOverview
