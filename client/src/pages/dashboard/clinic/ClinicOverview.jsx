import { useEffect, useState } from 'react'
import { 
  FaUserTie,
  FaUserMd,
  FaCalendarAlt,
  FaUsers,
  FaClock,
  FaHospital,
  FaCalendarPlus,
  FaUserPlus,
  FaChartLine,
  FaCog,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationCircle
} from 'react-icons/fa'
import { Card, StatsOverview, WelcomeCard, Button } from '../../../components'
import { useTheme } from '../../../contexts/ThemeContext'
import { secretariesAPI, dentistsAPI, appointmentsAPI, patientsAPI } from '../../../services/api'

const ClinicOverview = ({ userData, stats: propStats, onTabChange }) => {
  const { isDarkMode } = useTheme()
  const [stats, setStats] = useState(propStats || {})
  const [recentAppointments, setRecentAppointments] = useState([])
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

        // Get upcoming appointments (next 5)
        const upcomingAppts = appointments
          .filter(apt => new Date(apt.appointmentDate) >= today)
          .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
          .slice(0, 5)
        
        setRecentAppointments(upcomingAppts)

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

  const getStatusBadge = (status) => {
    const statusMap = {
      'CONFIRMED': { 
        color: isDarkMode ? 'bg-green-900/30 text-green-400 border-green-700' : 'bg-green-100 text-green-800 border-green-500',
        icon: FaCheckCircle 
      },
      'PENDING': { 
        color: isDarkMode ? 'bg-yellow-900/30 text-yellow-400 border-yellow-700' : 'bg-yellow-100 text-yellow-800 border-yellow-500',
        icon: FaExclamationCircle 
      },
      'CANCELLED': { 
        color: isDarkMode ? 'bg-red-900/30 text-red-400 border-red-700' : 'bg-red-100 text-red-800 border-red-500',
        icon: FaTimesCircle 
      }
    }
    const config = statusMap[status] || statusMap['PENDING']
    const Icon = config.icon
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    )
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const quickActions = [
    {
      title: 'New Appointment',
      description: 'Schedule a new appointment',
      icon: FaCalendarPlus,
      gradient: 'from-teal-600 to-cyan-600',
      onClick: () => onTabChange?.('appointments')
    },
    {
      title: 'Add Secretary',
      description: 'Register a new secretary',
      icon: FaUserPlus,
      gradient: 'from-blue-600 to-indigo-600',
      onClick: () => onTabChange?.('secretaries')
    },
    {
      title: 'View Analytics',
      description: 'Check clinic performance',
      icon: FaChartLine,
      gradient: 'from-purple-600 to-pink-600',
      onClick: () => onTabChange?.('analytics')
    },
    {
      title: 'Clinic Settings',
      description: 'Manage clinic configuration',
      icon: FaCog,
      gradient: 'from-gray-600 to-slate-600',
      onClick: () => onTabChange?.('settings')
    }
  ]

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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickActions.map((action, index) => (
          <Card 
            key={index}
            className={`p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl ${
              isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
            }`}
            onClick={action.onClick}
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div className={`p-4 rounded-xl bg-gradient-to-br ${action.gradient} shadow-lg`}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {action.title}
                </h3>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {action.description}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Appointments */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-teal-600 to-cyan-600">
              <FaCalendarAlt className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Upcoming Appointments
              </h2>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Next scheduled appointments
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => onTabChange?.('appointments')}
            className="flex items-center gap-2"
          >
            View All
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`p-4 rounded-lg border ${
                isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-4 w-32 bg-gray-300 dark:bg-gray-600 rounded animate-pulse mb-2"></div>
                    <div className="h-3 w-48 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                  </div>
                  <div className="h-6 w-20 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : recentAppointments.length === 0 ? (
          <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <FaCalendarAlt className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No upcoming appointments</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentAppointments.map((apt) => (
              <div 
                key={apt.id}
                className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                  isDarkMode 
                    ? 'border-gray-700 bg-gray-800 hover:bg-gray-750' 
                    : 'border-gray-200 bg-gray-50 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {apt.patient ? `${apt.patient.firstName} ${apt.patient.lastName}` : 'Unknown Patient'}
                      </h3>
                      {getStatusBadge(apt.status)}
                    </div>
                    <div className={`text-sm space-y-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <div className="flex items-center gap-2">
                        <FaCalendarAlt className="w-3 h-3" />
                        <span>{formatDate(apt.appointmentDate)}</span>
                      </div>
                      {apt.dentist && (
                        <div className="flex items-center gap-2">
                          <FaUserMd className="w-3 h-3" />
                          <span>Dr. {apt.dentist.firstName} {apt.dentist.lastName}</span>
                        </div>
                      )}
                      {apt.notes && (
                        <p className="text-xs mt-1 italic">{apt.notes}</p>
                      )}
                    </div>
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

export default ClinicOverview
