import { useState, useEffect, useMemo } from 'react'
import { 
  FaStethoscope,
  FaSearch,
  FaUser,
  FaTooth,
  FaCheck,
  FaExclamationTriangle,
  FaDollarSign,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaArrowLeft,
  FaEye
} from 'react-icons/fa'
import { Card, Button, Input, LoadingSpinner, TreatmentDetailsModal, TreatmentPlanCard, NewAppointmentModal } from '../../../components'
import { useTheme } from '../../../contexts/ThemeContext'
import { treatmentsAPI, paymentsAPI, appointmentsAPI } from '../../../services/api'
import { sumField, countWhere, calculateRemainingBalance, normalizeStatus } from '../../../utils/helpers'

const ClinicTreatments = ({ userData, onTabChange }) => {
  const { isDarkMode } = useTheme()
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  
  // Page view state: 'list', 'view'
  const [currentPage, setCurrentPage] = useState('list')
  const [selectedTreatment, setSelectedTreatment] = useState(null)
  
  // Modal state
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false)
  
  // Data states
  const [treatments, setTreatments] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch data on mount
  useEffect(() => {
    fetchAllData()
  }, [])

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch clinic-specific treatments (filtered by backend)
      const treatmentsResponse = await treatmentsAPI.getClinicTreatments()
      setTreatments(treatmentsResponse.treatments || [])
    } catch (err) {
      console.error('Error fetching treatments:', err)
      setError('Failed to load treatments. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Transform treatment data from API - MEMOIZED
  const displayTreatments = useMemo(() => {
    return treatments.map(treatment => {
      const totalTeeth = treatment.teethStatus ? (Array.isArray(treatment.teethStatus) ? treatment.teethStatus.length : 0) : 0
      const completedTeeth = treatment.teethStatus && Array.isArray(treatment.teethStatus) 
        ? treatment.teethStatus.filter(tooth => tooth.status === 'Completed').length 
        : 0
      const teethProgress = totalTeeth > 0 ? (completedTeeth / totalTeeth) * 100 : 0

      return {
        id: treatment.id,
        patientId: treatment.patientId,
        dentistId: treatment.dentistId,
        clinicId: treatment.dentist?.clinicId || treatment.clinicId,
        patientName: `${treatment.patient.firstName} ${treatment.patient.lastName}`,
        dentistName: `Dr. ${treatment.dentist.firstName} ${treatment.dentist.lastName}`,
        clinicName: treatment.dentist?.clinic?.clinicName,
        treatmentType: treatment.treatmentType,
        treatmentStatus: treatment.status === 'COMPLETED' ? 'Completed' : 
                        treatment.status === 'IN_PROGRESS' ? 'In Progress' : 'Cancelled',
        status: treatment.status,
        description: treatment.description || '',
        startDate: treatment.createdAt,
        creationDate: treatment.createdAt,
        totalAmount: treatment.totalAmount || 0,
        treatmentDiscount: treatment.treatmentDiscount || 0,
        paidAmount: treatment.paidAmount || 0,
        notes: treatment.notes || '',
        teethStatus: treatment.teethStatus || [],
        totalTeeth,
        completedTeeth,
        teethProgress,
        dentist: treatment.dentist,
        patient: treatment.patient,
        rawData: treatment
      }
    })
  }, [treatments])

  // Update selectedTreatment when treatments data changes
  useEffect(() => {
    if (selectedTreatment && displayTreatments.length > 0) {
      const updated = displayTreatments.find(t => t.id === selectedTreatment.id)
      if (updated) {
        setSelectedTreatment(updated)
      }
    }
  }, [displayTreatments])

  // Filter treatments - MEMOIZED
  const filteredTreatments = useMemo(() => {
    return displayTreatments.filter(treatment => {
      const matchesSearch = 
        treatment.patientName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        treatment.dentistName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        treatment.treatmentType.toLowerCase().includes(debouncedSearchTerm.toLowerCase())

      const matchesStatus = selectedStatus === 'all' || treatment.treatmentStatus === selectedStatus

      return matchesSearch && matchesStatus
    })
  }, [displayTreatments, debouncedSearchTerm, selectedStatus])

  // Calculate stats - MEMOIZED
  const stats = useMemo(() => {
    const total = displayTreatments.length
    const active = countWhere(displayTreatments, t => normalizeStatus(t.treatmentStatus) === 'IN_PROGRESS')
    const completed = countWhere(displayTreatments, t => normalizeStatus(t.treatmentStatus) === 'COMPLETED')
    const totalRevenue = sumField(displayTreatments, 'paidAmount')
    const pendingPayments = displayTreatments.reduce((sum, t) => 
      sum + calculateRemainingBalance(t.totalAmount, t.paidAmount, t.treatmentDiscount), 0)
    
    return { total, active, completed, totalRevenue, pendingPayments }
  }, [displayTreatments])

  // Fetch payments for a specific treatment
  const fetchTreatmentPayments = async (treatmentId) => {
    try {
      const response = await paymentsAPI.getByTreatment(treatmentId)
      setPayments(response.payments || [])
    } catch (error) {
      console.error('Error fetching payments:', error)
      setPayments([])
    }
  }

  // Navigation handlers
  const handleBackToList = () => {
    setCurrentPage('list')
    setSelectedTreatment(null)
    setPayments([])
  }

  const handleViewTreatment = async (treatment) => {
    setSelectedTreatment(treatment)
    setCurrentPage('view')
    await fetchTreatmentPayments(treatment.id)
  }

  const handleRefreshTreatment = async () => {
    // Refresh the current treatment data
    if (selectedTreatment) {
      await fetchAllData()
    }
  }

  const handleBookAppointment = (treatment) => {
    setSelectedTreatment(treatment)
    setIsAppointmentModalOpen(true)
  }

  const handleCloseAppointmentModal = () => {
    setIsAppointmentModalOpen(false)
    setSelectedTreatment(null)
  }

  const handleSaveAppointment = async (appointmentData) => {
    try {
      await appointmentsAPI.create(appointmentData)
      alert('Appointment booked successfully!')
      handleCloseAppointmentModal()
      await fetchAllData()
    } catch (error) {
      console.error('Error booking appointment:', error)
      alert('Failed to book appointment. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      {/* View Treatment Page */}
      {currentPage === 'view' && selectedTreatment && (
        <div>
          {/* Back Button Header */}
          <div className="mb-6 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handleBackToList}
              className="flex items-center gap-2"
            >
              <FaArrowLeft className="w-4 h-4" />
              Back to Treatments
            </Button>
          </div>
          
          {/* Treatment Details - Full Page Mode (Read-only for Clinic) */}
          <TreatmentDetailsModal
            isOpen={true}
            onClose={handleBackToList}
            treatmentData={selectedTreatment}
            onEdit={null}
            onUpdateStatus={null}
            onAddPayment={null}
            onRequestRadiology={null}
            onRefresh={handleRefreshTreatment}
            payments={payments}
            asFullPage={true}
            readOnly={true}
          />
        </div>
      )}

      {/* Treatments List Page */}
      {currentPage === 'list' && (
        <>
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>
                Treatment Management
              </h1>
              <p className={`mt-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                View and track treatment plans for all clinic patients
              </p>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <Card className={`p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Total Treatments</p>
                  <p className={`text-2xl font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}>{loading ? '-' : stats.total}</p>
                </div>
                <div className={`w-12 h-12 rounded-full bg-gradient-to-r from-teal-600 to-teal-700 flex items-center justify-center`}>
                  <FaStethoscope className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            <Card className={`p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Active</p>
                  <p className={`text-2xl font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}>{loading ? '-' : stats.active}</p>
                </div>
                <div className={`w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center`}>
                  <FaExclamationTriangle className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            <Card className={`p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Completed</p>
                  <p className={`text-2xl font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}>{loading ? '-' : stats.completed}</p>
                </div>
                <div className={`w-12 h-12 rounded-full bg-gradient-to-r from-green-600 to-green-700 flex items-center justify-center`}>
                  <FaCheck className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            <Card className={`p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Total Revenue</p>
                  <p className={`text-2xl font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}>{loading ? '-' : `$${stats.totalRevenue.toFixed(0)}`}</p>
                </div>
                <div className={`w-12 h-12 rounded-full bg-gradient-to-r from-green-600 to-emerald-700 flex items-center justify-center`}>
                  <FaDollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            <Card className={`p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Pending</p>
                  <p className={`text-2xl font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}>{loading ? '-' : `$${stats.pendingPayments.toFixed(0)}`}</p>
                </div>
                <div className={`w-12 h-12 rounded-full bg-gradient-to-r from-orange-600 to-orange-700 flex items-center justify-center`}>
                  <FaMoneyBillWave className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card className={`p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search treatments, patients, or dentists..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={FaSearch}
                />
              </div>
              <div className="flex gap-4">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className={`px-3 py-2 border rounded-lg ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="all">All Status</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Treatments Display */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <LoadingSpinner size="lg" text="Loading treatments..." />
            </div>
          ) : error ? (
            <Card className={`p-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="text-center">
                <FaExclamationTriangle className={`w-12 h-12 mx-auto mb-4 ${
                  isDarkMode ? 'text-red-400' : 'text-red-500'
                }`} />
                <p className={`text-lg font-medium mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  Error Loading Data
                </p>
                <p className={`mb-4 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {error}
                </p>
                <Button onClick={fetchAllData}>
                  Try Again
                </Button>
              </div>
            </Card>
          ) : filteredTreatments.length === 0 ? (
            <Card className={`p-8 text-center ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <FaStethoscope className={`w-12 h-12 mx-auto mb-4 ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`} />
              <h3 className={`text-lg font-semibold mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                No treatments found
              </h3>
              <p className={`${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                No treatments match your current filters
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTreatments.map((treatment) => (
                <TreatmentPlanCard 
                  key={treatment.id} 
                  treatment={treatment}
                  onClick={() => handleViewTreatment(treatment)}
                  onBookAppointment={handleBookAppointment}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Appointment Modal */}
      <NewAppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={handleCloseAppointmentModal}
        onSave={handleSaveAppointment}
        preselectedPatient={selectedTreatment ? {
          id: selectedTreatment.patientId,
          name: selectedTreatment.patientName,
          treatmentId: selectedTreatment.id
        } : null}
        preselectedDentist={selectedTreatment ? {
          id: selectedTreatment.dentistId,
          name: selectedTreatment.dentistName,
          clinicId: selectedTreatment.clinicId
        } : null}
      />
    </div>
  )
}

export default ClinicTreatments
