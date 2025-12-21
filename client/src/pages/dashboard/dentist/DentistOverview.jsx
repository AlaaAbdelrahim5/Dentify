import { FaStethoscope } from 'react-icons/fa'
import { useTheme } from '../../../contexts/ThemeContext'
import { AppointmentSchedule } from '../../../components'

const DentistOverview = ({ userData, onTabChange, appointments = [], onAppointmentClick, onAddAppointment }) => {
  const { isDarkMode } = useTheme()

  return (
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
              Welcome back, Dr. {userData?.firstName || 'Doctor'}!
            </h1>
            <p className={`mt-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {userData?.clinic?.clinicName || 'Clinic'}
            </p>
          </div>
          <div className={`p-4 rounded-full ${
            isDarkMode ? 'bg-teal-900' : 'bg-teal-100'
          }`}>
            <FaStethoscope className="w-8 h-8 text-teal-600" />
          </div>
        </div>
      </div>

      {/* Today's Schedule */}
      <AppointmentSchedule
        appointments={appointments}
        onAddAppointment={onAddAppointment || (() => onTabChange?.('appointments'))}
        onAppointmentClick={onAppointmentClick || ((appointment) => {
          
        })}
        dentistData={userData}
      />
    </div>
  )
}

export default DentistOverview
