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
  FaArrowLeft,
  FaPlus
} from 'react-icons/fa'
import { Card, Button, Input, PageHeader, StatsOverview, PatientDetailsModal, PatientCard, PatientModal, LoadingState, ErrorState, EmptyState, FilterBar, Toast } from '../../../components'
import { useTheme } from '../../../contexts/ThemeContext'
import { patientsAPI, treatmentsAPI, appointmentsAPI, dentistsAPI } from '../../../services/api'
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
  
  // Add Patient Modal states
  const [showAddPatientModal, setShowAddPatientModal] = useState(false)
  const [dentists, setDentists] = useState([])
  const [loadingDentists, setLoadingDentists] = useState(false)
  const [toast, setToast] = useState(null)
  
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
    fetchClinicDentists()
  }, [])

  const fetchClinicDentists = async () => {
    try {
      setLoadingDentists(true)
      const response = await dentistsAPI.getForClinic()
      const allDentists = response.data || response || []
      // Filter to show only ACTIVE dentists
      const activeDentists = allDentists.filter(d => 
        d.userId?.status === 'ACTIVE' || d.user?.status === 'ACTIVE'
      )
      setDentists(activeDentists)
    } catch (error) {
      console.error('Error fetching dentists:', error)
    } finally {
      setLoadingDentists(false)
    }
  }

  const fetchPatientsAndStats = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Get clinic-specific treatments first
      const treatmentsRes = await treatmentsAPI.getClinicTreatments()
      const treatments = treatmentsRes.treatments || []
      
      // Get clinic appointments
      const appointmentsRes = await appointmentsAPI.getClinicAppointments()
      const appointments = appointmentsRes.appointments || []
      
      // Extract unique patients from treatments and appointments
      const patientMap = new Map()
      
      // Add patients from treatments
      treatments.forEach(treatment => {
        if (treatment.patient && !patientMap.has(treatment.patient.userId)) {
          console.log('Treatment patient data:', treatment.patient)
          console.log('Profile image from treatment:', treatment.patient.user?.profileImage)
          patientMap.set(treatment.patient.userId, {
            id: treatment.patient.userId,
            name: `${treatment.patient.firstName} ${treatment.patient.lastName}`,
            firstName: treatment.patient.firstName,
            lastName: treatment.patient.lastName,
            email: treatment.patient.user?.email || 'N/A',
            phone: treatment.patient.user?.phone || 'N/A',
            dateOfBirth: treatment.patient.birthDate,
            city: treatment.patient.city,
            gender: treatment.patient.gender,
            status: treatment.patient.user?.status === 'ACTIVE' ? 'active' : 'inactive',
            avatar: treatment.patient.user?.profileImage,
            birthDate: treatment.patient.birthDate
          })
        }
      })
      
      // Add patients from appointments (if not already added)
      appointments.forEach(apt => {
        if (apt.patient && !patientMap.has(apt.patient.userId)) {
          patientMap.set(apt.patient.userId, {
            id: apt.patient.userId,
            name: `${apt.patient.firstName} ${apt.patient.lastName}`,
            firstName: apt.patient.firstName,
            lastName: apt.patient.lastName,
            email: apt.patient.user?.email || 'N/A',
            phone: apt.patient.user?.phone || 'N/A',
            dateOfBirth: apt.patient.birthDate,
            city: apt.patient.city,
            gender: apt.patient.gender,
            status: apt.patient.user?.status === 'ACTIVE' ? 'active' : 'inactive',
            avatar: apt.patient.user?.profileImage,
            birthDate: apt.patient.birthDate
          })
        }
      })
      
      const transformedPatients = Array.from(patientMap.values())
      setPatients(transformedPatients)
      
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

  const handleAddPatient = () => {
    setShowAddPatientModal(true)
  }

  const handleSaveNewPatient = async (patientData) => {
    try {
      // Create the patient
      const apiData = {
        email: patientData.email,
        password: patientData.password,
        phone: patientData.phone,
        firstName: patientData.firstName,
        lastName: patientData.lastName,
        gender: patientData.gender || 'Male',
        birthDate: patientData.dateOfBirth,
        city: patientData.city
      }

      const response = await patientsAPI.create(apiData)
      const createdPatient = response.patient

      // If a dentist was selected, create an initial treatment to link them
      if (patientData.dentistId) {
        try {
          console.log('Creating treatment with data:', {
            patientId: createdPatient.userId,
            dentistId: parseInt(patientData.dentistId),
            treatmentName: 'Initial Consultation',
            description: 'Patient registered to dentist',
            status: 'IN_PROGRESS',
            totalAmount: 0,
            notes: 'Patient assigned during registration'
          });
          
          const treatmentResponse = await treatmentsAPI.create({
            patientId: createdPatient.userId,
            dentistId: parseInt(patientData.dentistId),
            treatmentName: 'Initial Consultation',
            description: 'Patient registered to dentist',
            status: 'IN_PROGRESS',
            totalAmount: 0,
            notes: 'Patient assigned during registration'
          })
          
          console.log('Treatment created successfully:', treatmentResponse);
        } catch (treatmentError) {
          console.error('Error creating initial treatment:', treatmentError)
          console.error('Error details:', treatmentError.response || treatmentError.message)
          // Don't throw - patient was created successfully
        }
      }

      setToast({ message: 'Patient added successfully!', type: 'success' })
      setShowAddPatientModal(false)
      
      // Refresh the patient list
      fetchPatientsAndStats()
    } catch (error) {
      console.error('Error creating patient:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Failed to create patient'
      setToast({ message: errorMessage, type: 'error' })
      throw error // Re-throw to prevent modal from closing
    }
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
            action={{
              label: 'Add New Patient',
              onClick: handleAddPatient,
              icon: FaPlus,
              gradient: 'from-teal-600 to-cyan-600'
            }}
          />

          {/* Search Bar */}
          <Card className="p-4">
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

      {/* Add Patient Modal */}
      <PatientModal
        isOpen={showAddPatientModal}
        onClose={() => setShowAddPatientModal(false)}
        onSave={handleSaveNewPatient}
        dentists={dentists}
        requireDentist={true}
      />

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}

export default ClinicPatients
