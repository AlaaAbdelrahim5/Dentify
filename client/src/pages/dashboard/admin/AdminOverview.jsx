import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  FaHospital,
  FaUsers,
  FaXRay,
  FaUserShield,
  FaUserMd,
  FaPlus,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaChartLine,
  FaCalendarAlt,
  FaArrowRight,
  FaEye
} from 'react-icons/fa'
import { FaUser } from 'react-icons/fa'
import { MdPendingActions } from 'react-icons/md'
import { Card, StatsOverview, WelcomeCard, Button, LoadingSpinner } from '../../../components'
import { useTheme } from '../../../contexts/ThemeContext'
import { dentistsAPI, clinicsAPI, radiologyAPI, patientsAPI, adminAPI, secretariesAPI } from '../../../services/api'
import { formatDate, getImageUrl } from '../../../utils/helpers'

const AdminOverview = ({ stats, setStats, refreshData }) => {
  const { isDarkMode } = useTheme()
  const navigate = useNavigate()
  const [isLoadingStats, setIsLoadingStats] = useState(false)
  const [statsError, setStatsError] = useState(null)
  const [pendingDentists, setPendingDentists] = useState([])
  const [pendingSecretaries, setPendingSecretaries] = useState([])
  const [pendingApprovals, setPendingApprovals] = useState([])
  const [recentActivities, setRecentActivities] = useState([])
  const [loadingPending, setLoadingPending] = useState(true)
  const [loadingActivities, setLoadingActivities] = useState(true)

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
    fetchPendingApprovals()
    fetchRecentActivities()
  }, [])

  // Fetch pending dentists and secretaries for approval
  const fetchPendingApprovals = async () => {
    setLoadingPending(true)
    try {
      const [dentistsRes, secretariesRes] = await Promise.allSettled([
        dentistsAPI.getAll({ status: 'PENDING', limit: 10, page: 1 }),
        secretariesAPI.getAll(null, { includeAll: 'true' })
      ])

      const combined = []

      // Add pending dentists
      if (dentistsRes.status === 'fulfilled') {
        const dentists = dentistsRes.value.dentists || dentistsRes.value.data || []
        dentists.forEach(dentist => {
          if (dentist.user?.status === 'PENDING' || dentist.userId?.status === 'PENDING') {
            combined.push({
              ...dentist,
              type: 'dentist',
              icon: FaUserMd,
              color: 'blue',
              title: 'Dr. ',
              roleLabel: 'Dentist'
            })
          }
        })
      }

      // Add pending secretaries
      if (secretariesRes.status === 'fulfilled') {
        const secretaries = secretariesRes.value.data || secretariesRes.value.secretaries || []
        secretaries.forEach(secretary => {
          const status = secretary.userId?.status || secretary.user?.status
          if (status && status.toUpperCase() === 'PENDING') {
            combined.push({
              ...secretary,
              // Extract the actual user ID number
              userIdNumber: secretary.userId?.id || secretary.user?.id || secretary.userId,
              type: 'secretary',
              icon: FaUser,
              color: 'purple',
              title: '',
              roleLabel: 'Secretary'
            })
          }
        })
      }

      // Sort by creation date and take latest 5
      combined.sort((a, b) => {
        const timeA = new Date(a.createdAt || a.user?.createdAt || a.userId?.createdAt)
        const timeB = new Date(b.createdAt || b.user?.createdAt || b.userId?.createdAt)
        return timeB - timeA
      })

      setPendingApprovals(combined.slice(0, 5))
    } catch (error) {
      console.error('Error fetching pending approvals:', error)
      setPendingApprovals([])
    } finally {
      setLoadingPending(false)
    }
  }

  // Fetch recent activities (latest registrations)
  const fetchRecentActivities = async () => {
    setLoadingActivities(true)
    try {
      const [dentistsRes, clinicsRes, patientsRes, adminsRes] = await Promise.allSettled([
        dentistsAPI.getAll({ limit: 3, page: 1 }),
        clinicsAPI.getAll({ limit: 3, page: 1 }),
        patientsAPI.getAll({ limit: 3, page: 1 }),
        adminAPI.getAllAdmins({ limit: 3, page: 1 })
      ])

      const activities = []

      // Add dentists
      if (dentistsRes.status === 'fulfilled') {
        const dentists = dentistsRes.value.dentists || dentistsRes.value.data || []
        dentists.slice(0, 2).forEach(dentist => {
          activities.push({
            type: 'dentist',
            icon: FaUserMd,
            color: 'blue',
            title: 'New Dentist Registered',
            description: `Dr. ${dentist.firstName} ${dentist.lastName}`,
            time: dentist.createdAt || dentist.user?.createdAt,
            status: dentist.user?.status || dentist.userId?.status
          })
        })
      }

      // Add clinics
      if (clinicsRes.status === 'fulfilled') {
        const clinics = clinicsRes.value.data || []
        clinics.slice(0, 2).forEach(clinic => {
          activities.push({
            type: 'clinic',
            icon: FaHospital,
            color: 'teal',
            title: 'New Clinic Registered',
            description: clinic.clinicName,
            time: clinic.createdAt || clinic.user?.createdAt,
            status: clinic.user?.status
          })
        })
      }

      // Add patients
      if (patientsRes.status === 'fulfilled') {
        const patients = patientsRes.value.data || patientsRes.value.patients || []
        patients.slice(0, 2).forEach(patient => {
          activities.push({
            type: 'patient',
            icon: FaUsers,
            color: 'purple',
            title: 'New Patient Registered',
            description: `${patient.firstName} ${patient.lastName}`,
            time: patient.createdAt || patient.user?.createdAt,
            status: patient.user?.status
          })
        })
      }

      // Add admins
      if (adminsRes.status === 'fulfilled') {
        const admins = adminsRes.value.data || []
        admins.slice(0, 2).forEach(admin => {
          const status = admin.userId?.status || admin.user?.status
          activities.push({
            type: 'admin',
            icon: FaUserShield,
            color: 'green',
            title: 'New Admin Added',
            description: admin.fullName,
            time: admin.createdAt || admin.userId?.createdAt,
            status: status ? status.toUpperCase() : status
          })
        })
      }

      // Sort by time and take latest 6
      activities.sort((a, b) => new Date(b.time) - new Date(a.time))
      setRecentActivities(activities.slice(0, 6))
    } catch (error) {
      console.error('Error fetching recent activities:', error)
      setRecentActivities([])
    } finally {
      setLoadingActivities(false)
    }
  }

  const handleApproveDentist = async (dentistId) => {
    try {
      await dentistsAPI.approve(dentistId)
      fetchPendingApprovals()
      fetchStats()
      fetchRecentActivities()
    } catch (error) {
      console.error('Error approving dentist:', error)
    }
  }

  const handleApproveSecretary = async (secretaryId) => {
    try {
      console.log('Approving secretary with ID:', secretaryId)
      await secretariesAPI.approve(secretaryId)
      fetchPendingApprovals()
      fetchStats()
      fetchRecentActivities()
    } catch (error) {
      console.error('Error approving secretary:', error)
      alert('Failed to approve secretary: ' + (error.message || 'Unknown error'))
    }
  }

  const handleApprove = async (item) => {
    console.log('Approving item:', item)
    if (item.type === 'dentist') {
      await handleApproveDentist(item.userId || item.id || item._id)
    } else if (item.type === 'secretary') {
      // Use userIdNumber which contains the actual ID, or fallback to other fields
      await handleApproveSecretary(item.userIdNumber || item.userId?.id || item.user?.id || item.userId || item.id || item._id)
    }
  }

  const getActivityColor = (color) => {
    const colors = {
      blue: 'from-blue-500 to-cyan-500',
      teal: 'from-teal-500 to-cyan-500',
      purple: 'from-purple-500 to-pink-500',
      green: 'from-green-500 to-emerald-500'
    }
    return colors[color] || colors.blue
  }

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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Approvals */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Pending Approvals
                </h2>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Dentists and Secretaries waiting for approval
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin/dashboard', { state: { activeTab: 'dentists' } })}
              >
                View All
              </Button>
            </div>

            {loadingPending ? (
              <div className="flex justify-center items-center py-12">
                <LoadingSpinner />
              </div>
            ) : pendingApprovals.length === 0 ? (
              <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <MdPendingActions className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No pending approvals</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingApprovals.map((item) => (
                  <div
                    key={item._id || item.userId}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-800/50 border-gray-700' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="shrink-0 h-12 w-12">
                        {item.user?.profileImage || item.userId?.profileImage ? (
                          <img
                            className="h-12 w-12 rounded-full object-cover"
                            src={getImageUrl(item.user?.profileImage || item.userId?.profileImage)}
                            alt={`${item.title}${item.firstName} ${item.lastName}`}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.querySelector('.fallback-avatar').classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${
                          item.color === 'blue' ? 'from-blue-500 to-cyan-500' : 'from-purple-500 to-pink-500'
                        } flex items-center justify-center fallback-avatar ${item.user?.profileImage || item.userId?.profileImage ? 'hidden' : ''}`}>
                          <item.icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {item.title}{item.firstName} {item.lastName}
                        </h4>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {item.type === 'dentist' 
                            ? item.specialization?.join(', ') || 'General Dentistry'
                            : item.roleLabel
                          }
                        </p>
                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          {formatDate(item.createdAt || item.user?.createdAt || item.userId?.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/admin/dashboard', { state: { activeTab: item.type === 'dentist' ? 'dentists' : 'secretaries' } })}
                        title="View Details"
                      >
                        <FaEye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleApprove(item)}
                        title="Approve"
                      >
                        <FaCheckCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Recent Activities */}
        <div>
          <Card className="p-6">
            <div className="mb-6">
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Recent Activities
              </h2>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Latest registrations
              </p>
            </div>

            {loadingActivities ? (
              <div className="flex justify-center items-center py-12">
                <LoadingSpinner />
              </div>
            ) : recentActivities.length === 0 ? (
              <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <FaChartLine className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No recent activities</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 pb-4 ${
                      index !== recentActivities.length - 1 
                        ? `border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}` 
                        : ''
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${getActivityColor(activity.color)} flex items-center justify-center flex-shrink-0`}>
                      <activity.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {activity.title}
                      </p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} truncate`}>
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          {formatDate(activity.time)}
                        </p>
                        {activity.status && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                            activity.status === 'ACTIVE'
                              ? isDarkMode
                                ? 'bg-green-900/20 text-green-400 border-green-800'
                                : 'bg-green-100 text-green-800 border-green-200'
                              : activity.status === 'PENDING'
                              ? isDarkMode
                                ? 'bg-yellow-900/20 text-yellow-400 border-yellow-800'
                                : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                              : activity.status === 'DEACTIVATED'
                              ? isDarkMode
                                ? 'bg-red-900/20 text-red-400 border-red-800'
                                : 'bg-red-100 text-red-800 border-red-200'
                              : isDarkMode
                                ? 'bg-gray-800 text-gray-400 border-gray-700'
                                : 'bg-gray-100 text-gray-800 border-gray-300'
                          }`}>
                            {activity.status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

export default AdminOverview
