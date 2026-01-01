import { useState, useEffect, useMemo } from 'react'
import { 
  FaUser,
  FaUsers,
  FaTooth,
  FaDollarSign,
  FaExclamationCircle,
  FaSearch,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaBirthdayCake,
  FaArrowLeft
} from 'react-icons/fa'
import { Card, Button, Input, PageHeader, StatsOverview, PatientDetailsModal, PatientCard, LoadingState, ErrorState, EmptyState, FilterBar } from '../../../components'
import { useTheme } from '../../../contexts/ThemeContext'
import { patientsAPI, treatmentsAPI, appointmentsAPI } from '../../../services/api'
import { calculateRemainingBalance } from '../../../utils/helpers'
import { useDebounce } from '../../../hooks'

const ClinicPatients = ({ userData, onTabChange }) => {
  const { isDarkMode } = useTheme()
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const [filtering, setFiltering] = useState(false)
  const [currentPage, setCurrentPage] = useState('list') // 'list' or 'view'
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [patientTreatments, setPatientTreatments] = useState([])
  const [patientAppointments, setPatientAppointments] = useState([])
  const [patientPayments, setPatientPayments] = useState([])
  
  // Stats state
  const [stats, setStats] = useState({
    totalPatients: 0,
    activeTreatments: 0,
    totalRevenue: 0,
    pendingPayments: 0
  })

  // Fetch patients on mount
  useEffect(() => {
    fetchPatientsAndStats()
  }, [])

  const fetchPatientsAndStats = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Get all patients for clinic
      const patientsRes = await patientsAPI.getAll()
      const apiPatients = patientsRes.patients || []
      
      // Transform patients to expected format
      const transformedPatients = apiPatients.map(patient => ({
        id: patient.userId,
        name: `${patient.firstName} ${patient.lastName}`,
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.user?.email || 'N/A',
        phone: patient.user?.phone || 'N/A',
        dateOfBirth: patient.birthDate,
        city: patient.city,
        gender: patient.gender,
        status: patient.user?.status === 'ACTIVE' ? 'active' : 'inactive',
        avatar: patient.user?.profileImage,
        birthDate: patient.birthDate
      }))
      
      setPatients(transformedPatients)
      
      // Get clinic-specific treatments to calculate stats
      const treatmentsRes = await treatmentsAPI.getClinicTreatments()
      const treatments = treatmentsRes.treatments || []
      
      // Calculate stats from treatments
      const activeTreatments = treatments.filter(t => t.status === 'IN_PROGRESS').length
      const totalRevenue = treatments.reduce((sum, t) => sum + (t.paidAmount || 0), 0)
      const pendingPayments = treatments.reduce((sum, t) => {
        const remaining = calculateRemainingBalance(t.totalAmount || 0, t.paidAmount || 0)
        return sum + (remaining > 0 ? remaining : 0)
      }, 0)
      
      setStats({
        totalPatients: transformedPatients.length,
        activeTreatments,
        totalRevenue,
        pendingPayments
      })
    } catch (err) {
      console.error('Error fetching patients and stats:', err)
      setError('Failed to load patients. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Transform patient data from API (not needed as we're already transforming in fetch)
  const transformPatients = (apiPatients) => {
    return apiPatients.map(patient => ({
      id: patient.userId || patient.id,
      name: `${patient.firstName} ${patient.lastName}`,
      email: patient.user?.email || patient.email || 'N/A',
      phone: patient.user?.phone || patient.phone || 'N/A',
      dateOfBirth: patient.birthDate,
      address: patient.city,
      gender: patient.gender,
      status: patient.user?.status === 'ACTIVE' || patient.status === 'active' ? 'active' : 'inactive',
      avatar: patient.user?.profileImage || patient.avatar,
      firstName: patient.firstName,
      lastName: patient.lastName,
      city: patient.city,
      birthDate: patient.birthDate
    }))
  }



  // Use transformed patients - memoized for performance
  const transformedPatients = useMemo(() => {
    return patients // Already transformed in fetchPatientsAndStats
  }, [patients])

  // Filter patients - memoized for performance
  const displayPatients = useMemo(() => {
    return transformedPatients.filter(patient => {
      const matchesSearch = patient.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                           patient.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                           patient.phone.includes(debouncedSearchTerm)
      return matchesSearch
    })
  }, [transformedPatients, debouncedSearchTerm])

  const handleClearFilters = () => {
    setSearchTerm('')
  }

  const handleViewPatient = async (patient) => {
    setSelectedPatient(patient)
    setCurrentPage('view')
    
    // Fetch patient's treatments, appointments, and payments
    try {
      const treatmentsResponse = await treatmentsAPI.getClinicTreatments()
      const patientTreatmentsData = treatmentsResponse.treatments.filter(t => t.patientId === patient.id)
      
      // Transform treatments to match expected format
      const transformedTreatments = patientTreatmentsData.map(treatment => ({
        id: treatment.id,
        treatmentName: treatment.treatmentName,
        description: treatment.description,
        status: treatment.status === 'COMPLETED' ? 'Completed' : 
                treatment.status === 'IN_PROGRESS' ? 'In Progress' : 'Cancelled',
        createdAt: treatment.createdAt,
        totalAmount: treatment.totalAmount || 0,
        paidAmount: treatment.paidAmount || 0,
        notes: treatment.notes,
        teethStatus: treatment.teethStatus || []
      }))
      
      setPatientTreatments(transformedTreatments)
      
      // Fetch appointments
      const appointmentsResponse = await appointmentsAPI.getClinicAppointments()
      const patientAppointmentsData = appointmentsResponse.appointments?.filter(a => a.patientId === patient.id) || []
      
      // Keep the original appointment structure for AppointmentsHistoryTab
      setPatientAppointments(patientAppointmentsData)
      
    } catch (error) {
      console.error('Error fetching patient details:', error)
    }
  }

  const handleBackToList = () => {
    setCurrentPage('list')
    setSelectedPatient(null)
  }

  return (
    <div className="space-y-6">
      {/* Show View Patient Page */}
      {currentPage === 'view' && selectedPatient && (
        <div>
          {/* Back Button Header */}
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={handleBackToList}
              className="flex items-center gap-2"
            >
              <FaArrowLeft className="w-4 h-4" />
              Back to Patients
            </Button>
          </div>
          
          {/* Patient Details - Full Page Mode (Read-only for Clinic) */}
          <PatientDetailsModal
            isOpen={true}
            onClose={handleBackToList}
            patientData={selectedPatient}
            onEdit={null}
            asFullPage={true}
            readOnly={true}
            treatments={patientTreatments}
            appointments={patientAppointments}
            payments={patientPayments}
          />
        </div>
      )}

      {/* Show Patients List Page */}
      {currentPage === 'list' && (
        <>
      {/* Page Header */}
      <PageHeader
        title="Clinic Patients"
        description="View and manage patient records"
      />

      {/* Stats Overview */}
      <StatsOverview stats={[
        {
          label: 'Total Patients',
          value: loading ? '-' : stats.totalPatients,
          icon: FaUsers,
          gradient: 'from-blue-600 to-blue-700'
        },
        {
          label: 'Active Treatments',
          value: loading ? '-' : stats.activeTreatments,
          icon: FaTooth,
          gradient: 'from-green-600 to-green-700'
        },
        {
          label: 'Total Revenue',
          value: loading ? '-' : `$${stats.totalRevenue.toFixed(2)}`,
          icon: FaDollarSign,
          gradient: 'from-teal-600 to-teal-700'
        },
        {
          label: 'Pending Payments',
          value: loading ? '-' : `$${stats.pendingPayments.toFixed(2)}`,
          icon: FaExclamationCircle,
          gradient: 'from-orange-600 to-orange-700'
        }
      ]} />

      {/* Search Bar */}
      <Card className={`p-4 mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={(e) => setSearchTerm(e.target.value)}
          debouncedSearchTerm={debouncedSearchTerm}
          searchPlaceholder="Search patients by name, email, or phone..."
          filters={[]}
          onClearFilters={handleClearFilters}
          filtering={filtering}
        />
      </Card>

      {/* Patients Display */}
      {loading ? (
        <Card className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>
          <LoadingState message="Loading patients..." />
        </Card>
      ) : error ? (
        <Card className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>
          <ErrorState 
            message={error}
            onRetry={fetchPatientsAndStats}
          />
        </Card>
      ) : displayPatients.length === 0 ? (
        <Card className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>
          <EmptyState
            icon={FaUser}
            title="No patients found"
            description="No patients match your current search"
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayPatients.map((patient) => (
            <PatientCard key={patient.id} patient={patient} onClick={handleViewPatient} />
          ))}
        </div>
      )}
        </>
      )}
    </div>
  )
}

export default ClinicPatients
