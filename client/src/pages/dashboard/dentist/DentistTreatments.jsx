import { useState, useEffect, useMemo } from 'react'
import { useTheme } from '../../../contexts/ThemeContext'
import {
  FaStethoscope,
  FaPlus,
  FaSearch,
  FaTh,
  FaListAlt,
  FaCheck,
  FaEye,
  FaEdit,
  FaTrash,
  FaDollarSign,
  FaCalendarAlt,
  FaTooth,
  FaMoneyBillWave,
  FaXRay,
  FaExclamationTriangle,
  FaArrowLeft,
  FaSave,
  FaPrescriptionBottle
} from 'react-icons/fa'
import { Card, Button, Input, LoadingSpinner, TreatmentModal, TreatmentDetailsModal, PaymentModal, RadiologyRequestModal, ConfirmationModal, NewAppointmentModal, TreatmentTeethStatus, TreatmentPlanCard, PrescriptionModal, Toast } from '../../../components'
import { treatmentsAPI, patientsAPI, radiologyAPI, paymentsAPI, appointmentsAPI } from '../../../services/api'
import { calculateRemainingBalance, safeJsonParse, ensureArray, sumField, countWhere, normalizeStatus } from '../../../utils/helpers'

const DentistTreatments = ({ appointmentData: propsAppointmentData }) => {
  const { isDarkMode } = useTheme()
  const [activeView, setActiveView] = useState('all') // active, completed, all
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('In Progress')
  const [viewMode, setViewMode] = useState('grid') // grid or list
  
  // Page view state: 'list', 'view', 'new', 'edit'
  const [currentPage, setCurrentPage] = useState('list')
  
  // Modals state (now only for smaller modals like payment, radiology, delete)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isRadiologyModalOpen, setIsRadiologyModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false)
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false)
  const [selectedTreatment, setSelectedTreatment] = useState(null)
  const [appointmentDataState, setAppointmentDataState] = useState(null)
  
  // Data states
  const [treatments, setTreatments] = useState([])
  const [patients, setPatients] = useState([])
  const [appointments, setAppointments] = useState([])
  const [radiologyCenters, setRadiologyCenters] = useState([])
  const [payments, setPayments] = useState([])
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)

  // Fetch data on mount
  useEffect(() => {
    fetchAllData()
  }, [])

  // Debounce search term to avoid excessive filtering
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300) // 300ms delay

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Check if coming from appointment (via props or sessionStorage)
  useEffect(() => {
    // Check sessionStorage for appointment context from appointments page
    const storedContext = sessionStorage.getItem('createTreatmentFromAppointment')
    if (storedContext) {
      try {
        const appointmentContext = JSON.parse(storedContext)
        console.log('Found appointment context in sessionStorage:', appointmentContext)
        setAppointmentDataState(appointmentContext)
        setCurrentPage('new')
        // Clear from sessionStorage after using it
        sessionStorage.removeItem('createTreatmentFromAppointment')
      } catch (err) {
        console.error('Error parsing appointment context:', err)
      }
    } else if (propsAppointmentData && !appointmentDataState) {
      setAppointmentDataState(propsAppointmentData)
      setCurrentPage('new')
    } else if (!propsAppointmentData && appointmentDataState && !storedContext) {
      // Clear appointment data when prop is cleared and no sessionStorage data
      setAppointmentDataState(null)
    }
  }, [propsAppointmentData])
  
  // Clear appointment context when leaving the new treatment page
  useEffect(() => {
    if (currentPage !== 'new' && appointmentDataState?.fromAppointment) {
      setAppointmentDataState(null)
    }
  }, [currentPage])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [treatmentsRes, patientsRes, appointmentsRes, radiologyRes] = await Promise.all([
        treatmentsAPI.getDentistTreatments(),
        patientsAPI.getAll(),
        appointmentsAPI.getDentistAppointments(),
        radiologyAPI.getAll('limit=100&isActive=true')
      ])
      
      setTreatments(treatmentsRes.treatments || [])
      setPatients(patientsRes.patients || [])
      setAppointments(appointmentsRes.appointments || [])
      setRadiologyCenters(radiologyRes)
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Transform treatment data from API - MEMOIZED to avoid re-parsing on every render
  const displayTreatments = useMemo(() => {
    return treatments.map(treatment => {
      // Parse teethStatus if it's a string, otherwise use as-is
      const teethStatus = typeof treatment.teethStatus === 'string'
        ? ensureArray(safeJsonParse(treatment.teethStatus, []))
        : ensureArray(treatment.teethStatus)

      // Convert database status to display format
      const statusMap = {
        'IN_PROGRESS': 'In Progress',
        'COMPLETED': 'Completed',
        'CANCELLED': 'Cancelled'
      }

      return {
        id: treatment.id,
        patientId: treatment.patientId,
        patientName: `${treatment.patient.firstName} ${treatment.patient.lastName}`,
        dentistId: treatment.dentistId,
        treatmentType: treatment.treatmentType,
        description: treatment.description || '',
        status: treatment.status, // Keep original status for receipt
        treatmentStatus: statusMap[treatment.status] || treatment.status,
        creationDate: treatment.createdAt,
        totalAmount: treatment.totalAmount || 0,
        treatmentDiscount: treatment.treatmentDiscount || 0,
        paidAmount: treatment.paidAmount || 0,
        notes: treatment.notes || '',
        priority: 'Medium', // TODO: Add priority field to schema
        teethStatus: teethStatus,
        dentist: treatment.dentist, // Include dentist object with nested clinic
        patient: treatment.patient // Include full patient object
      }
    })
  }, [treatments]) // Only recalculate when treatments data changes

  // Update selectedTreatment when treatments data changes
  useEffect(() => {
    if (selectedTreatment && displayTreatments.length > 0) {
      const updatedTreatment = displayTreatments.find(t => t.id === selectedTreatment.id)
      if (updatedTreatment) {
        setSelectedTreatment(updatedTreatment)
      }
    }
  }, [displayTreatments])

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress':
      case 'IN_PROGRESS':
        return isDarkMode 
          ? 'bg-green-900/30 text-green-400 border-green-600' 
          : 'bg-green-100 text-green-700 border-green-400'
      case 'Completed':
      case 'COMPLETED':
        return isDarkMode 
          ? 'bg-blue-900/30 text-blue-400 border-blue-600' 
          : 'bg-blue-100 text-blue-700 border-blue-400'
      case 'Cancelled':
      case 'CANCELLED':
        return isDarkMode 
          ? 'bg-red-900/30 text-red-400 border-red-600' 
          : 'bg-red-100 text-red-700 border-red-400'
      default:
        return isDarkMode 
          ? 'bg-gray-800 text-gray-300 border-gray-600' 
          : 'bg-white text-gray-700 border-gray-300'
    }
  }

  // Transform patients for modal - MEMOIZED to avoid filtering on every render
  const mockPatients = useMemo(() => {
    return patients
      .filter(p => {
        // Check if this patient has any CONFIRMED appointments
        return appointments.some(apt => apt.patientId === p.userId && apt.status === 'CONFIRMED')
      })
      .map(p => ({
        id: p.userId,
        name: `${p.firstName} ${p.lastName}`
      }))
  }, [patients, appointments]) // Only recalculate when patients or appointments change

  // Transform radiology centers for modal - MEMOIZED
  const mockRadiologyCenters = useMemo(() => {
    const centers = radiologyCenters.data || radiologyCenters.radiology || radiologyCenters || []
    return centers
      .filter(r => r.user && r.user.status === 'ACTIVE')
      .map(r => ({
        id: r.userId,
        name: r.centerName,
        supportedTypes: r.supportedTypes || []
      }))
  }, [radiologyCenters])

  // Filter treatments - MEMOIZED to avoid filtering on every render
  const filteredTreatments = useMemo(() => {
    return displayTreatments.filter(treatment => {
      const matchesSearch = debouncedSearchTerm === '' || 
                           treatment.patientName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                           treatment.treatmentType.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                           treatment.teethStatus?.some(t => t.toothNumber.toString().includes(debouncedSearchTerm))
      
      const matchesView = activeView === 'all' || 
                         (activeView === 'active' && treatment.treatmentStatus === 'In Progress') ||
                         (activeView === 'completed' && treatment.treatmentStatus === 'Completed')
      
      const matchesStatus = selectedStatus === 'all' || treatment.treatmentStatus === selectedStatus
      
      return matchesSearch && matchesView && matchesStatus
    })
  }, [displayTreatments, debouncedSearchTerm, activeView, selectedStatus])

  // Calculate stats - MEMOIZED to avoid recalculating on every render
  const stats = useMemo(() => {
    const total = displayTreatments.length
    const active = countWhere(displayTreatments, t => normalizeStatus(t.treatmentStatus) === 'IN_PROGRESS')
    const completed = countWhere(displayTreatments, t => normalizeStatus(t.treatmentStatus) === 'COMPLETED')
    const totalRevenue = sumField(displayTreatments, 'paidAmount')
    const pendingPayments = displayTreatments.reduce((sum, t) => 
      sum + calculateRemainingBalance(t.totalAmount, t.paidAmount), 0)
    
    return { total, active, completed, totalRevenue, pendingPayments }
  }, [displayTreatments])

  // Fetch payments and prescriptions for a specific treatment
  const fetchTreatmentPayments = async (treatmentId) => {
    try {
      const response = await paymentsAPI.getByTreatment(treatmentId)
      
      setPayments(response.payments || [])
    } catch (error) {
      console.error('Error fetching payments:', error)
      setPayments([])
    }
  }

  const fetchTreatmentPrescriptions = async (treatmentId) => {
    try {
      const response = await treatmentsAPI.getPrescriptions(treatmentId)
      
      setPrescriptions(response.prescriptions || [])
    } catch (error) {
      console.error('Error fetching prescriptions:', error)
      setPrescriptions([])
    }
  }

  // Navigation handlers
  const handleBackToList = () => {
    setCurrentPage('list')
    setSelectedTreatment(null)
    setAppointmentDataState(null)
    setPayments([])
    setPrescriptions([])
  }

  // Modal handlers
  const handleNewTreatment = () => {
    setSelectedTreatment(null)
    setCurrentPage('new')
  }

  const handleSaveNewTreatment = async (treatmentData) => {
    try {
      // Prepare data for API (convert string IDs to integers)
      const apiData = {
        patientId: parseInt(treatmentData.patientId),
        treatmentType: treatmentData.treatmentType,
        description: treatmentData.description,
        totalAmount: parseFloat(treatmentData.totalAmount) || 0,
        notes: treatmentData.notes,
        teethStatus: treatmentData.teethStatus || []
      }
      
      const response = await treatmentsAPI.create(apiData)
      
      // If this treatment is linked to an appointment, update the appointment
      if (treatmentData.appointmentId && response.treatment?.id) {
        try {
          const appointmentId = parseInt(treatmentData.appointmentId)
          
          const updateResponse = await appointmentsAPI.update(appointmentId, {
            treatmentId: response.treatment.id
          })
        } catch (linkError) {
          console.error('Error linking appointment to treatment:', linkError)
          console.error('Link error details:', linkError.response?.data)
          // Don't fail the whole operation if linking fails
          setToast({ message: 'Treatment created but failed to link with appointment. Please link manually if needed.', type: 'error' })
        }
      }
      
      setToast({ message: 'Treatment created successfully!', type: 'success' })
      await fetchAllData()
      handleBackToList()
    } catch (error) {
      console.error('========================================')
      console.error('ERROR in handleSaveNewTreatment:')
      console.error('Error:', error)
      console.error('Error response:', error.response?.data)
      console.error('========================================')
      setToast({ message: error.response?.data?.error || 'Failed to create treatment. Please try again.', type: 'error' })
    }
  }

  const handleUpdateTreatment = async (treatmentData) => {
    try {
      // Prepare data for API
      const apiData = {
        patientId: parseInt(treatmentData.patientId),
        treatmentType: treatmentData.treatmentType,
        description: treatmentData.description,
        totalAmount: parseFloat(treatmentData.totalAmount) || 0,
        notes: treatmentData.notes,
        teethStatus: treatmentData.teethStatus || []
      }
      
      const response = await treatmentsAPI.update(selectedTreatment.id, apiData)
      
      setToast({ message: 'Treatment updated successfully!', type: 'success' })
      await fetchAllData()
      handleBackToList()
    } catch (error) {
      console.error('Error updating treatment:', error)
      console.error('Error response:', error.response?.data)
      setToast({ message: error.response?.data?.error || 'Failed to update treatment. Please try again.', type: 'error' })
    }
  }

  const handleViewTreatment = async (treatment) => {
    setSelectedTreatment(treatment)
    setCurrentPage('view')
    await fetchTreatmentPayments(treatment.id)
    await fetchTreatmentPrescriptions(treatment.id)
  }

  const handleRefreshTreatment = async () => {
    // Refresh the current treatment data after tooth completion
    if (selectedTreatment) {
      await fetchAllData()
    }
  }

  const handleEditTreatment = async (treatment) => {
    setSelectedTreatment(treatment)
    setCurrentPage('edit')
    await fetchTreatmentPayments(treatment.id)
    await fetchTreatmentPrescriptions(treatment.id)
  }

  const handleDeleteTreatment = (treatment) => {
    setSelectedTreatment(treatment)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    try {
      console.log('Deleting treatment:', selectedTreatment.id)
      await treatmentsAPI.delete(selectedTreatment.id)
      setToast({ message: 'Treatment deleted successfully!', type: 'success' })
      await fetchAllData()
      setIsDeleteModalOpen(false)
      setSelectedTreatment(null)
    } catch (error) {
      console.error('Error deleting treatment:', error)
      console.error('Error response:', error.response?.data)
      setToast({ message: error.response?.data?.error || 'Failed to delete treatment. Please try again.', type: 'error' })
    }
  }

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setSelectedTreatment(null)
  }

  const handleUpdateStatus = async (treatmentId, newStatus) => {
    try {
      // Convert status to database format (e.g., "Completed" -> "COMPLETED")
      const dbStatus = newStatus.toUpperCase().replace(' ', '_')
      console.log('Updating treatment status:', treatmentId, dbStatus)
      
      await treatmentsAPI.update(treatmentId, { status: dbStatus })
      setToast({ message: 'Treatment status updated successfully!', type: 'success' })
      await fetchAllData()
    } catch (error) {
      console.error('Error updating treatment status:', error)
      console.error('Error response:', error.response?.data)
      setToast({ message: error.response?.data?.error || 'Failed to update treatment status. Please try again.', type: 'error' })
    }
  }

  const handleAddPayment = (treatment) => {
    setSelectedTreatment(treatment)
    setIsPaymentModalOpen(true)
  }

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false)
    setSelectedTreatment(null)
  }

  const handleSavePayment = async (paymentData) => {
    try {
      console.log('Creating payment:', paymentData)
      const response = await paymentsAPI.create(paymentData)
      console.log('Payment created:', response)
      
      // Wait a brief moment for database consistency
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Refresh all data to get updated treatment amounts
      await fetchAllData()
      
      setToast({ message: 'Payment recorded successfully!', type: 'success' })
      setIsPaymentModalOpen(false)
      setSelectedTreatment(null)
    } catch (error) {
      console.error('Error creating payment:', error)
      console.error('Error response:', error.response?.data)
      setToast({ message: error.response?.data?.error || 'Failed to record payment. Please try again.', type: 'error' })
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
      console.log('Creating appointment:', appointmentData)
      await appointmentsAPI.create(appointmentData)
      setToast({ message: 'Appointment booked successfully!', type: 'success' })
      setIsAppointmentModalOpen(false)
      setSelectedTreatment(null)
    } catch (error) {
      console.error('Error creating appointment:', error)
      setToast({ message: error.response?.data?.error || 'Failed to book appointment. Please try again.', type: 'error' })
    }
  }

  const handleRequestRadiology = (treatment) => {
    // Don't change selectedTreatment if it's already set (e.g., from view page)
    // Just open the modal with the current treatment
    if (!selectedTreatment) {
      setSelectedTreatment(treatment)
    }
    setIsRadiologyModalOpen(true)
  }

  const handleCloseRadiologyModal = () => {
    setIsRadiologyModalOpen(false)
    // Don't clear selectedTreatment - let the page state handle it
  }

  const handleSaveRadiologyRequest = async (requestData) => {
    try {
      console.log('Creating radiology request:', requestData)
      
      // Prepare data for backend - remove requestDate as it's set by backend
      const apiData = {
        patientId: parseInt(requestData.patientId),
        radiologyCenterId: parseInt(requestData.radiologyCenterId),
        treatmentId: requestData.treatmentId ? parseInt(requestData.treatmentId) : null,
        imagingType: requestData.imagingType,
        notes: requestData.notes || ''
      }
      
      const { radiologyRequestsAPI } = await import('../../../services/api')
      const response = await radiologyRequestsAPI.create(apiData)
      console.log('Radiology request created:', response)
      setToast({ message: 'Radiology request created successfully!', type: 'success' })
      setIsRadiologyModalOpen(false)
      // Don't clear selectedTreatment if we're in view mode
      if (currentPage === 'list') {
        setSelectedTreatment(null)
      }
    } catch (error) {
      console.error('Error creating radiology request:', error)
      console.error('Error response:', error.response?.data)
      setToast({ message: error.response?.data?.error || 'Failed to create radiology request. Please try again.', type: 'error' })
    }
  }

  const handleCreatePrescription = (treatment) => {
    // Don't change selectedTreatment if it's already set (e.g., from view page)
    if (!selectedTreatment) {
      setSelectedTreatment(treatment)
    }
    setIsPrescriptionModalOpen(true)
  }

  const handleClosePrescriptionModal = () => {
    setIsPrescriptionModalOpen(false)
    // Don't clear selectedTreatment - let the page state handle it
  }

  const handleSavePrescription = async (prescriptionData) => {
    try {
      console.log('Creating prescription:', prescriptionData)
      
      const treatmentId = selectedTreatment?.id || prescriptionData.treatmentId
      if (!treatmentId) {
        setToast({ message: 'Treatment ID is missing', type: 'error' })
        return
      }
      
      // Create prescription via API
      const response = await treatmentsAPI.createPrescription(treatmentId, prescriptionData)
      console.log('Prescription created:', response)
      
      // Refresh prescriptions list if we're viewing the treatment
      if (currentPage === 'view') {
        await fetchTreatmentPrescriptions(treatmentId)
      }
      
      setToast({ message: 'Prescription created successfully! You can view it in the Prescriptions tab.', type: 'success' })
      setIsPrescriptionModalOpen(false)
      // Don't clear selectedTreatment - it's handled by page navigation
    } catch (error) {
      console.error('Error creating prescription:', error)
      setToast({ message: error.response?.data?.error || 'Failed to create prescription. Please try again.', type: 'error' })
    }
  }

  const TreatmentCard = ({ treatment }) => {
    const treatmentDiscount = treatment.treatmentDiscount || 0
    const effectiveTotal = treatment.totalAmount - treatmentDiscount
    const remainingBalance = effectiveTotal - treatment.paidAmount
    const paymentProgress = effectiveTotal > 0 ? (treatment.paidAmount / effectiveTotal) * 100 : 0

    return (
      <Card className={`p-6 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      } hover:shadow-lg transition-shadow`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isDarkMode ? 'bg-teal-900' : 'bg-teal-100'
            }`}>
              <FaStethoscope className="text-teal-600" />
            </div>
            <div>
              <h3 className={`font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>
                {treatment.treatmentType}
              </h3>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {treatment.patientName}
              </p>
            </div>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs border ${
            getStatusColor(treatment.treatmentStatus, isDarkMode)
          }`}>
            {treatment.treatmentStatus}
          </span>
        </div>

        {treatment.description && (
          <p className={`text-sm mb-4 line-clamp-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {treatment.description}
          </p>
        )}

        {/* Teeth Status Preview */}
        {treatment.teethStatus && treatment.teethStatus.length > 0 && (
          <div className="mb-4">
            <TreatmentTeethStatus teethStatus={treatment.teethStatus} compact={true} />
          </div>
        )}

        {/* Payment Info */}
        <div className={`p-3 rounded-lg mb-4 ${
          isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Payment Progress
            </span>
            <span className={`text-xs font-semibold ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {paymentProgress.toFixed(0)}%
            </span>
          </div>
          <div className={`w-full h-2 rounded-full overflow-hidden mb-2 ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
          }`}>
            <div
              className="h-full bg-linear-to-r from-green-500 to-teal-500"
              style={{ width: `${paymentProgress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs">
            <div>
              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                Paid:{' '}
              </span>
              <span className={`font-semibold ${
                isDarkMode ? 'text-green-400' : 'text-green-600'
              }`}>
                ${treatment.paidAmount.toFixed(2)}
              </span>
            </div>
            {treatmentDiscount > 0 && (
              <div>
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  Discount:{' '}
                </span>
                <span className={`font-semibold ${
                  isDarkMode ? 'text-orange-400' : 'text-orange-600'
                }`}>
                  ${treatmentDiscount.toFixed(2)}
                </span>
              </div>
            )}
            <div>
              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                Balance:{' '}
              </span>
              <span className={`font-semibold ${
                remainingBalance > 0
                  ? isDarkMode ? 'text-orange-400' : 'text-orange-600'
                  : isDarkMode ? 'text-green-400' : 'text-green-600'
              }`}>
                ${Math.max(0, remainingBalance).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <FaCalendarAlt className="text-gray-500" />
            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
              {new Date(treatment.creationDate).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FaDollarSign className="text-gray-500" />
            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
              ${treatment.totalAmount.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleViewTreatment(treatment)}
            title="View Details"
          >
            <FaEye className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleEditTreatment(treatment)}
            title="Edit Treatment"
          >
            <FaEdit className="w-4 h-4" />
          </Button>
          {remainingBalance > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleAddPayment(treatment)}
              title="Add Payment"
              className="text-green-600"
            >
              <FaMoneyBillWave className="w-4 h-4" />
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleRequestRadiology(treatment)}
            title="Request Radiology"
            className="text-purple-600"
          >
            <FaXRay className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleCreatePrescription(treatment)}
            title="Create Prescription"
            className="text-blue-600"
          >
            <FaPrescriptionBottle className="w-4 h-4" />
          </Button>
          {treatment.treatmentStatus === 'In Progress' && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleUpdateStatus(treatment.id, 'Completed')}
              title="Mark Complete"
              className="text-green-600"
            >
              <FaCheck className="w-4 h-4" />
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            className="text-red-600"
            onClick={() => handleDeleteTreatment(treatment)}
            title="Delete Treatment"
          >
            <FaTrash className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Show New Treatment Page */}
      {currentPage === 'new' && (
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
            <Button
              onClick={() => {
                // The save handler is called from within the modal
                // This button is just for visual consistency
              }}
              className="flex items-center gap-2"
              form="treatment-form"
              type="submit"
            >
              <FaSave className="w-4 h-4" />
              Create Treatment
            </Button>
          </div>
          
          {/* New Treatment Form - Full Page */}
          <TreatmentModal
            isOpen={true}
            onClose={handleBackToList}
            onSave={handleSaveNewTreatment}
            patients={mockPatients}
            initialData={null}
            appointmentData={appointmentDataState}
            asFullPage={true}
          />
        </div>
      )}

      {/* Show Edit Treatment Page */}
      {currentPage === 'edit' && selectedTreatment && (
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
            <Button
              onClick={() => {
                // The save handler is called from within the modal
                // This button is just for visual consistency
              }}
              className="flex items-center gap-2"
              form="treatment-form"
              type="submit"
            >
              <FaSave className="w-4 h-4" />
              Update Treatment
            </Button>
          </div>
          
          {/* Edit Treatment Form - Full Page */}
          <TreatmentModal
            isOpen={true}
            onClose={handleBackToList}
            onSave={handleUpdateTreatment}
            patients={mockPatients}
            initialData={selectedTreatment}
            asFullPage={true}
          />
        </div>
      )}

      {/* Show View Treatment Page */}
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
            <Button
              onClick={() => handleEditTreatment(selectedTreatment)}
              className="flex items-center gap-2"
            >
              <FaEdit className="w-4 h-4" />
              Edit Treatment
            </Button>
          </div>
          
          {/* Treatment Details Content - Full Page Mode */}
          <TreatmentDetailsModal
            isOpen={true}
            onClose={handleBackToList}
            treatmentData={selectedTreatment}
            onEdit={handleEditTreatment}
            onUpdateStatus={handleUpdateStatus}
            onAddPayment={handleAddPayment}
            onRequestRadiology={handleRequestRadiology}
            onCreatePrescription={handleCreatePrescription}
            onRefresh={handleRefreshTreatment}
            payments={payments}
            prescriptions={prescriptions}
            asFullPage={true}
          />
        </div>
      )}

      {/* Show Treatments List Page */}
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
            Manage treatment plans and track progress
          </p>
        </div>
        <Button variant="primary" onClick={handleNewTreatment}>
          <FaPlus className="w-4 h-4 mr-2" />
          New Treatment Plan
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <div className={`w-12 h-12 rounded-full bg-linear-to-r from-teal-600 to-teal-700 flex items-center justify-center`}>
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
            <div className={`w-12 h-12 rounded-full bg-linear-to-r from-blue-600 to-blue-700 flex items-center justify-center`}>
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
            <div className={`w-12 h-12 rounded-full bg-linear-to-r from-green-600 to-green-700 flex items-center justify-center`}>
              <FaCheck className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className={`p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search treatments, patients, or tooth numbers..."
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

      {/* Treatments Grid/List - Show loading state here */}
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
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredTreatments.map((treatment) => (
            viewMode === 'grid' ? (
              <TreatmentPlanCard 
                key={treatment.id} 
                treatment={treatment}
                onClick={() => handleViewTreatment(treatment)}
                onBookAppointment={handleBookAppointment}
              />
            ) : (
              <TreatmentCard key={treatment.id} treatment={treatment} />
            )
          ))}
        </div>
      )}

      {/* Close Treatments List Page */}
      </>
      )}

      {/* Modals - These work across all pages */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={handleClosePaymentModal}
        onSave={handleSavePayment}
        treatmentInfo={selectedTreatment ? {
          id: selectedTreatment.id,
          treatmentType: selectedTreatment.treatmentType,
          patientName: selectedTreatment.patientName,
          totalAmount: selectedTreatment.totalAmount,
          paidAmount: selectedTreatment.paidAmount
        } : null}
      />

      <NewAppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={handleCloseAppointmentModal}
        onSave={handleSaveAppointment}
        preselectedPatient={selectedTreatment ? {
          id: selectedTreatment.patientId,
          name: selectedTreatment.patientName,
          treatmentId: selectedTreatment.id
        } : null}
      />

      <RadiologyRequestModal
        isOpen={isRadiologyModalOpen}
        onClose={handleCloseRadiologyModal}
        onSave={handleSaveRadiologyRequest}
        patients={mockPatients}
        radiologyCenters={mockRadiologyCenters}
        treatments={displayTreatments}
        patientInfo={selectedTreatment ? {
          id: selectedTreatment.patientId,
          name: selectedTreatment.patientName
        } : null}
        treatmentInfo={selectedTreatment ? {
          id: selectedTreatment.id,
          treatmentType: selectedTreatment.treatmentType
        } : null}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        item={selectedTreatment}
        action="delete"
        itemName={selectedTreatment?.treatmentType || 'Treatment'}
        itemType="Treatment"
      />

      <PrescriptionModal
        isOpen={isPrescriptionModalOpen}
        onClose={handleClosePrescriptionModal}
        onSave={handleSavePrescription}
        patientInfo={selectedTreatment ? {
          id: selectedTreatment.patientId,
          name: selectedTreatment.patientName
        } : null}
        treatmentInfo={selectedTreatment ? {
          id: selectedTreatment.id,
          treatmentType: selectedTreatment.treatmentType
        } : null}
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

export default DentistTreatments
