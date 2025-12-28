import { useEffect, useState } from 'react'
import { 
  FaUserTie,
  FaUserMd,
  FaCalendarAlt,
  FaUsers,
  FaClock,
  FaHospital
} from 'react-icons/fa'
import { Card, StatsOverview, WelcomeCard } from '../../../components'
import { useTheme } from '../../../contexts/ThemeContext'
import { secretariesAPI, dentistsAPI, appointmentsAPI, patientsAPI } from '../../../services/api'

const ClinicOverview = ({ userData, stats: propStats }) => {
  const { isDarkMode } = useTheme()
  const [stats, setStats] = useState(propStats || {})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true)
        const [secretariesRes, dentistsRes, appointmentsRes, patientsRes] = await Promise.allSettled([
          secretariesAPI.getForClinic(),
          dentistsAPI.getForClinic(),
          appointmentsAPI.getClinicAppointments(),
          patientsAPI.getAll()
        ])

        // Parse responses correctly based on backend structure
        // Parse secretaries - backend returns { success: true, data: [...] }
        let secretaries = []
        if (secretariesRes.status === 'fulfilled') {
          secretaries = secretariesRes.value?.data || []
        }

        // Parse dentists - backend returns { success: true, data: [...] }
        let dentists = []
        if (dentistsRes.status === 'fulfilled') {
          dentists = dentistsRes.value?.data || []
        }

        // Parse appointments - backend returns { appointments: [...] }
        let appointments = []
        if (appointmentsRes.status === 'fulfilled') {
          appointments = appointmentsRes.value?.appointments || []
        }

        // Parse patients - backend returns { patients: [...] }
        let patients = []
        if (patientsRes.status === 'fulfilled') {
          patients = patientsRes.value?.patients || []
        }

        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const todayAppointments = appointments.filter(apt => {
          const aptDate = new Date(apt.appointmentDate)
          aptDate.setHours(0, 0, 0, 0)
          return aptDate.getTime() === today.getTime()
        })

        const pendingAppointments = todayAppointments.filter(apt => apt.status === 'PENDING' || apt.status === 'SCHEDULED')

        setStats({
          totalSecretaries: secretaries.length || 0,
          totalDentists: dentists.length || 0,
          todayAppointments: todayAppointments.length || 0,
          totalPatients: patients.length || 0,
          pendingAppointments: pendingAppointments.length || 0
        })
      } catch (error) {
        console.error('Error fetching clinic stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  // Ensure default stats values
  const clinicStats = {
    totalSecretaries: stats?.totalSecretaries || 0,
    totalDentists: stats?.totalDentists || 0,
    todayAppointments: stats?.todayAppointments || 0,
    totalPatients: stats?.totalPatients || 0,
    pendingAppointments: stats?.pendingAppointments || 0
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <WelcomeCard
        title={`Welcome to ${userData?.clinicName || 'Your Clinic'}`}
        subtitle={`${userData?.city || 'City'} • Registration: ${userData?.registrationNumber || 'N/A'}`}
        icon={FaHospital}
        iconGradient="from-blue-600 to-cyan-600"
      />

      {/* Stats Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded animate-pulse mb-2"></div>
                  <div className="h-8 w-16 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                </div>
                <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <StatsOverview stats={[
        {
          label: 'Secretaries',
          value: clinicStats.totalSecretaries,
          icon: FaUserTie,
          gradient: 'from-blue-600 to-cyan-600'
        },
        {
          label: 'Dentists',
          value: clinicStats.totalDentists,
          icon: FaUserMd,
          gradient: 'from-green-600 to-teal-600'
        },
        {
          label: 'Today\'s Appointments',
          value: clinicStats.todayAppointments,
          icon: FaCalendarAlt,
          gradient: 'from-yellow-600 to-orange-600'
        },
        {
          label: 'Total Patients',
          value: clinicStats.totalPatients,
          icon: FaUsers,
          gradient: 'from-purple-600 to-pink-600'
        },
        {
          label: 'Pending',
          value: clinicStats.pendingAppointments,
          icon: FaClock,
          gradient: 'from-red-600 to-rose-600'
        }
      ]} />
      )}


    </div>
  )
}

export default ClinicOverview
