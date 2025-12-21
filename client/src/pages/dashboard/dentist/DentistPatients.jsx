import { useState, useEffect, useMemo } from 'react'
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
import { Card, Input, Button, StatsOverview, PatientDetailsModal, PatientCard } from '../../../components'
import { useTheme } from '../../../contexts/ThemeContext'
import { patientsAPI, treatmentsAPI, paymentsAPI, appointmentsAPI } from '../../../services/api'
import { safeJsonParse, ensureArray } from '../../../utils/helpers'

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
          // Store the complete patient data with user info
          const patientData = {
            ...treatment.patient,
            user: treatment.patient.user || {
              email: treatment.patient.email,
              phone: treatment.patient.phone,
              status: treatment.patient.status || 'ACTIVE'
            }
          }
          patientMap.set(patientId, patientData)
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



  // Use transformed patients - memoized for performance
  const transformedPatients = useMemo(() => {
    return transformPatients(patients)
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

  // Check if we need to open a specific patient (from appointments page)
  useEffect(() => {
    const viewPatientId = sessionStorage.getItem('viewPatientId')
    if (viewPatientId && transformedPatients.length > 0) {
      // Find the patient with this ID
      const patient = transformedPatients.find(p => p.id === parseInt(viewPatientId))
      if (patient) {
        // Clear the session storage
        sessionStorage.removeItem('viewPatientId')
        // Open the patient profile
        handleViewPatient(patient)
      }
    }
  }, [transformedPatients])

  const handleViewPatient = async (patient) => {
    setSelectedPatient(patient)
    setCurrentPage('view')
    
    // Fetch patient's treatments, appointments, and payments
    try {
      const treatmentsResponse = await treatmentsAPI.getDentistTreatments()
      const patientTreatmentsData = treatmentsResponse.treatments.filter(t => t.patientId === patient.id)
      
      // Transform treatments to match expected format
      const transformedTreatments = patientTreatmentsData.map(treatment => {
        const teethStatus = typeof treatment.teethStatus === 'string'
          ? ensureArray(safeJsonParse(treatment.teethStatus, []))
          : ensureArray(treatment.teethStatus)

        const statusMap = {
          'IN_PROGRESS': 'In Progress',
          'COMPLETED': 'Completed',
          'CANCELLED': 'Cancelled'
        }

        return {
          id: treatment.id,
          treatmentName: treatment.treatmentName,
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
      
      // Fetch appointments
      try {
        const appointmentsResponse = await appointmentsAPI.getDentistAppointments()
        const patientAppointmentsData = (appointmentsResponse.appointments || []).filter(
          apt => apt.patientId === patient.id
        )
        setPatientAppointments(patientAppointmentsData)
      } catch (aptError) {
        console.error('Error fetching appointments:', aptError)
        setPatientAppointments([])
      }
      
      // Fetch payments
      try {
        const paymentsResponse = await paymentsAPI.getDentistPayments()
        const patientPaymentsData = (paymentsResponse.payments || []).filter(payment => {
          // Check if payment is for one of this patient's treatments
          return patientTreatmentsData.some(t => t.id === payment.treatmentId)
        })
        setPatientPayments(patientPaymentsData)
      } catch (payError) {
        console.error('Error fetching payments:', payError)
        setPatientPayments([])
      }
      
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
          value: loading ? '-' : stats.totalPatients,
          icon: FaUsers,
          gradient: 'from-blue-600 to-blue-700'
        },
        {
          label: 'Active Treatments',
          value: loading ? '-' : stats.activeTreatments,
          icon: FaTooth,
          gradient: 'from-green-600 to-green-700'
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
            <PatientCard key={patient.id} patient={patient} onClick={handleViewPatient} />
          ))}
        </div>
      )}
        </>
      )}
    </div>
  )
}

export default DentistPatients