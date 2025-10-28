import { useState, useEffect } from 'react'
import { 
  FaUser,
  FaPhone,
  FaEnvelope,
  FaSearch,
  FaBirthdayCake,
  FaMapMarkerAlt,
  FaArrowLeft,
  FaUsers,
  FaTooth,
  FaDollarSign,
  FaExclamationCircle
} from 'react-icons/fa'
import { Card, Input, Button, StatsOverview } from '../../../components'
import { useTheme } from '../../../contexts/ThemeContext'
import PatientDetailsModal from '../../../components/dentist/PatientDetailsModal'
import { patientsAPI, treatmentsAPI, paymentsAPI } from '../../../services/api'

const DentistPatients = () => {
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
      
      // Get all treatments for this dentist (which include patient data)
      const treatmentsRes = await treatmentsAPI.getDentistTreatments()
      const treatments = treatmentsRes.treatments || []
      
      // Extract unique patients from treatments
      const patientMap = new Map()
      treatments.forEach(treatment => {
        const patientId = treatment.patient.userId
        if (!patientMap.has(patientId)) {
          patientMap.set(patientId, treatment.patient)
        }
      })
      
      const uniquePatients = Array.from(patientMap.values())
      setPatients(uniquePatients)
      
      // Calculate stats from treatments
      const activeTreatments = treatments.filter(t => t.status === 'IN_PROGRESS').length
      const totalRevenue = treatments.reduce((sum, t) => sum + (t.paidAmount || 0), 0)
      const pendingPayments = treatments.reduce((sum, t) => {
        const pending = (t.totalAmount || 0) - (t.paidAmount || 0)
        return sum + (pending > 0 ? pending : 0)
      }, 0)
      
      setStats({
        totalPatients: uniquePatients.length,
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

  // Transform patient data from API
  const transformPatients = (apiPatients) => {
    return apiPatients.map(patient => ({
      id: patient.userId,
      name: `${patient.firstName} ${patient.lastName}`,
      email: patient.user?.email || 'N/A',
      phone: patient.user?.phone || 'N/A',
      dateOfBirth: patient.birthDate,
      address: patient.city,
      gender: patient.gender,
      status: patient.user?.status === 'ACTIVE' ? 'active' : 'inactive',
      avatar: patient.user?.profileImage,
      firstName: patient.firstName,
      lastName: patient.lastName,
      city: patient.city,
      birthDate: patient.birthDate
    }))
  }

  const calculateAge = (dateOfBirth) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
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

  // Use transformed patients
  const displayPatients = transformPatients(patients).filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.phone.includes(searchTerm)
    return matchesSearch
  })

  const handleViewPatient = async (patient) => {
    setSelectedPatient(patient)
    setCurrentPage('view')
    
    // Fetch patient's treatments, appointments, and payments
    try {
      const treatmentsResponse = await treatmentsAPI.getDentistTreatments()
      const patientTreatmentsData = treatmentsResponse.treatments.filter(t => t.patientId === patient.id)
      
      // Transform treatments to match expected format
      const transformedTreatments = patientTreatmentsData.map(treatment => {
        let teethStatus = []
        try {
          if (typeof treatment.teethStatus === 'string') {
            teethStatus = JSON.parse(treatment.teethStatus)
          } else if (Array.isArray(treatment.teethStatus)) {
            teethStatus = treatment.teethStatus
          }
        } catch (e) {
          console.error('Error parsing teethStatus:', e)
        }

        const statusMap = {
          'IN_PROGRESS': 'In Progress',
          'COMPLETED': 'Completed',
          'CANCELLED': 'Cancelled'
        }

        return {
          id: treatment.id,
          treatmentType: treatment.treatmentType,
          status: statusMap[treatment.status] || treatment.status,
          createdAt: treatment.createdAt,
          totalAmount: treatment.totalAmount || 0,
          paidAmount: treatment.paidAmount || 0,
          teethStatus: teethStatus,
          description: treatment.description,
          notes: treatment.notes
        }
      })
      
      setPatientTreatments(transformedTreatments)
      
      // TODO: Fetch appointments and payments when those endpoints are ready
      setPatientAppointments([])
      setPatientPayments([])
      
    } catch (error) {
      console.error('Error fetching patient data:', error)
      setPatientTreatments([])
      setPatientAppointments([])
      setPatientPayments([])
    }
  }

  const handleBackToList = () => {
    setCurrentPage('list')
    setSelectedPatient(null)
  }

  const PatientCard = ({ patient }) => {
    const getStatusDisplay = (status) => {
      switch (status) {
        case 'active':
          return {
            label: 'Active',
            className: isDarkMode 
              ? 'bg-green-900/30 text-green-400 border-green-600' 
              : 'bg-green-100 text-green-700 border-green-400'
          }
        case 'inactive':
          return {
            label: 'Inactive',
            className: isDarkMode 
              ? 'bg-gray-700 text-gray-400 border-gray-600' 
              : 'bg-gray-100 text-gray-600 border-gray-400'
          }
        default:
          return {
            label: status,
            className: isDarkMode 
              ? 'bg-gray-700 text-gray-300 border-gray-600' 
              : 'bg-gray-100 text-gray-700 border-gray-300'
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
          {/* Contact Information */}
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
              Born: {new Date(patient.dateOfBirth).toLocaleDateString()}
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
          
          {/* Patient Details - Full Page Mode (Read-only for Dentist) */}
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
            My Patients
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
          value: stats.totalPatients,
          icon: FaUsers,
          gradient: 'from-blue-600 to-blue-700'
        },
        {
          label: 'Active Treatments',
          value: stats.activeTreatments,
          icon: FaTooth,
          gradient: 'from-green-600 to-green-700'
        },
        {
          label: 'Total Revenue',
          value: `$${stats.totalRevenue.toFixed(2)}`,
          icon: FaDollarSign,
          gradient: 'from-teal-600 to-teal-700'
        },
        {
          label: 'Pending Payments',
          value: `$${stats.pendingPayments.toFixed(2)}`,
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
          <Button onClick={fetchPatients}>
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

export default DentistPatients