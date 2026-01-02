import { useState, useMemo, useEffect } from 'react'
import { 
  FaCalendarAlt,
  FaUser,
  FaPhone,
  FaPlus,
  FaCheck,
  FaTooth,
  FaEnvelope,
  FaStethoscope,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaClock
} from 'react-icons/fa'
import { 
  Button, 
  Input, 
  Select, 
  Card,
  PageHeader, 
  StatusBadge,
  FilterBar,
  DataTable,
  LoadingSpinner,
  LoadingState,
  ErrorState,
  ConfirmationModal,
  NewAppointmentModal,
  SessionCostModal,
  ToothChartModal,
  Toast
} from '../../../components'
import { useTheme } from '../../../contexts/ThemeContext'
import { getImageUrl } from '../../../utils/helpers'
import { appointmentsAPI } from '../../../services/api'

const DentistAppointments = ({ onTabChange }) => {
  const { isDarkMode } = useTheme()
  const [activeView, setActiveView] = useState('today') // today, pending, past, all
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [isNewAppointmentModalOpen, setIsNewAppointmentModalOpen] = useState(false)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [isSessionCostModalOpen, setIsSessionCostModalOpen] = useState(false)
  const [isToothChartModalOpen, setIsToothChartModalOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)

  // Fetch appointments on mount
  useEffect(() => {
    fetchAppointments()
  }, [])

  // Reset status filter when changing views
  useEffect(() => {
    setSelectedStatus('all')
  }, [activeView])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await appointmentsAPI.getDentistAppointments()
      setAppointments(response.appointments || [])
    } catch (err) {
      console.error('Error fetching appointments:', err)
      setError('Failed to load appointments. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Transform API data to match UI expectations
  const transformAppointment = (apt) => {
    const startTime = new Date(apt.startTime)
    const endTime = new Date(apt.endTime)
    const duration = Math.round((endTime - startTime) / 60000) // Convert ms to minutes

    return {
      id: apt.id,
      time: startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      duration: duration,
      appointmentDate: apt.appointmentDate,
      startTime: apt.startTime,
      endTime: apt.endTime,
      patient: {
        name: `${apt.patient.firstName} ${apt.patient.lastName}`,
        phone: apt.patient.user?.phone || apt.patient.phone || 'N/A',
        email: apt.patient.user?.email || 'N/A'
      },
      treatment: apt.treatment?.treatmentName || 'General Consultation',
      status: apt.status, // Keep original status (uppercase)
      notes: apt.sessionNotes || apt.patientNotes || '',
      toothNumber: '',
      hasToothChart: false,
      clinic: apt.clinic,
      rawData: apt // Keep original data for updates
    }
  }

  // Transform appointments for display
  const displayAppointments = useMemo(() => {
    return appointments.map(transformAppointment)
  }, [appointments])

  // Separate appointments into different categories
  const todayAppointments = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    return displayAppointments
      .filter(apt => {
        const aptDate = new Date(apt.appointmentDate)
        return aptDate >= today && aptDate < tomorrow && (apt.status === 'CONFIRMED' || apt.status === 'COMPLETED')
      })
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
  }, [displayAppointments])

  const upcomingAppointments = useMemo(() => {
    const now = new Date()
    return displayAppointments
      .filter(apt => {
        const aptDate = new Date(apt.appointmentDate)
        return aptDate >= now && apt.status === 'CONFIRMED'
      })
      .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
  }, [displayAppointments])

  const pendingAppointments = useMemo(() => {
    return displayAppointments
      .filter(apt => apt.status === 'PENDING')
      .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
  }, [displayAppointments])

  const pastAppointments = useMemo(() => {
    const now = new Date()
    return displayAppointments
      .filter(apt => {
        const aptEndTime = new Date(apt.endTime)
        return aptEndTime < now
      })
      .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate))
  }, [displayAppointments])

  const allAppointments = useMemo(() => {
    return displayAppointments
      .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate))
  }, [displayAppointments])

  const currentAppointments = useMemo(() => {
    switch (activeView) {
      case 'today':
        return todayAppointments
      case 'upcoming':
        return upcomingAppointments
      case 'pending':
        return pendingAppointments
      case 'past':
        return pastAppointments
      case 'all':
        return allAppointments
      default:
        return todayAppointments
    }
  }, [activeView, todayAppointments, upcomingAppointments, pendingAppointments, pastAppointments, allAppointments])

  const getStatusIcon = (status) => {
    switch (status.toUpperCase()) {
      case 'CONFIRMED':
        return FaCheckCircle
      case 'PENDING':
        return FaHourglassHalf
      case 'COMPLETED':
        return FaCheckCircle
      case 'CANCELLED':
        return FaTimesCircle
      default:
        return FaHourglassHalf
    }
  }

  const handleNewAppointment = () => {
    setIsNewAppointmentModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsNewAppointmentModalOpen(false)
  }

  const handleSaveAppointment = async (appointmentData) => {
    try {
      await appointmentsAPI.create(appointmentData)
      setToast({ message: 'Appointment created successfully!', type: 'success' })
      await fetchAppointments()
      setIsNewAppointmentModalOpen(false)
    } catch (err) {
      console.error('Error creating appointment:', err)
      throw err // Re-throw so modal can handle the error
    }
  }

  const handleCancelAppointment = (appointment) => {
    setSelectedAppointment(appointment)
    setIsCancelModalOpen(true)
  }

  const handleConfirmCancel = async () => {
    try {
      await appointmentsAPI.cancel(selectedAppointment.id)
      setToast({ message: 'Appointment cancelled successfully!', type: 'success' })
      await fetchAppointments()
      setIsCancelModalOpen(false)
      setSelectedAppointment(null)
    } catch (err) {
      console.error('Error cancelling appointment:', err)
      setToast({ message: 'Failed to cancel appointment. Please try again.', type: 'error' })
    }
  }

  const handleConfirmAppointment = async (appointmentId) => {
    try {
      // Update appointment status to confirmed
      await appointmentsAPI.update(appointmentId, { status: 'CONFIRMED' })
      setToast({ message: 'Appointment confirmed successfully!', type: 'success' })
      await fetchAppointments()
    } catch (err) {
      console.error('Error confirming appointment:', err)
      setToast({ message: 'Failed to confirm appointment. Please try again.', type: 'error' })
    }
  }

  const handleCompleteAppointment = (appointment) => {
    // Check if appointment is linked to a treatment
    if (!appointment.rawData?.treatmentId) {
      setToast({ message: 'This appointment is not linked to a treatment. Session cost can only be added for treatment-related appointments.', type: 'error' })
      return
    }
    setSelectedAppointment(appointment)
    setIsSessionCostModalOpen(true)
  }

  const handleSaveSessionCost = async (sessionCost) => {
    try {
      // Mark appointment as completed with session cost
      await appointmentsAPI.complete(selectedAppointment.id, { sessionCost })
      setToast({ message: 'Appointment completed successfully!', type: 'success' })
      await fetchAppointments()
      setIsSessionCostModalOpen(false)
      setSelectedAppointment(null)
    } catch (err) {
      console.error('Error completing appointment:', err)
      const errorMessage = err.response?.data?.error || err.message || 'Failed to complete appointment. Please try again.'
      throw new Error(errorMessage)
    }
  }

  const handleOpenToothChart = (appointment = null) => {
    setSelectedAppointment(appointment)
    setIsToothChartModalOpen(true)
  }

  const handleCloseToothChart = () => {
    setIsToothChartModalOpen(false)
    setSelectedAppointment(null)
  }

  const handleSaveToothChart = (chartData) => {
    
    if (selectedAppointment) {
      // Associate the tooth chart with the selected appointment
      
      setToast({ message: `Tooth chart successfully added to appointment: ${selectedAppointment.treatment} for ${selectedAppointment.patient.name}`, type: 'success' })
    } else {
      // Save as standalone tooth chart examination
    }
    
    setIsToothChartModalOpen(false)
    setSelectedAppointment(null)
  }

  const handleAddToothChartToAppointment = (appointment) => {
    // Check if appointment already has a treatment
    if (appointment.rawData?.treatmentId) {
      // If linked to treatment, open tooth chart modal
      setSelectedAppointment(appointment)
      setIsToothChartModalOpen(true)
    } else {
      // Store appointment data for the treatments page to use
      const appointmentContext = {
        id: appointment.id,
        appointmentId: appointment.id,
        patientId: appointment.rawData?.patientId,
        patientName: appointment.patient.name,
        patientPhone: appointment.patient.phone,
        patientEmail: appointment.patient.email,
        appointmentDate: appointment.appointmentDate,
        appointmentTime: appointment.time,
        treatmentName: appointment.rawData?.patientNotes || '', // Use the actual appointment reason
        notes: appointment.notes,
        fromAppointment: true
      }
      
      // Store in sessionStorage so treatments page can access it
      sessionStorage.setItem('createTreatmentFromAppointment', JSON.stringify(appointmentContext))
      
      // Navigate to treatments tab
      if (onTabChange) {
        onTabChange('treatments')
      } else {
        setToast({ message: 'Unable to navigate to treatments. Please go to the Treatments tab manually and create a treatment plan for ' + appointment.patient.name, type: 'error' })
      }
    }
  }

  const handleCreateTreatmentFromTooth = (toothData) => {
    // Navigate to treatments page to create treatment for specific tooth
    
    if (!selectedAppointment) {
      setToast({ message: 'No appointment selected', type: 'error' })
      return
    }
    
    const appointmentContext = {
      id: selectedAppointment.id,
      appointmentId: selectedAppointment.id,
      patientId: selectedAppointment.patient.id || selectedAppointment.rawData?.patientId,
      patientName: selectedAppointment.patient.name,
      patientPhone: selectedAppointment.patient.phone,
      patientEmail: selectedAppointment.patient.email,
      appointmentDate: selectedAppointment.appointmentDate,
      appointmentTime: selectedAppointment.time,
      treatmentName: selectedAppointment.rawData?.patientNotes || '', // Use the actual appointment reason
      notes: selectedAppointment.notes,
      fromAppointment: true,
      toothNumber: toothData?.toothNumber, // Add the tooth number
      toothCondition: toothData?.condition, // Add the tooth condition
      toothNotes: toothData?.notes // Add tooth-specific notes
    }
    
    // Store in sessionStorage so treatments page can access it
    sessionStorage.setItem('createTreatmentFromAppointment', JSON.stringify(appointmentContext))
    
    setIsToothChartModalOpen(false)
    
    // Navigate to treatments tab
    if (onTabChange) {
      onTabChange('treatments')
    } else {
      setToast({ message: 'Unable to navigate to treatments. Please go to the Treatments tab manually and create a treatment plan for ' + selectedAppointment.patient.name, type: 'error' })
    }
  }

  const handleScheduleAppointmentFromTooth = (toothNumber) => {
    // Pre-fill the appointment modal with tooth information
    setIsToothChartModalOpen(false)
    setIsNewAppointmentModalOpen(true)
    // You can pass the tooth number to pre-fill the appointment modal
  }

  const handleViewPatient = (appointment) => {
    // Get patient userId from appointment - try multiple paths
    const patientUserId = appointment.rawData?.patient?.userId || 
                         appointment.rawData?.patientId ||
                         appointment.rawData?.patient?.id
    
    if (!patientUserId) {
      setToast({ message: 'Unable to find patient information. Please try again.', type: 'error' })
      return
    }
    
    // Store patient ID in sessionStorage to be accessed by DentistPatients page
    sessionStorage.setItem('viewPatientId', patientUserId)
    
    // Navigate to patients tab
    if (onTabChange) {
      onTabChange('patients')
    } else {
      setToast({ message: 'Unable to navigate to patients page. Please go to the Patients tab manually.', type: 'error' })
    }
  }



  // Filtered appointments using useMemo
  const filteredAppointments = useMemo(() => {
    let filtered = currentAppointments

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(appointment => 
        appointment.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.treatment.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(appointment => appointment.status === selectedStatus)
    }

    return filtered
  }, [currentAppointments, searchTerm, selectedStatus])

  // Filter configuration for FilterBar
  const filters = [
    {
      value: selectedStatus,
      onChange: (e) => setSelectedStatus(e.target.value),
      options: [
        { value: 'all', label: 'All Status' },
        { value: 'CONFIRMED', label: 'Confirmed' },
        { value: 'PENDING', label: 'Pending' },
        { value: 'COMPLETED', label: 'Completed' },
        { value: 'CANCELLED', label: 'Cancelled' }
      ],
      placeholder: 'Filter by Status'
    }
  ]

  const handleClearFilters = () => {
    setSearchTerm('')
    setSelectedStatus('all')
  }

  // Table columns configuration
  const tableColumns = [
    { key: 'date', label: 'Date & Time' },
    { key: 'patient', label: 'Patient' },
    { key: 'treatment', label: 'Treatment' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions', className: 'text-right' }
  ]

  // Table row renderer
  const renderTableRow = (appointment, index) => {
    const aptDate = new Date(appointment.appointmentDate)
    const startTime = new Date(appointment.startTime)
    const endTime = new Date(appointment.endTime)
    
    return (
      <tr 
        key={appointment.id}
        className={`
          transition-colors
          ${isDarkMode 
            ? 'hover:bg-gray-700/50' 
            : 'hover:bg-gray-50'
          }
        `}
      >
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center gap-2">
            <FaCalendarAlt className="text-teal-500" />
            <div>
              <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {aptDate.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
              <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - {endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="shrink-0">
            {appointment.patient?.user?.profileImage || appointment.patient?.profileImage ? (
              <img
                src={getImageUrl(appointment.patient?.user?.profileImage || appointment.patient?.profileImage)}
                alt={appointment.patient.name}
                className="w-10 h-10 rounded-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className={`w-10 h-10 rounded-full bg-linear-to-br from-teal-500 to-cyan-500 flex items-center justify-center ${appointment.patient?.user?.profileImage || appointment.patient?.profileImage ? 'hidden' : ''}`}>
              <FaUser className="text-white text-sm" />
            </div>
          </div>
          <div>
            <div 
              className={`font-medium cursor-pointer hover:underline transition-colors ${isDarkMode ? 'text-white hover:text-teal-400' : 'text-gray-900 hover:text-teal-600'}`}
              onClick={() => handleViewPatient(appointment)}
            >
              {appointment.patient.name}
            </div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {appointment.patient.phone}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <FaStethoscope className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          <div>
            <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {appointment.treatment}
            </div>
            {appointment.toothNumber && (
              <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full">
                Tooth #{appointment.toothNumber}
              </span>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge 
          status={appointment.status.toLowerCase()}
          icon={getStatusIcon(appointment.status)}
          label={appointment.status.charAt(0) + appointment.status.slice(1).toLowerCase()}
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="flex justify-end gap-2">
          {appointment.status === 'PENDING' && (
            <>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleConfirmAppointment(appointment.id)}
                title="Confirm"
                className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
              >
                <FaCheck className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleCancelAppointment(appointment)}
                title="Cancel"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <FaTimesCircle className="w-4 h-4" />
              </Button>
            </>
          )}
          {appointment.status === 'CONFIRMED' && (
            <>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleCompleteAppointment(appointment)}
                title="Mark as Completed"
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                <FaCheckCircle className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleCancelAppointment(appointment)}
                title="Cancel"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <FaTimesCircle className="w-4 h-4" />
              </Button>
              {/* Only show tooth button if not linked to treatment */}
              {!appointment.rawData?.treatmentId && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleAddToothChartToAppointment(appointment)}
                  title="Create Treatment Plan"
                >
                  <FaTooth className="w-4 h-4" />
                </Button>
              )}
            </>
          )}
        </div>
      </td>
    </tr>
  )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Appointments"
        description="Manage and track your daily appointment schedule"
      />

      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={activeView === 'today' ? 'primary' : 'outline'}
            onClick={() => setActiveView('today')}
            className={activeView === 'today' ? 'bg-gradient-to-r from-teal-600 to-cyan-600' : ''}
          >
            Today ({todayAppointments.length})
          </Button>
          <Button
            variant={activeView === 'pending' ? 'primary' : 'outline'}
            onClick={() => setActiveView('pending')}
            className={activeView === 'pending' ? 'bg-gradient-to-r from-teal-600 to-cyan-600' : ''}
          >
            Pending ({pendingAppointments.length})
          </Button>
          <Button
            variant={activeView === 'upcoming' ? 'primary' : 'outline'}
            onClick={() => setActiveView('upcoming')}
            className={activeView === 'upcoming' ? 'bg-gradient-to-r from-teal-600 to-cyan-600' : ''}
          >
            Upcoming ({upcomingAppointments.length})
          </Button>
          <Button
            variant={activeView === 'past' ? 'primary' : 'outline'}
            onClick={() => setActiveView('past')}
            className={activeView === 'past' ? 'bg-gradient-to-r from-teal-600 to-cyan-600' : ''}
          >
            Past ({pastAppointments.length})
          </Button>
          <Button
            variant={activeView === 'all' ? 'primary' : 'outline'}
            onClick={() => setActiveView('all')}
            className={activeView === 'all' ? 'bg-gradient-to-r from-teal-600 to-cyan-600' : ''}
          >
            All Status ({allAppointments.length})
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={(e) => setSearchTerm(e.target.value)}
          searchPlaceholder="Search patients or treatments..."
          filters={filters}
          onClearFilters={handleClearFilters}
        />
      </Card>

      {/* Appointments Table */}
      {loading ? (
        <Card>
          <LoadingState message="Loading appointments..." />
        </Card>
      ) : error ? (
        <Card>
          <ErrorState 
            message={error}
            onRetry={fetchAppointments}
          />
        </Card>
      ) : (
        <DataTable
          columns={tableColumns}
          data={filteredAppointments}
          renderRow={renderTableRow}
          emptyMessage={
            activeView === 'today' 
              ? "No confirmed appointments scheduled for today." 
              : activeView === 'upcoming'
              ? "No upcoming appointments found."
              : activeView === 'pending'
              ? "No pending appointments found."
              : activeView === 'past'
              ? "No past appointments found."
              : "No appointments found."
          }
          emptyIcon={FaCalendarAlt}
          emptyTitle={
            activeView === 'today' 
              ? "No Today's Appointments" 
              : activeView === 'upcoming'
              ? "No Upcoming Appointments"
              : activeView === 'pending'
              ? "No Pending Appointments"
              : activeView === 'past'
              ? "No Past Appointments"
              : "No Appointments"
          }
          hasFilters={searchTerm !== '' || selectedStatus !== 'all'}
        />
      )}

      {/* Modals */}
      <NewAppointmentModal
        isOpen={isNewAppointmentModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveAppointment}
      />

      {/* Session Cost Modal */}
      <SessionCostModal
        isOpen={isSessionCostModalOpen}
        onClose={() => {
          setIsSessionCostModalOpen(false)
          setSelectedAppointment(null)
        }}
        onSave={handleSaveSessionCost}
        appointmentInfo={selectedAppointment ? {
          patientName: selectedAppointment.patient.name,
          treatment: selectedAppointment.treatment
        } : null}
      />

      {/* Cancel Confirmation Modal */}
      <ConfirmationModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
        item={selectedAppointment}
        action="cancel"
        itemName={selectedAppointment ? `appointment with ${selectedAppointment.patient.name} on ${new Date(selectedAppointment.appointmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : ''}
        itemType="Appointment"
      />

      {/* Tooth Chart Modal */}
      <ToothChartModal
        isOpen={isToothChartModalOpen}
        onClose={handleCloseToothChart}
        onSave={handleSaveToothChart}
        onCreateTreatment={handleCreateTreatmentFromTooth}
        onScheduleAppointment={handleScheduleAppointmentFromTooth}
        patientInfo={selectedAppointment ? selectedAppointment.patient : null}
        treatmentInfo={selectedAppointment ? {
          id: selectedAppointment.id,
          treatmentName: selectedAppointment.treatment,
          toothNumber: selectedAppointment.toothNumber,
          appointmentTime: selectedAppointment.time
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

export default DentistAppointments