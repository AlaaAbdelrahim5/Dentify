import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import { authUtils } from '../../utils/auth'
import { Navbar, Sidebar, LoadingSpinner } from '../../components'

// Import admin components
import AdminOverview from './admin/AdminOverview'
import ClinicsManagement from './admin/ClinicsManagement'
import RadiologyManagement from './admin/RadiologyManagement'
import DentistsManagement from './admin/DentistsManagement'
import PatientsManagement from './admin/PatientsManagement'
import AdminsManagement from './admin/AdminsManagement'
import AdminSecretariesManagement from './admin/SecretariesManagement'
import AdminSettings from './admin/AdminSettings'

// Import clinic components
import ClinicOverview from './clinic/ClinicOverview'
import ClinicAppointments from './clinic/ClinicAppointments'
import ClinicTreatments from './clinic/ClinicTreatments'
import ClinicPayments from './clinic/ClinicPayments'
import ClinicPatients from './clinic/ClinicPatients'
import SecretariesManagement from './clinic/SecretariesManagement'
import { default as ClinicDentistsManagement } from './clinic/DentistsManagement'
import ClinicInventory from './clinic/ClinicInventory'
import ClinicExpenses from './clinic/ClinicExpenses'
import ClinicSettings from './clinic/ClinicSettings'

// Import dentist components
import DentistOverview from './dentist/DentistOverview'
import DentistAppointments from './dentist/DentistAppointments'
import DentistPatients from './dentist/DentistPatients'
import DentistSchedule from './dentist/DentistSchedule'
import DentistTreatments from './dentist/DentistTreatments'
import DentistPayments from './dentist/DentistPayments'
import DentistRadiology from './dentist/DentistRadiology'
import DentistInventory from './dentist/DentistInventory'
import DentistReports from './dentist/DentistReports'
import DentistAnalytics from './dentist/DentistAnalytics'
import DentistSettings from './dentist/DentistSettings'

// Import patient components
import PatientOverview from './patient/PatientOverview'
import PatientAppointments from './patient/PatientAppointments'
import SearchPage from './patient/SearchPage'
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
// Reuse ClinicAppointments and ClinicPatients for Secretary (identical functionality)
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

const UnifiedDashboard = ({ onOpenChatbot }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isDarkMode } = useTheme()
  const [activeTab, setActiveTab] = useState('overview') // Default to overview initially
  const [currentUser, setCurrentUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [stats, setStats] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [appointments, setAppointments] = useState([])
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024)

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
          secretaries: { component: AdminSecretariesManagement, label: 'Secretaries' },
          patients: { component: PatientsManagement, label: 'Patients' },
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
          inventory: { component: ClinicInventory, label: 'Inventory' },
          expenses: { component: ClinicExpenses, label: 'Expenses & Invoices' },
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
          inventory: { component: DentistInventory, label: 'Inventory' },
          reports: { component: DentistReports, label: 'Reports' },
          analytics: { component: DentistAnalytics, label: 'Analytics' },
          settings: { component: DentistSettings, label: 'Settings' }
        }
      },
      Patient: {
        title: 'Patient Dashboard',
        userType: 'patient',
        tabs: {
          overview: { component: PatientOverview, label: 'Overview' },
          search: { component: SearchPage, label: 'Find Providers' },
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
          appointments: { component: ClinicAppointments, label: 'Appointments' },
          patients: { component: ClinicPatients, label: 'Patients' },
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
          navigate('/login', { replace: true })
          return
        }
        
        setCurrentUser(user)
        
        // Get dashboard config for this user's role
        const config = getDashboardConfig(user.role)
        
        // Validate and set active tab
        const savedTab = localStorage.getItem('dashboardActiveTab')
        
        // Check if navigating to settings via state
        if (location.state?.activeTab) {
          const requestedTab = location.state.activeTab
          // Validate the requested tab exists for this user role
          if (config.tabs[requestedTab]) {
            setActiveTab(requestedTab)
          } else {
            setActiveTab('overview')
          }
        } else if (savedTab && config.tabs[savedTab]) {
          // Use saved tab only if it's valid for this user's role
          setActiveTab(savedTab)
        } else {
          // Default to overview if saved tab is invalid
          setActiveTab('overview')
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/appointments/dentist/my-appointments`, {
        headers: {
          'Authorization': `Bearer ${token || authUtils.getAccessToken()}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setAppointments(data.appointments || [])
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
          endpoint = `${import.meta.env.VITE_API_URL}/api/clinics/me`
          break
        case 'Dentist':
          endpoint = `${import.meta.env.VITE_API_URL}/api/dentists/me`
          break
        case 'Patient':
          endpoint = `${import.meta.env.VITE_API_URL}/api/patients/me`
          break
        case 'RadiologyCenter':
          endpoint = `${import.meta.env.VITE_API_URL}/api/radiology-centers/me`
          break
        case 'Secretary':
          endpoint = `${import.meta.env.VITE_API_URL}/api/secretaries/me`
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
          statsEndpoint = `${import.meta.env.VITE_API_URL}/api/dentists/dashboard-stats`
          break
        case 'RadiologyCenter':
          statsEndpoint = `${import.meta.env.VITE_API_URL}/api/radiology-requests/stats`
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

  // Not found placeholder - defined before useMemo to avoid initialization errors
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

  // Render tab content based on active tab and user role - memoized to prevent unnecessary re-renders
  const renderTabContent = useMemo(() => {
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
  }, [activeTab, currentUser, userData, stats, appointments, isDarkMode])

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
        <LoadingSpinner size="lg" />
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
        onOpenChatbot={onOpenChatbot}
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

      {/* Main Content with dynamic left margin based on sidebar state (only on desktop) */}
      <div className={`pt-20 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-72' : 'lg:ml-0'}`}>
        <div className="p-4 md:p-8">
          {renderTabContent}
        </div>
      </div>
    </div>
  )
}

export default UnifiedDashboard
