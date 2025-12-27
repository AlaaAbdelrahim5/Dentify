import { useState, useEffect } from 'react'
import { 
  FaHospital,
  FaUsers,
  FaXRay,
  FaUserShield
} from 'react-icons/fa'
import { MdPendingActions } from 'react-icons/md'
import { Card, StatsOverview, WelcomeCard, RecentActivities } from '../../../components'
import { useTheme } from '../../../contexts/ThemeContext'
import { dentistsAPI, clinicsAPI, radiologyAPI, patientsAPI } from '../../../services/api'

const AdminOverview = ({ stats, setStats, refreshData }) => {
  const { isDarkMode } = useTheme()
  const [isLoadingStats, setIsLoadingStats] = useState(false)
  const [statsError, setStatsError] = useState(null)

  const fetchStats = async () => {
    setIsLoadingStats(true)
    setStatsError(null)
    
    try {
      const [dentistStatsRes, clinicStatsRes, radiologyStatsRes, patientStatsRes] = await Promise.allSettled([
        dentistsAPI.getStats(),
        clinicsAPI.getStats(),
        radiologyAPI.getStats(),
        patientsAPI.getStats()
      ])

      // Backend returns { data: { total, pending, active } }
      const dentistStats = dentistStatsRes.status === 'fulfilled' && dentistStatsRes.value?.data 
        ? dentistStatsRes.value.data 
        : { pending: 0, total: 0 }
      
      const clinicStats = clinicStatsRes.status === 'fulfilled' && clinicStatsRes.value?.data 
        ? clinicStatsRes.value.data 
        : { total: 0 }
      
      const radiologyStats = radiologyStatsRes.status === 'fulfilled' && radiologyStatsRes.value?.data 
        ? radiologyStatsRes.value.data 
        : { total: 0 }
      
      const patientStats = patientStatsRes.status === 'fulfilled' && patientStatsRes.value?.data 
        ? patientStatsRes.value.data 
        : { total: 0 }

      setStats({
        totalClinics: clinicStats.total || 0,
        pendingDentists: dentistStats.pending || 0,
        radiologyCenters: radiologyStats.total || 0,
        totalPatients: patientStats.total || 0
      })
      
      setIsLoadingStats(false)
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      setStatsError('Failed to load dashboard statistics')
      setIsLoadingStats(false)
      
      setStats({
        totalClinics: 0,
        pendingDentists: 0,
        radiologyCenters: 0,
        totalPatients: 0
      })
    }
  }

  // Initial load - fetch stats on mount
  useEffect(() => {
    fetchStats()
  }, [])

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <WelcomeCard
        title="System Overview"
        subtitle="Manage and monitor your dental platform"
        icon={FaUserShield}
        iconGradient="from-blue-600 to-cyan-600"
      />
      
      {statsError && (
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-red-900/20 border border-red-700/30 text-red-400' : 'bg-red-50 border border-red-200 text-red-600'}`}>
          <p className="text-sm">{statsError}</p>
        </div>
      )}

      {/* Stats Cards */}
      {isLoadingStats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
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
            label: 'Total Clinics',
            value: stats.totalClinics || 0,
            icon: FaHospital,
            gradient: 'from-blue-600 to-cyan-600'
          },
          {
            label: 'Pending Dentists',
            value: stats.pendingDentists || 0,
            icon: MdPendingActions,
            gradient: 'from-yellow-600 to-orange-600'
          },
          {
            label: 'Radiology Centers',
            value: stats.radiologyCenters || 0,
            icon: FaXRay,
            gradient: 'from-green-600 to-teal-600'
          },
          {
            label: 'Total Patients',
            value: stats.totalPatients || 0,
            icon: FaUsers,
            gradient: 'from-purple-600 to-pink-600'
          }
        ]} />
      )}

      {/* Recent Activities */}
      <RecentActivities 
        activities={[
          {
            message: 'New clinic registered: "Smile Dental Center"',
            time: '2 hours ago',
            color: 'green'
          },
          {
            message: 'Dentist approval pending: Dr. Ahmad Salem',
            time: '4 hours ago',
            color: 'yellow'
          },
          {
            message: 'New radiology center added: "Advanced Imaging"',
            time: '1 day ago',
            color: 'blue'
          }
        ]}
      />
    </div>
  )
}

export default AdminOverview
