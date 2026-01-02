import { useState, useMemo, useEffect } from 'react'
import { 
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaStethoscope,
  FaCheckCircle,
  FaHourglassHalf,
  FaTimesCircle,
  FaPlus,
  FaEdit,
  FaTrash,
  FaBuilding,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope
} from 'react-icons/fa'
import { 
  Card,
  Button,
  Input,
  PageHeader,
  DataTable,
  FilterBar,
  StatusBadge,
  LoadingSpinner,
  BookAppointmentModal,
  ConfirmationModal,
  Toast
} from '../../../components'
import { useTheme } from '../../../contexts/ThemeContext'
import { appointmentsAPI } from '../../../services/api'
import { getStatusColor } from '../../../utils/helpers'

const PatientAppointments = () => {
  const { isDarkMode } = useTheme()
  const [activeView, setActiveView] = useState('upcoming')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [isBookModalOpen, setIsBookModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtering, setFiltering] = useState(false)
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)

  // Fetch data when filters change
  useEffect(() => {
    if (!isFirstLoad) {
      fetchAppointments(true)
    }
  }, [searchTerm, selectedStatus, activeView])

  // Initial load
  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async (isFiltering = false) => {
    try {
      if (isFiltering) {
        setFiltering(true)
      } else {
        setLoading(true)
      }
      setError(null)
      const response = await appointmentsAPI.getMyAppointments()
      setAppointments(response.appointments || [])
    } catch (err) {
      console.error('Error fetching appointments:', err)
      setError('Failed to load appointments. Please try again.')
    } finally {
      if (isFiltering) {
        setFiltering(false)
      } else {
        setLoading(false)
        setIsFirstLoad(false)
      }
    }
  }

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
        return FaClock
    }
  }

  const handleBookAppointment = () => {
    setIsBookModalOpen(true)
  }

  const handleCloseBookModal = async () => {
    setIsBookModalOpen(false)
    // Refresh appointments after booking
    await fetchAppointments()
  }

  const handleSaveAppointment = async (appointmentData) => {
    try {
      await appointmentsAPI.create(appointmentData)
      await fetchAppointments()
      setIsBookModalOpen(false)
      setToast({ message: 'Appointment booked successfully!', type: 'success' })
    } catch (err) {
      console.error('Error creating appointment:', err)
      // Re-throw the error so the modal knows it failed
      throw err
    }
  }

  const handleEditAppointment = (appointment) => {
    setSelectedAppointment(appointment)
    setIsEditModalOpen(true)
  }

  const handleCancelAppointment = (appointment) => {
    setSelectedAppointment(appointment)
    setIsCancelModalOpen(true)
  }

  const handleConfirmCancel = async () => {
    try {
      await appointmentsAPI.cancel(selectedAppointment.id)
      await fetchAppointments()
      setIsCancelModalOpen(false)
      setSelectedAppointment(null)
      setToast({ message: 'Appointment cancelled successfully!', type: 'success' })
    } catch (err) {
      console.error('Error cancelling appointment:', err)
      setToast({ message: 'Failed to cancel appointment. Please try again.', type: 'error' })
    }
  }

  // Separate appointments into upcoming and past
  const upcomingAppointments = appointments
    .filter(apt => {
      const aptDate = new Date(apt.appointmentDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return aptDate >= today && apt.status !== 'COMPLETED' && apt.status !== 'CANCELLED'
    })
    .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))

  const pastAppointments = appointments
    .filter(apt => {
      const aptDate = new Date(apt.appointmentDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return aptDate < today || apt.status === 'COMPLETED' || apt.status === 'CANCELLED'
    })
    .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate))

  const displayAppointments = activeView === 'upcoming' ? upcomingAppointments : pastAppointments



  // Filtered appointments
  const filteredAppointments = useMemo(() => {
    return displayAppointments.filter(appointment => {
      const dentistName = `${appointment.dentist?.firstName || ''} ${appointment.dentist?.lastName || ''}`
      const treatment = appointment.treatment?.treatmentName || ''
      
      const matchesSearch = searchTerm === '' || 
        treatment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dentistName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.clinic?.clinicName?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = selectedStatus === 'all' || appointment.status === selectedStatus.toUpperCase()

      return matchesSearch && matchesStatus
    })
  }, [displayAppointments, searchTerm, selectedStatus])

  // Filter configuration
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

  // Table columns
  const tableColumns = [
    { key: 'date', label: 'Date & Time' },
    { key: 'dentist', label: 'Dentist' },
    { key: 'clinic', label: 'Clinic' },
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
        className={`transition-colors ${
          isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
        }`}
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
              {appointment.dentist?.user?.profileImage || appointment.dentist?.profileImage ? (
                <img
                  src={getImageUrl(appointment.dentist?.user?.profileImage || appointment.dentist?.profileImage)}
                  alt={`Dr. ${appointment.dentist?.firstName} ${appointment.dentist?.lastName}`}
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={`w-10 h-10 rounded-full bg-linear-to-br from-teal-500 to-cyan-500 flex items-center justify-center ${appointment.dentist?.user?.profileImage || appointment.dentist?.profileImage ? 'hidden' : ''}`}>
                <FaUser className="text-white text-sm" />
              </div>
            </div>
            <div>
              <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Dr. {appointment.dentist?.firstName} {appointment.dentist?.lastName}
              </div>
              <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {appointment.dentist?.specialization?.[0] || 'General Dentistry'}
              </div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <div>
            <div className={`font-medium flex items-center gap-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              <FaBuilding className="text-teal-500 text-sm" />
              {appointment.clinic?.clinicName || 'N/A'}
            </div>
            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {appointment.clinic?.city || 'N/A'}
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-2">
            <FaStethoscope className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {appointment.treatment?.treatmentName || 'Consultation'}
            </span>
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
            {(appointment.status === 'PENDING' || appointment.status === 'CONFIRMED') && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleCancelAppointment(appointment)}
                title="Cancel"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <FaTimesCircle className="w-4 h-4" />
              </Button>
            )}
            {appointment.status === 'COMPLETED' && (
            <Button 
              variant="outline" 
              size="sm"
              title="View Details"
            >
              View
            </Button>
          )}
        </div>
      </td>
    </tr>
  )}

  // Card view renderer
  const renderCardView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {filteredAppointments.map((appointment) => {
        const StatusIcon = getStatusIcon(appointment.status)
        const aptDate = new Date(appointment.appointmentDate)
        const startTime = new Date(appointment.startTime)
        const endTime = new Date(appointment.endTime)
        
        return (
          <Card key={appointment.id} className="overflow-hidden">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-linear-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                    <FaUser className="text-white" />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Dr. {appointment.dentist?.firstName} {appointment.dentist?.lastName}
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {appointment.dentist?.specialization?.[0] || 'General Dentistry'}
                    </p>
                  </div>
                </div>
                <StatusBadge 
                  status={appointment.status.toLowerCase()}
                  icon={StatusIcon}
                  label={appointment.status.charAt(0) + appointment.status.slice(1).toLowerCase()}
                />
              </div>

              {/* Details */}
              <div className={`space-y-3 mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <div className="flex items-center gap-2">
                  <FaBuilding className="text-teal-500" />
                  <span className="font-medium">{appointment.clinic.name}</span>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    • {appointment.clinic.city}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="text-teal-500" />
                  <span>
                    {new Date(appointment.date).toLocaleDateString('en-US', { 
                      weekday: 'short',
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <FaClock className="text-teal-500" />
                  <span>{appointment.time} - {appointment.endTime}</span>
                </div>

                <div className="flex items-center gap-2">
                  <FaStethoscope className="text-teal-500" />
                  <span className="font-medium">{appointment.treatment}</span>
                </div>

                {appointment.patientNotes && (
                  <div className={`p-3 rounded-lg ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <strong>Your Notes:</strong> {appointment.patientNotes}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleCancelAppointment(appointment)}
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <FaTimesCircle className="mr-2" />
                    Cancel Appointment
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )
      })}
    </div>
  )



  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="My Appointments"
        description="Manage your dental appointments and bookings"
        action={{
          label: 'Book New Appointment',
          onClick: handleBookAppointment,
          icon: FaPlus,
          gradient: 'from-teal-600 to-cyan-600'
        }}
      />

      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
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
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={(e) => setSearchTerm(e.target.value)}
          searchPlaceholder="Search by treatment, dentist, or clinic..."
          filtering={filtering}
          filters={filters}
          onClearFilters={handleClearFilters}
        />
      </Card>

      {/* Appointments Table */}
      {error ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className={`text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <p className="text-lg font-semibold mb-2">Error Loading Appointments</p>
            <p>{error}</p>
          </div>
          <Button onClick={() => fetchAppointments()} className="bg-gradient-to-r from-teal-600 to-cyan-600">
            Try Again
          </Button>
        </div>
      ) : (
        <DataTable
          columns={tableColumns}
          data={filteredAppointments}
          renderRow={renderTableRow}
          loading={loading || filtering}
          emptyMessage={
            activeView === 'upcoming' 
              ? "No upcoming appointments. Book your next dental visit!" 
              : "No past appointments found"
          }
          emptyIcon={FaCalendarAlt}
          emptyTitle={
            activeView === 'upcoming' 
              ? "No Upcoming Appointments" 
              : "No Past Appointments"
          }
          hasFilters={searchTerm !== '' || selectedStatus !== 'all'}
        />
      )}

      {/* Modals */}
      <BookAppointmentModal
        isOpen={isBookModalOpen}
        onClose={handleCloseBookModal}
        onSave={handleSaveAppointment}
      />

      <ConfirmationModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
        item={selectedAppointment}
        action="cancel"
        itemName={selectedAppointment ? `appointment with Dr. ${selectedAppointment.dentist?.firstName} ${selectedAppointment.dentist?.lastName} on ${new Date(selectedAppointment.appointmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : ''}
        itemType="Appointment"
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

export default PatientAppointments
