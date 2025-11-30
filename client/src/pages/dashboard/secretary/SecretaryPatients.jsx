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
import { Card, Button, Input, StatsOverview, PatientDetailsModal } from '../../../components'
import { useTheme } from '../../../contexts/ThemeContext'
import { patientsAPI, treatmentsAPI, appointmentsAPI } from '../../../services/api'

const SecretaryPatients = ({ userData, onTabChange }) => {
  const { isDarkMode } = useTheme()
  const [searchTerm, setSearchTerm] = useState('')
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
      
      // Get all patients for clinic (secretary route filters by clinic automatically)
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
      
      // Get all treatments for clinic to calculate stats
      const treatmentsRes = await treatmentsAPI.getAll()
      const treatments = treatmentsRes.treatments || []
      
      // Calculate stats from treatments
      const activeTreatments = treatments.filter(t => t.status === 'IN_PROGRESS').length
      const totalRevenue = treatments.reduce((sum, t) => sum + (t.paidAmount || 0), 0)
      const pendingPayments = treatments.reduce((sum, t) => {
        const remaining = (t.totalAmount || 0) - (t.paidAmount || 0)
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

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A'
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    if (isNaN(birthDate.getTime())) return 'N/A'
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const capitalizeFirstLetter = (str) => {
    if (!str) return ''
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Use transformed patients - memoized for performance
  const transformedPatients = useMemo(() => {
    return patients // Already transformed in fetchPatientsAndStats
  }, [patients])

  // Filter patients - memoized for performance
  const displayPatients = useMemo(() => {
    return transformedPatients.filter(patient => {
      const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           patient.phone.includes(searchTerm)
      return matchesSearch
    })
  }, [transformedPatients, searchTerm])

  const handleViewPatient = async (patient) => {
    setSelectedPatient(patient)
    setCurrentPage('view')
    
    // Fetch patient's treatments, appointments, and payments
    try {
      const treatmentsResponse = await treatmentsAPI.getAll()
      const patientTreatmentsData = treatmentsResponse.treatments.filter(t => t.patientId === patient.id)
      
      // Transform treatments to match expected format
      const transformedTreatments = patientTreatmentsData.map(treatment => ({
        id: treatment.id,
        treatmentType: treatment.treatmentType,
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

  const PatientCard = ({ patient }) => {
    const getStatusDisplay = (status) => {
      switch (status?.toLowerCase()) {
        case 'active':
          return {
            label: 'Active',
            className: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700'
          }
        case 'inactive':
          return {
            label: 'Inactive',
            className: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-700'
          }
        default:
          return {
            label: 'Active',
            className: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700'
          }
      }
    }

    const statusDisplay = getStatusDisplay(patient.status)

    return (
      <Card 
        hover 
        onClick={() => handleViewPatient(patient)}
        className="group cursor-pointer"
      >
        <Card.Header className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className={`
                w-12 h-12 rounded-lg flex items-center justify-center
                ${isDarkMode ? 'bg-teal-900/30' : 'bg-teal-100'}
                group-hover:scale-110 transition-transform duration-300
              `}>
                <FaUser className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h3 className={`text-lg font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  {patient.name}
                </h3>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {capitalizeFirstLetter(patient.gender) || 'N/A'} • {calculateAge(patient.dateOfBirth)} years
                </p>
              </div>
            </div>
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusDisplay.className}`}>
              {statusDisplay.label}
            </span>
          </div>
        </Card.Header>

        <Card.Content className="space-y-4">
          {/* Contact Info */}
          <div className={`
            p-3 rounded-lg 
            ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}
          `}>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FaPhone className={`w-4 h-4 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <span className={`text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {patient.phone}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FaEnvelope className={`w-4 h-4 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <span className={`text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {patient.email}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FaMapMarkerAlt className={`w-4 h-4 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <span className={`text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {capitalizeFirstLetter(patient.city)}
                </span>
              </div>
            </div>
          </div>

          {/* Birth Date */}
          <div className="flex items-center gap-2 text-sm">
            <FaBirthdayCake className={`w-4 h-4 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              Born: {patient.dateOfBirth && !isNaN(new Date(patient.dateOfBirth).getTime()) 
                ? new Date(patient.dateOfBirth).toLocaleDateString() 
                : 'N/A'}
            </span>
          </div>
        </Card.Content>
      </Card>
    )
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
          
          {/* Patient Details - Full Page Mode (Read-only for Secretary) */}
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className={`text-2xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            Clinic Patients
          </h1>
          <p className={`mt-1 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            View and manage patient records
          </p>
        </div>
      </div>

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
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search patients by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={FaSearch}
          />
        </div>
      </Card>

      {/* Patients Display */}
      {loading ? (
        <Card className={`p-8 text-center ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
              Loading patients...
            </p>
          </div>
        </Card>
      ) : error ? (
        <Card className={`p-8 text-center ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <FaUsers className={`w-12 h-12 mx-auto mb-4 text-red-500`} />
          <h3 className={`text-lg font-semibold mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Error Loading Patients
          </h3>
          <p className={`mb-4 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {error}
          </p>
          <Button onClick={fetchPatientsAndStats}>
            Try Again
          </Button>
        </Card>
      ) : displayPatients.length === 0 ? (
        <Card className={`p-8 text-center ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <FaUser className={`w-12 h-12 mx-auto mb-4 ${
            isDarkMode ? 'text-gray-500' : 'text-gray-400'
          }`} />
          <h3 className={`text-lg font-semibold mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            No patients found
          </h3>
          <p className={`${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            No patients match your current search
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayPatients.map((patient) => (
            <PatientCard key={patient.id} patient={patient} />
          ))}
        </div>
      )}
        </>
      )}
    </div>
  )
}

export default SecretaryPatients
