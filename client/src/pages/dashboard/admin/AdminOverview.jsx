import { useState, useEffect } from 'react'
import { 
  FaHospital,
  FaUsers,
  FaSearch,
  FaXRay
} from 'react-icons/fa'
import { MdPendingActions } from 'react-icons/md'
import { Card, Button } from '../../../components'
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

      const dentistStats = dentistStatsRes.status === 'fulfilled' ? dentistStatsRes.value.data : { pending: 0, total: 0 }
      const clinicStats = clinicStatsRes.status === 'fulfilled' ? clinicStatsRes.value.data : { total: 0 }
      const radiologyStats = radiologyStatsRes.status === 'fulfilled' ? radiologyStatsRes.value.data : { total: 0 }
      const patientStats = patientStatsRes.status === 'fulfilled' ? patientStatsRes.value.data : { total: 0 }

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
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>System Overview</h2>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={fetchStats}
            disabled={isLoadingStats}
          >
            {isLoadingStats ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
            ) : (
              <FaSearch className="w-4 h-4" />
            )}
            {isLoadingStats ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>
      
      {statsError && (
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-red-900/20 border border-red-700/30 text-red-400' : 'bg-red-50 border border-red-200 text-red-600'}`}>
          <p className="text-sm">{statsError}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className={`p-6 border ${isDarkMode 
          ? 'bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-700/30' 
          : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>Total Clinics</p>
              {isLoadingStats ? (
                <div className="h-9 w-16 bg-current opacity-20 rounded animate-pulse mt-1"></div>
              ) : (
                <p className={`text-3xl font-bold ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>{stats.totalClinics || 0}</p>
              )}
            </div>
            <FaHospital className={`w-8 h-8 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          </div>
        </Card>

        <Card className={`p-6 border ${isDarkMode 
          ? 'bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 border-yellow-700/30' 
          : 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>Pending Dentists</p>
              {isLoadingStats ? (
                <div className="h-9 w-16 bg-current opacity-20 rounded animate-pulse mt-1"></div>
              ) : (
                <p className={`text-3xl font-bold ${isDarkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>{stats.pendingDentists || 0}</p>
              )}
            </div>
            <MdPendingActions className={`w-8 h-8 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
          </div>
        </Card>

        <Card className={`p-6 border ${isDarkMode 
          ? 'bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-700/30' 
          : 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>Radiology Centers</p>
              {isLoadingStats ? (
                <div className="h-9 w-16 bg-current opacity-20 rounded animate-pulse mt-1"></div>
              ) : (
                <p className={`text-3xl font-bold ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>{stats.radiologyCenters || 0}</p>
              )}
            </div>
            <FaXRay className={`w-8 h-8 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
          </div>
        </Card>

        <Card className={`p-6 border ${isDarkMode 
          ? 'bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-700/30' 
          : 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>Total Patients</p>
              {isLoadingStats ? (
                <div className="h-9 w-16 bg-current opacity-20 rounded animate-pulse mt-1"></div>
              ) : (
                <p className={`text-3xl font-bold ${isDarkMode ? 'text-purple-300' : 'text-purple-800'}`}>{stats.totalPatients || 0}</p>
              )}
            </div>
            <FaUsers className={`w-8 h-8 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
          </div>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card className="p-6">
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Recent Activities</h3>
        <div className="space-y-4">
          <div className={`flex items-center gap-4 p-3 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>New clinic registered: "Smile Dental Center"</p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>2 hours ago</p>
            </div>
          </div>
          <div className={`flex items-center gap-4 p-3 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Dentist approval pending: Dr. Ahmad Salem</p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>4 hours ago</p>
            </div>
          </div>
          <div className={`flex items-center gap-4 p-3 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>New radiology center added: "Advanced Imaging"</p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>1 day ago</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default AdminOverview
