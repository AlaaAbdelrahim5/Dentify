import { useState, useEffect } from 'react'
import {
  FaUserMd,
  FaHospital,
  FaUsers,
  FaCalendarCheck,
  FaMoneyBillWave,
  FaChartLine,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaClock,
  FaBan
} from 'react-icons/fa'
import { Card, LoadingSpinner } from '../../../components'
import { useTheme } from '../../../contexts/ThemeContext'
import { dentistsAPI, clinicsAPI, patientsAPI, appointmentsAPI } from '../../../services/api'

const AdminAnalytics = () => {
  const { isDarkMode } = useTheme()
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingAppointments, setLoadingAppointments] = useState(true)
  const [loadingCities, setLoadingCities] = useState(true)
  const [stats, setStats] = useState({
    totalDentists: 0,
    totalClinics: 0,
    totalPatients: 0,
    totalAppointments: 0,
    activeDentists: 0,
    activeClinics: 0,
    pendingDentists: 0,
    completedAppointments: 0,
    pendingAppointments: 0,
    cancelledAppointments: 0
  })

  const [cityDistribution, setCityDistribution] = useState([])

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    // Fetch main stats
    setLoadingStats(true)
    try {
      const [dentistsRes, clinicsRes, patientsRes] = await Promise.allSettled([
        dentistsAPI.getStats(),
        clinicsAPI.getStats(),
        patientsAPI.getStats()
      ])

      // Process dentists stats
      if (dentistsRes.status === 'fulfilled') {
        const dentistStats = dentistsRes.value?.data || {}
        setStats(prev => ({
          ...prev,
          totalDentists: dentistStats.total || 0,
          activeDentists: dentistStats.active || 0,
          pendingDentists: dentistStats.pending || 0
        }))
      }

      // Process clinics stats
      if (clinicsRes.status === 'fulfilled') {
        const clinicStats = clinicsRes.value?.data || {}
        setStats(prev => ({
          ...prev,
          totalClinics: clinicStats.total || 0,
          activeClinics: clinicStats.active || 0
        }))
      }

      // Process patients stats
      if (patientsRes.status === 'fulfilled') {
        const patientStats = patientsRes.value?.data || {}
        setStats(prev => ({
          ...prev,
          totalPatients: patientStats.total || 0
        }))
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoadingStats(false)
    }

    // Fetch appointments separately
    setLoadingAppointments(true)
    try {
      const appointmentsRes = await appointmentsAPI.getAll()
      const appointments = appointmentsRes.data || appointmentsRes.appointments || []
      const completed = appointments.filter(apt => apt.status === 'COMPLETED' || apt.status === 'completed').length
      const pending = appointments.filter(apt => apt.status === 'PENDING' || apt.status === 'pending').length
      const cancelled = appointments.filter(apt => apt.status === 'CANCELLED' || apt.status === 'cancelled').length
      
      setStats(prev => ({
        ...prev,
        totalAppointments: appointments.length,
        completedAppointments: completed,
        pendingAppointments: pending,
        cancelledAppointments: cancelled
      }))
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoadingAppointments(false)
    }

    // Fetch city distribution
    setLoadingCities(true)
    try {
      const [dentistsData, clinicsData] = await Promise.allSettled([
        dentistsAPI.getAll({ limit: 1000, page: 1 }),
        clinicsAPI.getAll({ limit: 1000, page: 1 })
      ])

      const cityCount = {}

      if (dentistsData.status === 'fulfilled') {
        const dentists = dentistsData.value.dentists || dentistsData.value.data || []
        dentists.forEach(dentist => {
          const city = dentist.city || 'Unknown'
          cityCount[city] = (cityCount[city] || 0) + 1
        })
      }

      if (clinicsData.status === 'fulfilled') {
        const clinics = clinicsData.value.data || []
        clinics.forEach(clinic => {
          const city = clinic.city || 'Unknown'
          cityCount[city] = (cityCount[city] || 0) + 1
        })
      }

      const cityArray = Object.entries(cityCount)
        .map(([city, count]) => ({ city, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      setCityDistribution(cityArray)
    } catch (error) {
      console.error('Error fetching city distribution:', error)
    } finally {
      setLoadingCities(false)
    }
  }

  const StatCard = ({ icon: Icon, title, value, subtitle, color, loading }) => (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${color} flex items-center justify-center`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {title}
          </p>
          <p className={`text-3xl font-bold mt-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {loading ? '-' : value.toLocaleString()}
          </p>
          {!loading && subtitle && (
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Analytics Dashboard
        </h1>
        <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Comprehensive overview of platform metrics and trends
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={FaUserMd}
          title="Total Dentists"
          value={stats.totalDentists}
          subtitle={`${stats.activeDentists} active, ${stats.pendingDentists} pending`}
          color="from-blue-500 to-cyan-500"
          loading={loadingStats}
        />
        <StatCard
          icon={FaHospital}
          title="Total Clinics"
          value={stats.totalClinics}
          subtitle={`${stats.activeClinics} active`}
          color="from-teal-500 to-cyan-500"
          loading={loadingStats}
        />
        <StatCard
          icon={FaUsers}
          title="Total Patients"
          value={stats.totalPatients}
          color="from-purple-500 to-pink-500"
          loading={loadingStats}
        />
        <StatCard
          icon={FaCalendarCheck}
          title="Total Appointments"
          value={stats.totalAppointments}
          subtitle={`${stats.completedAppointments} completed`}
          color="from-green-500 to-emerald-500"
          loading={loadingAppointments}
        />
      </div>

      {/* Second Row - Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointment Status Breakdown */}
        <Card className="p-6">
          <h2 className={`text-lg font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Appointment Status
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                  <FaCheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Completed
                  </p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {loadingAppointments ? '-' : stats.completedAppointments}
                  </p>
                </div>
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {loadingAppointments ? '-' : (stats.totalAppointments > 0
                  ? Math.round((stats.completedAppointments / stats.totalAppointments) * 100)
                  : 0)}%
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
                  <FaClock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Pending
                  </p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {loadingAppointments ? '-' : stats.pendingAppointments}
                  </p>
                </div>
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {loadingAppointments ? '-' : (stats.totalAppointments > 0
                  ? Math.round((stats.pendingAppointments / stats.totalAppointments) * 100)
                  : 0)}%
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center">
                  <FaBan className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Cancelled
                  </p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {loadingAppointments ? '-' : stats.cancelledAppointments}
                  </p>
                </div>
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {loadingAppointments ? '-' : (stats.totalAppointments > 0
                  ? Math.round((stats.cancelledAppointments / stats.totalAppointments) * 100)
                  : 0)}%
              </div>
            </div>
          </div>
        </Card>

        {/* Geographic Distribution */}
        <Card className="p-6">
          <h2 className={`text-lg font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Top Cities
          </h2>
          {loadingCities ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      -
                    </span>
                    <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      -
                    </span>
                  </div>
                  <div className={`w-full h-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: '0%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : cityDistribution.length === 0 ? (
            <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <FaMapMarkerAlt className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No city data available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cityDistribution.map((city, index) => {
                const maxCount = cityDistribution[0]?.count || 1
                const percentage = (city.count / maxCount) * 100
                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {city.city}
                      </span>
                      <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {city.count}
                      </span>
                    </div>
                    <div className={`w-full h-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

export default AdminAnalytics
