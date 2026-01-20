import { FaStethoscope } from 'react-icons/fa'
import { WelcomeCard } from '../../../components'
import { AppointmentSchedule } from '../../../components'

const DentistOverview = ({ userData, onTabChange, appointments = [], onAppointmentClick, onAddAppointment, onNavigateToSettings }) => {
  
  const handleNavigateToSchedule = (target) => {
    if (target === 'settings:schedule') {
      // Navigate to settings and pass schedule tab info
      onTabChange?.('settings')
      // Notify settings page to open schedule tab
      if (onNavigateToSettings) {
        onNavigateToSettings('schedule')
      }
    } else {
      onTabChange?.(target)
    }
  }
  
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <WelcomeCard
        title={`Welcome back, Dr. ${userData?.firstName || 'Doctor'}!`}
        subtitle={userData?.clinic?.clinicName || 'Clinic'}
        icon={FaStethoscope}
        iconGradient="from-teal-600 to-cyan-600"
      />

      {/* Today's Schedule */}
      <AppointmentSchedule
        appointments={appointments}
        onAddAppointment={onAddAppointment || (() => onTabChange?.('appointments'))}
        onAppointmentClick={onAppointmentClick}
        dentistData={userData}
        onNavigateToSchedule={handleNavigateToSchedule}
      />
    </div>
  )
}

export default DentistOverview
