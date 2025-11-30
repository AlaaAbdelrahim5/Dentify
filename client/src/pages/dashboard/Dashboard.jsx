import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import { authUtils } from '../../utils/auth'
import { Navbar, Sidebar, LoadingSpinner } from '../../components'

// Import admin components
import AdminOverview from './admin/AdminOverview'
import ClinicsManagement from './admin/ClinicsManagement'
import RadiologyManagement from './admin/RadiologyManagement'
import DentistsManagement from './admin/DentistsManagement'
import AdminsManagement from './admin/AdminsManagement'
import AdminSettings from './admin/AdminSettings'

// Import clinic components
import ClinicOverview from './clinic/ClinicOverview'
import ClinicAppointments from './clinic/ClinicAppointments'
import ClinicTreatments from './clinic/ClinicTreatments'
import ClinicPayments from './clinic/ClinicPayments'
import ClinicPatients from './clinic/ClinicPatients'
import SecretariesManagement from './clinic/SecretariesManagement'
import { default as ClinicDentistsManagement } from './clinic/DentistsManagement'
import ClinicSettings from './clinic/ClinicSettings'

// Import dentist components
import DentistOverview from './dentist/DentistOverview'
import DentistAppointments from './dentist/DentistAppointments'
import DentistPatients from './dentist/DentistPatients'
import DentistSchedule from './dentist/DentistSchedule'
import DentistTreatments from './dentist/DentistTreatments'
import DentistPayments from './dentist/DentistPayments'
import DentistRadiology from './dentist/DentistRadiology'
import DentistSettings from './dentist/DentistSettings'

// Import patient components
import PatientOverview from './patient/PatientOverview'
import PatientAppointments from './patient/PatientAppointments'
import FindClinic from './patient/FindClinic'
import FindDentist from './patient/FindDentist'
import PatientTreatments from './patient/PatientTreatments'
import PatientPayments from './patient/PatientPayments'
import PatientXRayResults from './patient/PatientXRayResults'
import PatientSettings from './patient/PatientSettings'

// Import radiology components
import RadiologyOverview from './radiology/RadiologyOverview'
import RadiologyRequests from './radiology/RadiologyRequests'
import RadiologySettings from './radiology/RadiologySettings'

// Import secretary components
import SecretaryOverview from './secretary/SecretaryOverview'
import SecretaryAppointments from './secretary/SecretaryAppointments'
import SecretaryPatients from './secretary/SecretaryPatients'
import SecretaryDentists from './secretary/SecretaryDentists'
import SecretaryTreatments from './secretary/SecretaryTreatments'
import SecretaryPayments from './secretary/SecretaryPayments'
import SecretarySettings from './secretary/SecretarySettings'

// Import icons
import { 
  FaChartBar, 
  FaFileAlt,
  FaCalendarAlt,
  FaUsers,
  FaUserMd
} from 'react-icons/fa'
import { Button, Card } from '../../components'

// Coming soon placeholder component (moved outside to avoid hooks issues)
const ComingSoon = ({ label, icon: Icon = FaChartBar, isDarkMode }) => (
  <div className="text-center py-12">
    <Icon className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
    <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
      {label || 'Coming Soon'}
    </h3>
    <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
      This section will be implemented next
    </p>
    <Button variant="primary">Coming Soon</Button>
  </div>
)

const UnifiedDashboard = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isDarkMode } = useTheme()
  const [activeTab, setActiveTab] = useState(() => {
    // Get saved tab from localStorage on initial render
    const savedTab = localStorage.getItem('dashboardActiveTab')
    return savedTab || 'overview'
  })
  const [currentUser, setCurrentUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [stats, setStats] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [appointments, setAppointments] = useState([])
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Dashboard configuration based on user role
  const getDashboardConfig = (role) => {
    const configs = {
      Admin: {
        title: 'Admin Dashboard',
        userType: 'admin',
        tabs: {
          overview: { component: AdminOverview, label: 'Overview' },
          clinics: { component: ClinicsManagement, label: 'Clinics' },
          dentists: { component: DentistsManagement, label: 'Dentists' },
          radiology: { component: RadiologyManagement, label: 'Radiology' },
          admins: { component: AdminsManagement, label: 'Admins' },
          analytics: { component: ComingSoon, label: 'Analytics', icon: FaChartBar },
          settings: { component: AdminSettings, label: 'Settings' }
        }
      },
      Clinic: {
        title: 'Clinic Dashboard',
        userType: 'clinic',
        tabs: {
          overview: { component: ClinicOverview, label: 'Overview' },
          secretaries: { component: SecretariesManagement, label: 'Secretaries' },
          dentists: { component: ClinicDentistsManagement, label: 'Dentists' },
          appointments: { component: ClinicAppointments, label: 'Appointments' },
          treatments: { component: ClinicTreatments, label: 'Treatments' },
          payments: { component: ClinicPayments, label: 'Payments' },
          patients: { component: ClinicPatients, label: 'Patients' },
          analytics: { component: ComingSoon, label: 'Analytics', icon: FaChartBar },
          settings: { component: ClinicSettings, label: 'Settings' }
        }
      },
      Dentist: {
        title: 'Dentist Dashboard',
        userType: 'dentist',
        tabs: {
          overview: { component: DentistOverview, label: 'Overview' },
          appointments: { component: DentistAppointments, label: 'Appointments' },
          patients: { component: DentistPatients, label: 'Patients' },
          treatments: { component: DentistTreatments, label: 'Treatments' },
          payments: { component: DentistPayments, label: 'Payments' },
          radiology: { component: DentistRadiology, label: 'Radiology' },
          reports: { component: ComingSoon, label: 'Reports', icon: FaFileAlt },
          analytics: { component: ComingSoon, label: 'Analytics', icon: FaChartBar },
          settings: { component: DentistSettings, label: 'Settings' }
        }
      },
      Patient: {
        title: 'Patient Dashboard',
        userType: 'patient',
        tabs: {
          overview: { component: PatientOverview, label: 'Overview' },
          'find-dentist': { component: FindDentist, label: 'Find a Dentist' },
          'find-clinic': { component: FindClinic, label: 'Find a Clinic' },
          appointments: { component: PatientAppointments, label: 'Appointments' },
          payments: { component: PatientPayments, label: 'Payments' },
          xrays: { component: PatientXRayResults, label: 'X-ray Results', icon: FaFileAlt },
          history: { component: PatientTreatments, label: 'Treatments' },
          settings: { component: PatientSettings, label: 'Settings' }
        }
      },
      RadiologyCenter: {
        title: 'Radiology Center Dashboard',
        userType: 'radiology',
        tabs: {
          overview: { component: RadiologyOverview, label: 'Overview' },
          requests: { component: RadiologyRequests, label: 'Requests' },
          settings: { component: RadiologySettings, label: 'Settings' }
        }
      },
      Secretary: {
        title: 'Secretary Dashboard',
        userType: 'secretary',
        tabs: {
          overview: { component: SecretaryOverview, label: 'Overview' },
          appointments: { component: SecretaryAppointments, label: 'Appointments' },
          patients: { component: SecretaryPatients, label: 'Patients' },
          dentists: { component: SecretaryDentists, label: 'Dentists' },
          treatments: { component: SecretaryTreatments, label: 'Treatments' },
          payments: { component: SecretaryPayments, label: 'Payments' },
          reports: { component: ComingSoon, label: 'Reports', icon: FaFileAlt },
          settings: { component: SecretarySettings, label: 'Settings' }
        }
      }
    }
    return configs[role] || configs.Patient
  }

  // Check authentication and get user data
  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        const isAuthenticated = await authUtils.isAuthenticated()
        
        if (!isAuthenticated) {
          navigate('/login', { replace: true })
          return
        }
        
        const user = authUtils.getCurrentUser()
        
        if (!user || !user.role) {
          console.error('Invalid user data:', user)
          navigate('/login', { replace: true })
          return
        }
        
        setCurrentUser(user)
        
        // Check if navigating to settings via state
        if (location.state?.activeTab) {
          setActiveTab(location.state.activeTab)
        }
        
        // Fetch user-specific data based on role
        await fetchUserData(user)
      } catch (error) {
        console.error('Error initializing dashboard:', error)
        navigate('/login', { replace: true })
      } finally {
        setIsLoading(false)
      }
    }

    initializeDashboard()
  }, [navigate])

  // Handle location state changes for tab navigation
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab)
      // Clear the state without triggering navigation to prevent re-render loop
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  // Save active tab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('dashboardActiveTab', activeTab)
  }, [activeTab])

  // Fetch appointments for dentist
  const fetchAppointments = async (token) => {
    try {
      const response = await fetch('http://localhost:5000/api/appointments/dentist/my-appointments', {
        headers: {
          'Authorization': `Bearer ${token || authUtils.getAccessToken()}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('📅 UnifiedDashboard: Fetched appointments:', data.appointments?.length || 0)
        console.log('📅 First appointment sample:', data.appointments?.[0])
        setAppointments(data.appointments || [])
      } else {
        console.error('Failed to fetch appointments:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
    }
  }

  // Fetch user-specific data
  const fetchUserData = async (user) => {
    try {
      const token = authUtils.getAccessToken()
      let endpoint = ''
      
      switch (user.role) {
        case 'Admin':
          // Admin stats are fetched by AdminOverview component
          break
        case 'Clinic':
          endpoint = 'http://localhost:5000/api/clinics/me'
          break
        case 'Dentist':
          endpoint = 'http://localhost:5000/api/dentists/me'
          break
        case 'Patient':
          endpoint = 'http://localhost:5000/api/patients/me'
          break
        case 'RadiologyCenter':
          endpoint = 'http://localhost:5000/api/radiology-centers/me'
          break
        case 'Secretary':
          endpoint = 'http://localhost:5000/api/secretaries/me'
          break
      }
      
      if (endpoint) {
        const response = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          setUserData(data.data?.dentist || data.data?.patient || data.data || data)
          
          // Fetch role-specific stats
          await fetchRoleStats(user.role, token)
          
          // Fetch appointments for dentist
          if (user.role === 'Dentist') {
            await fetchAppointments(token)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  // Fetch role-specific statistics
  const fetchRoleStats = async (role, token) => {
    try {
      let statsEndpoint = ''
      
      switch (role) {
        case 'Admin':
          // Admin stats are fetched by AdminOverview component
          return
        case 'Dentist':
          statsEndpoint = 'http://localhost:5000/api/dentists/dashboard-stats'
          break
        case 'RadiologyCenter':
          statsEndpoint = 'http://localhost:5000/api/radiology-requests/stats'
          break
        case 'Clinic':
          // Clinic stats are mocked for now
          setStats({
            totalSecretaries: 3,
            totalDentists: 5,
            todayAppointments: 12,
            totalPatients: 156,
            pendingAppointments: 8
          })
          return
        case 'Secretary':
          // Secretary stats - same as clinic for now
          setStats({
            totalDentists: 5,
            todayAppointments: 12,
            totalPatients: 156
          })
          return
        case 'Patient':
          // Patient doesn't have specific stats
          return
      }
      
      if (statsEndpoint) {
        const response = await fetch(statsEndpoint, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          setStats(data.stats || data.data || {})
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  // Fetch admin statistics
  const fetchAdminStats = async (token) => {
    try {
      const { dentistsAPI, clinicsAPI, radiologyAPI, patientsAPI } = await import('../../services/api')
      
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
    } catch (error) {
      console.error('Error fetching admin stats:', error)
      setStats({
        totalClinics: 0,
        pendingDentists: 0,
        radiologyCenters: 0,
        totalPatients: 0
      })
    }
  }

  // Fetch appointments when dentist user is loaded
  useEffect(() => {
    if (currentUser?.role === 'Dentist') {
      console.log('📅 UnifiedDashboard: Fetching appointments for dentist user')
      fetchAppointments()
    }
  }, [currentUser])

  // Sidebar toggle handler
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false)
  }

  // Appointment handlers for dentist
  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment)
  }

  const handleAddAppointment = () => {
    setActiveTab('appointments')
  }

  // Render tab content based on active tab and user role
  const renderTabContent = () => {
    if (!currentUser) return null
    
    const config = getDashboardConfig(currentUser.role)
    const tabConfig = config.tabs[activeTab]
    
    if (!tabConfig) {
      return renderNotFound()
    }
    
    const Component = tabConfig.component
    
    // Pass relevant props to the component
    const componentProps = {
      currentUser,
      userData,
      stats,
      setStats,
      onTabChange: setActiveTab,
      refreshData: () => fetchUserData(currentUser),
      // Dentist-specific props
      appointments,
      onAppointmentClick: handleAppointmentClick,
      onAddAppointment: handleAddAppointment,
      isDarkMode
    }
    
    return <Component {...componentProps} />
  }

  // Not found placeholder
  const renderNotFound = () => (
    <Card className="p-8 text-center">
      <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        Tab Not Found
      </h3>
      <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        The requested tab does not exist
      </p>
      <Button onClick={() => setActiveTab('overview')}>Go to Overview</Button>
    </Card>
  )

  // Loading state
  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
          : 'bg-gradient-to-br from-teal-50 to-blue-50'
      }`}>
        <div className="text-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  // User not authenticated
  if (!currentUser) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
          : 'bg-gradient-to-br from-teal-50 to-blue-50'
      }`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  const dashboardConfig = getDashboardConfig(currentUser.role)

  return (
    <div className={`min-h-screen ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
        : 'bg-gradient-to-br from-teal-50 to-blue-50'
    }`}>
      {/* Unified Header */}
      <Navbar 
        showDashboardInfo={true} 
        dashboardTitle={dashboardConfig.title}
        userRole={currentUser.role}
        onToggleSidebar={toggleSidebar}
      />

      {/* Fixed Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        userType={dashboardConfig.userType}
        stats={stats}
        dashboardTitle={dashboardConfig.title}
        isSidebarOpen={isSidebarOpen}
        onClose={closeSidebar}
      />

      {/* Main Content with left margin to account for fixed sidebar */}
      <div className="lg:ml-72 pt-20">
        <div className="p-4 md:p-8">
          {renderTabContent()}
        </div>
      </div>
    </div>
  )
}

export default UnifiedDashboard
