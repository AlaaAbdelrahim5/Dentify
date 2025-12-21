import { useState, useMemo, useEffect } from 'react'
import { 
  FaCalendarAlt,
  FaUser,
  FaUserMd,
  FaCheck,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaClock,
  FaStethoscope,
  FaPlus,
  FaEdit
} from 'react-icons/fa'
import { 
  Button, 
  Card,
  PageHeader, 
  StatusBadge,
  StatsOverview,
  FilterBar,
  DataTable,
  ConfirmationModal,
  NewAppointmentModal,
  SessionCostModal
} from '../../../components'
import { useTheme } from '../../../contexts/ThemeContext'
import { authUtils } from '../../../utils/auth'
import { appointmentsAPI } from '../../../services/api'

const ClinicAppointments = ({ userData, onTabChange }) => {
  const { isDarkMode } = useTheme()
  const [activeView, setActiveView] = useState('today') // today, pending, past, all
  const [appointments, setAppointments] = useState([])
  const [dentists, setDentists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedDentist, setSelectedDentist] = useState('all')
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [isNewAppointmentModalOpen, setIsNewAppointmentModalOpen] = useState(false)
  const [isSessionCostModalOpen, setIsSessionCostModalOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)

  useEffect(() => {
    fetchAppointments()
    fetchDentists()
  }, [])

  // Reset status filter when changing views
  useEffect(() => {
    setSelectedStatus('all')
  }, [activeView])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await appointmentsAPI.getClinicAppointments()
      
      setAppointments(response.appointments || [])
    } catch (error) {
      console.error('Clinic: Error fetching appointments:', error)
      setError(error.message || 'Failed to load appointments. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchDentists = async () => {
    try {
      const token = authUtils.getAccessToken()
      
      const response = await fetch('http://localhost:5000/api/dentists/clinic', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setDentists(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching dentists:', error)
    }
  }

  // Transform API data to match UI expectations
  const transformAppointment = (apt) => {
    const startTime = apt.startTime ? new Date(apt.startTime) : new Date(apt.date)
    const endTime = apt.endTime ? new Date(apt.endTime) : new Date(apt.date)
    const duration = Math.round((endTime - startTime) / 60000) // Convert ms to minutes

    return {
      id: apt.id,
      time: startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      duration: duration,
      appointmentDate: apt.date || apt.appointmentDate,
      startTime: apt.startTime || apt.date,
      endTime: apt.endTime || apt.date,
      patient: {
        name: `${apt.patient?.firstName || ''} ${apt.patient?.lastName || ''}`,
        phone: apt.patient?.user?.phone || apt.patient?.phone || 'N/A',
        email: apt.patient?.user?.email || 'N/A'
      },
      dentist: {
        name: `Dr. ${apt.dentist?.firstName || ''} ${apt.dentist?.lastName || ''}`,
        id: apt.dentistId
      },
      treatment: apt.reason || apt.treatment?.treatmentName || 'General Consultation',
      status: apt.status?.toUpperCase() || 'PENDING',
      notes: apt.sessionNotes || apt.patientNotes || apt.notes || '',
      rawData: apt
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
        const aptDate = new Date(apt.startTime)
        aptDate.setHours(0, 0, 0, 0)
        return aptDate.getTime() >= today.getTime() && aptDate.getTime() < tomorrow.getTime()
      })
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
  }, [displayAppointments])

  const upcomingAppointments = useMemo(() => {
    const now = new Date()
    return displayAppointments
      .filter(apt => {
        const aptDate = new Date(apt.startTime)
        return aptDate >= now && (apt.status === 'CONFIRMED' || apt.status === 'SCHEDULED')
      })
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
  }, [displayAppointments])

  const pendingAppointments = useMemo(() => {
    return displayAppointments
      .filter(apt => apt.status === 'PENDING')
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
  }, [displayAppointments])

  const pastAppointments = useMemo(() => {
    const now = new Date()
    return displayAppointments
      .filter(apt => {
        const aptEndTime = new Date(apt.endTime)
        return aptEndTime < now || apt.status === 'COMPLETED'
      })
      .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
  }, [displayAppointments])

  const allAppointments = useMemo(() => {
    return displayAppointments
      .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
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
      case 'SCHEDULED':
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

  const handleConfirmAppointment = async (appointmentId) => {
    try {
      await appointmentsAPI.update(appointmentId, { status: 'CONFIRMED' })
      await fetchAppointments()
    } catch (err) {
      console.error('Error confirming appointment:', err)
      alert('Failed to confirm appointment. Please try again.')
    }
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
    } catch (err) {
      console.error('Error cancelling appointment:', err)
      alert('Failed to cancel appointment. Please try again.')
    }
  }

  const handleNewAppointment = () => {
    setIsNewAppointmentModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsNewAppointmentModalOpen(false)
    setSelectedAppointment(null)
  }

  const handleSaveAppointment = async (appointmentData) => {
    try {
      await appointmentsAPI.create(appointmentData)
      await fetchAppointments()
      setIsNewAppointmentModalOpen(false)
    } catch (err) {
      console.error('Error creating appointment:', err)
      throw err // Re-throw so modal can handle the error
    }
  }

  const handleCompleteAppointment = (appointment) => {
    // Check if appointment is linked to a treatment
    if (!appointment.rawData?.treatmentId) {
      alert('This appointment is not linked to a treatment. Session cost can only be added for treatment-related appointments.')
      return
    }
    setSelectedAppointment(appointment)
    setIsSessionCostModalOpen(true)
  }

  const handleSaveSessionCost = async (sessionCost) => {
    try {
      await appointmentsAPI.complete(selectedAppointment.id, { sessionCost })
      await fetchAppointments()
      setIsSessionCostModalOpen(false)
      setSelectedAppointment(null)
    } catch (err) {
      console.error('Error completing appointment:', err)
      const errorMessage = err.response?.data?.error || err.message || 'Failed to complete appointment. Please try again.'
      throw new Error(errorMessage)
    }
  }

  // Computed stats using useMemo
  const stats = useMemo(() => [
    {
      label: 'Today',
      value: loading ? '-' : todayAppointments.length,
      icon: FaCalendarAlt,
      gradient: 'from-teal-600 to-cyan-600'
    },
    {
      label: 'Pending',
      value: loading ? '-' : pendingAppointments.length,
      icon: FaHourglassHalf,
      gradient: 'from-yellow-600 to-orange-600'
    },
    {
      label: 'Upcoming',
      value: loading ? '-' : upcomingAppointments.length,
      icon: FaClock,
      gradient: 'from-emerald-600 to-teal-600'
    },
    {
      label: 'Past',
      value: loading ? '-' : pastAppointments.length,
      icon: FaCheckCircle,
      gradient: 'from-blue-600 to-indigo-600'
    },
    {
      label: 'All',
      value: loading ? '-' : allAppointments.length,
      icon: FaCheckCircle,
      gradient: 'from-purple-600 to-purple-700'
    }
  ], [loading, todayAppointments, upcomingAppointments, pendingAppointments, pastAppointments, allAppointments])

  // Filtered appointments using useMemo
  const filteredAppointments = useMemo(() => {
    let filtered = currentAppointments

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(appointment => 
        appointment.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.dentist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.treatment.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(appointment => appointment.status === selectedStatus)
    }

    // Filter by dentist
    if (selectedDentist !== 'all') {
      filtered = filtered.filter(appointment => appointment.dentist.id === parseInt(selectedDentist))
    }

    return filtered
  }, [currentAppointments, searchTerm, selectedStatus, selectedDentist])

  // Filter configuration for FilterBar
  const filters = [
    {
      value: selectedStatus,
      onChange: (e) => setSelectedStatus(e.target.value),
      options: [
        { value: 'all', label: 'All Status' },
        { value: 'CONFIRMED', label: 'Confirmed' },
        { value: 'SCHEDULED', label: 'Scheduled' },
        { value: 'PENDING', label: 'Pending' },
        { value: 'COMPLETED', label: 'Completed' },
        { value: 'CANCELLED', label: 'Cancelled' }
      ],
      placeholder: 'Filter by Status'
    },
    {
      value: selectedDentist,
      onChange: (e) => setSelectedDentist(e.target.value),
      options: [
        { value: 'all', label: 'All Dentists' },
        ...dentists.map(dentist => ({
          value: (dentist._id || dentist.userId).toString(),
          label: `Dr. ${dentist.firstName} ${dentist.lastName}`
        }))
      ],
      placeholder: 'Filter by Dentist'
    }
  ]

  const handleClearFilters = () => {
    setSearchTerm('')
    setSelectedStatus('all')
    setSelectedDentist('all')
  }

  // Table columns configuration
  const tableColumns = [
    { key: 'date', label: 'Date & Time' },
    { key: 'patient', label: 'Patient' },
    { key: 'dentist', label: 'Dentist' },
    { key: 'treatment', label: 'Treatment/Reason' },
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
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
              <FaUser className="text-white text-sm" />
            </div>
            <div>
              <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
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
            <FaUserMd className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {appointment.dentist.name}
            </span>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-2">
            <FaStethoscope className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {appointment.treatment}
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
            {(appointment.status === 'PENDING' || appointment.status === 'SCHEDULED') && (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleConfirmAppointment(appointment.id)}
                  title="Confirm appointment"
                  className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                >
                  <FaCheck className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleCancelAppointment(appointment)}
                  title="Cancel appointment"
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
                  title="Mark as completed"
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  <FaCheckCircle className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleCancelAppointment(appointment)}
                  title="Cancel appointment"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <FaTimesCircle className="w-4 h-4" />
                </Button>
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
        description="View and manage all clinic appointments"
      />

      {/* Stats Overview */}
      <StatsOverview stats={stats} />

      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={activeView === 'today' ? 'primary' : 'outline'}
            onClick={() => setActiveView('today')}
            className={activeView === 'today' ? 'bg-linear-to-r from-teal-600 to-cyan-600' : ''}
          >
            Today ({loading ? '-' : todayAppointments.length})
          </Button>
          <Button
            variant={activeView === 'pending' ? 'primary' : 'outline'}
            onClick={() => setActiveView('pending')}
            className={activeView === 'pending' ? 'bg-linear-to-r from-teal-600 to-cyan-600' : ''}
          >
            Pending ({loading ? '-' : pendingAppointments.length})
          </Button>
          <Button
            variant={activeView === 'upcoming' ? 'primary' : 'outline'}
            onClick={() => setActiveView('upcoming')}
            className={activeView === 'upcoming' ? 'bg-linear-to-r from-teal-600 to-cyan-600' : ''}
          >
            Upcoming ({loading ? '-' : upcomingAppointments.length})
          </Button>
          <Button
            variant={activeView === 'past' ? 'primary' : 'outline'}
            onClick={() => setActiveView('past')}
            className={activeView === 'past' ? 'bg-linear-to-r from-teal-600 to-cyan-600' : ''}
          >
            Past ({loading ? '-' : pastAppointments.length})
          </Button>
          <Button
            variant={activeView === 'all' ? 'primary' : 'outline'}
            onClick={() => setActiveView('all')}
            className={activeView === 'all' ? 'bg-linear-to-r from-teal-600 to-cyan-600' : ''}
          >
            All Status ({loading ? '-' : allAppointments.length})
          </Button>
        </div>
      </div>

      {/* Filters */}
      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
        searchPlaceholder="Search patients, dentists or treatments..."
        filters={filters}
        onClearFilters={handleClearFilters}
      />

      {/* Appointments Table */}
      {loading ? (
        <Card className={`p-8 text-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          </div>
          <p className={`mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Loading appointments...
          </p>
        </Card>
      ) : error ? (
        <Card className={`p-8 text-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <FaCalendarAlt className={`w-12 h-12 mx-auto mb-4 ${
            isDarkMode ? 'text-red-400' : 'text-red-500'
          }`} />
          <h3 className={`text-lg font-semibold mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Error Loading Appointments
          </h3>
          <p className={`mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {error}
          </p>
          <Button onClick={fetchAppointments}>
            Try Again
          </Button>
        </Card>
      ) : (
        <DataTable
          columns={tableColumns}
          data={filteredAppointments}
          renderRow={renderTableRow}
          emptyMessage={
            activeView === 'today' 
              ? "No appointments scheduled for today." 
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
          hasFilters={searchTerm !== '' || selectedStatus !== 'all' || selectedDentist !== 'all'}
        />
      )}

      {/* Modals */}
      <NewAppointmentModal
        isOpen={isNewAppointmentModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveAppointment}
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

      {/* Session Cost Modal */}
      <SessionCostModal
        isOpen={isSessionCostModalOpen}
        onClose={() => { setIsSessionCostModalOpen(false); setSelectedAppointment(null) }}
        onSave={handleSaveSessionCost}
        appointmentInfo={selectedAppointment ? {
          patientName: selectedAppointment.patient.name,
          treatment: selectedAppointment.treatment
        } : null}
      />
    </div>
  )
}

export default ClinicAppointments
