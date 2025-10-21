import { useState, useMemo, useEffect } from 'react'
import { 
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaPhone,
  FaPlus,
  FaSearch,
  FaFilter,
  FaEdit,
  FaTrash,
  FaCheck,
  FaTimes,
  FaTooth,
  FaEnvelope,
  FaStethoscope,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaBan,
  FaTh,
  FaList
} from 'react-icons/fa'
import { 
  Card, 
  Button, 
  Input, 
  Select, 
  PageHeader, 
  StatusBadge,
  StatsOverview,
  FilterBar,
  DataTable,
  LoadingSpinner
} from '../../../components'
import { useTheme } from '../../../contexts/ThemeContext'
import NewAppointmentModal from '../../../components/dentist/NewAppointmentModal'
import EditAppointmentModal from '../../../components/dentist/EditAppointmentModal'
import DeleteConfirmationModal from '../../../components/dentist/DeleteConfirmationModal'
import ToothChartModal from '../../../components/dentist/ToothChartModal'
import { appointmentsAPI } from '../../../services/api'

const DentistAppointments = () => {
  const { isDarkMode } = useTheme()
  const [activeView, setActiveView] = useState('today') // today, week, month
  const [viewMode, setViewMode] = useState('card') // card or table
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [isNewAppointmentModalOpen, setIsNewAppointmentModalOpen] = useState(false)
  const [isEditAppointmentModalOpen, setIsEditAppointmentModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isToothChartModalOpen, setIsToothChartModalOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch appointments on mount
  useEffect(() => {
    fetchAppointments()
  }, [])

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
      treatment: apt.patientNotes || 'General Consultation',
      status: apt.status.toLowerCase(),
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'active'
      case 'pending':
        return 'pending'
      case 'completed':
        return 'inactive'
      case 'cancelled':
        return 'rejected'
      default:
        return 'inactive'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return FaCheckCircle
      case 'pending':
        return FaHourglassHalf
      case 'completed':
        return FaCheck
      case 'cancelled':
        return FaBan
      default:
        return FaClock
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
      await fetchAppointments()
      setIsNewAppointmentModalOpen(false)
    } catch (err) {
      console.error('Error creating appointment:', err)
      throw err // Re-throw so modal can handle the error
    }
  }

  const handleEditAppointment = (appointment) => {
    setSelectedAppointment(appointment)
    setIsEditAppointmentModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setIsEditAppointmentModalOpen(false)
    setSelectedAppointment(null)
  }

  const handleUpdateAppointment = async (updatedAppointment) => {
    try {
      await appointmentsAPI.update(selectedAppointment.id, updatedAppointment)
      await fetchAppointments()
      setIsEditAppointmentModalOpen(false)
      setSelectedAppointment(null)
    } catch (err) {
      console.error('Error updating appointment:', err)
      throw err // Re-throw so modal can handle the error
    }
  }

  const handleDeleteAppointment = (appointment) => {
    setSelectedAppointment(appointment)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    try {
      await appointmentsAPI.delete(selectedAppointment.id)
      await fetchAppointments()
      setIsDeleteModalOpen(false)
      setSelectedAppointment(null)
    } catch (err) {
      console.error('Error deleting appointment:', err)
      alert('Failed to delete appointment. Please try again.')
    }
  }

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setSelectedAppointment(null)
  }

  const handleConfirmAppointment = async (appointmentId) => {
    try {
      // Update appointment status to confirmed
      await appointmentsAPI.update(appointmentId, { status: 'CONFIRMED' })
      await fetchAppointments()
    } catch (err) {
      console.error('Error confirming appointment:', err)
      alert('Failed to confirm appointment. Please try again.')
    }
  }

  const handleCancelAppointment = async (appointmentId) => {
    try {
      await appointmentsAPI.cancel(appointmentId)
      await fetchAppointments()
    } catch (err) {
      console.error('Error cancelling appointment:', err)
      alert('Failed to cancel appointment. Please try again.')
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
    console.log('Tooth chart data for appointment:', chartData)
    
    if (selectedAppointment) {
      // Associate the tooth chart with the selected appointment
      console.log('Attaching tooth chart to appointment:', selectedAppointment.id)
      console.log('Appointment:', selectedAppointment.treatment)
      console.log('Patient:', selectedAppointment.patient.name)
      
      alert(`Tooth chart successfully added to appointment: ${selectedAppointment.treatment} for ${selectedAppointment.patient.name}`)
    } else {
      // Save as standalone tooth chart examination
      console.log('Saving standalone tooth chart')
    }
    
    setIsToothChartModalOpen(false)
    setSelectedAppointment(null)
  }

  const handleAddToothChartToAppointment = (appointment) => {
    setSelectedAppointment(appointment)
    setIsToothChartModalOpen(true)
  }

  const handleCreateTreatmentFromTooth = (toothNumber) => {
    // Navigate to treatments page to create treatment for specific tooth
    console.log('Creating treatment for tooth:', toothNumber)
    setIsToothChartModalOpen(false)
    // You could navigate to the treatments page or open a treatment modal
  }

  const handleScheduleAppointmentFromTooth = (toothNumber) => {
    // Pre-fill the appointment modal with tooth information
    console.log('Scheduling appointment for tooth:', toothNumber)
    setIsToothChartModalOpen(false)
    setIsNewAppointmentModalOpen(true)
    // You can pass the tooth number to pre-fill the appointment modal
  }

  // Computed stats using useMemo
  const stats = useMemo(() => {
    // Filter appointments for today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayAppointments = displayAppointments.filter(apt => {
      const aptDate = new Date(apt.appointmentDate)
      return aptDate >= today && aptDate < tomorrow
    })

    return [
      {
        label: 'Total Today',
        value: todayAppointments.length,
        icon: FaCalendarAlt,
        gradient: 'from-teal-600 to-cyan-600'
      },
      {
        label: 'Confirmed',
        value: displayAppointments.filter(a => a.status === 'confirmed').length,
        icon: FaCheckCircle,
        gradient: 'from-green-600 to-emerald-600'
      },
      {
        label: 'Pending',
        value: displayAppointments.filter(a => a.status === 'pending').length,
        icon: FaHourglassHalf,
        gradient: 'from-yellow-600 to-orange-600'
      },
      {
        label: 'Completed',
        value: displayAppointments.filter(a => a.status === 'completed').length,
        icon: FaCheck,
        gradient: 'from-blue-600 to-indigo-600'
      }
    ]
  }, [displayAppointments])

  // Filtered appointments using useMemo
  const filteredAppointments = useMemo(() => {
    let filtered = displayAppointments

    // Filter by time period (today, week, month)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (activeView === 'today') {
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      filtered = filtered.filter(apt => {
        const aptDate = new Date(apt.appointmentDate)
        return aptDate >= today && aptDate < tomorrow
      })
    } else if (activeView === 'week') {
      const nextWeek = new Date(today)
      nextWeek.setDate(nextWeek.getDate() + 7)
      filtered = filtered.filter(apt => {
        const aptDate = new Date(apt.appointmentDate)
        return aptDate >= today && aptDate < nextWeek
      })
    } else if (activeView === 'month') {
      const nextMonth = new Date(today)
      nextMonth.setMonth(nextMonth.getMonth() + 1)
      filtered = filtered.filter(apt => {
        const aptDate = new Date(apt.appointmentDate)
        return aptDate >= today && aptDate < nextMonth
      })
    }

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
  }, [displayAppointments, searchTerm, selectedStatus, activeView])

  // Filter configuration for FilterBar
  const filters = [
    {
      value: selectedStatus,
      onChange: (e) => setSelectedStatus(e.target.value),
      options: [
        { value: 'all', label: 'All Status' },
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'pending', label: 'Pending' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' }
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
    { key: 'time', label: 'Time' },
    { key: 'patient', label: 'Patient' },
    { key: 'treatment', label: 'Treatment' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions', className: 'text-right' }
  ]

  // Table row renderer
  const renderTableRow = (appointment, index) => (
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
          <FaClock className="text-teal-500" />
          <div>
            <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {appointment.time}
            </div>
            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {appointment.duration} min
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
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
          status={getStatusColor(appointment.status)}
          icon={getStatusIcon(appointment.status)}
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleAddToothChartToAppointment(appointment)}
            title="Add Tooth Chart"
          >
            <FaTooth className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleEditAppointment(appointment)}
            title="Edit"
          >
            <FaEdit className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleDeleteAppointment(appointment)}
            title="Delete"
            className="text-red-600"
          >
            <FaTrash className="w-4 h-4" />
          </Button>
        </div>
      </td>
    </tr>
  )

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Appointments"
          description="Manage and track your daily appointment schedule"
        />
        <div className="flex justify-center items-center h-96">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Appointments"
          description="Manage and track your daily appointment schedule"
        />
        <Card className={`p-12 text-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
            isDarkMode ? 'bg-red-900/20' : 'bg-red-100'
          }`}>
            <FaTimes className={`w-10 h-10 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`} />
          </div>
          <h3 className={`text-xl font-semibold mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {error}
          </h3>
          <Button onClick={fetchAppointments} className="mt-4">
            Try Again
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Modern Header with PageHeader Component */}
      <PageHeader
        title="Appointments"
        description="Manage and track your daily appointment schedule"
        actions={
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => handleOpenToothChart(null)}
              className="flex items-center gap-2"
            >
              <FaTooth className="w-4 h-4" />
              Tooth Chart
            </Button>
            <Button variant="primary" onClick={handleNewAppointment}>
              <FaPlus className="w-4 h-4 mr-2" />
              New Appointment
            </Button>
          </div>
        }
      />

      {/* Stats Overview using StatsOverview Component */}
      <StatsOverview stats={stats} />

      {/* View Selector with Card/Table Toggle */}
      <Card className={`p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FaFilter className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              View Schedule
            </h3>
          </div>
          <div className="flex items-center gap-3">
            {/* Time Period Selector */}
            <div className="flex gap-2">
              {['today', 'week', 'month'].map((view) => (
                <button
                  key={view}
                  onClick={() => setActiveView(view)}
                  className={`
                    px-6 py-2.5 rounded-lg capitalize font-medium transition-all
                    ${activeView === view
                      ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-500/30 scale-105'
                      : isDarkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {view}
                </button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className={`flex gap-1 p-1 rounded-lg ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <button
                onClick={() => setViewMode('card')}
                className={`p-2 rounded ${
                  viewMode === 'card'
                    ? 'bg-teal-600 text-white'
                    : isDarkMode
                      ? 'text-gray-400 hover:text-gray-200'
                      : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Card View"
              >
                <FaTh className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded ${
                  viewMode === 'table'
                    ? 'bg-teal-600 text-white'
                    : isDarkMode
                      ? 'text-gray-400 hover:text-gray-200'
                      : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Table View"
              >
                <FaList className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* FilterBar Component */}
      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
        debouncedSearchTerm={searchTerm}
        filters={filters}
        onClearFilters={handleClearFilters}
        searchPlaceholder="Search patients or treatments..."
      />

      {/* Appointments - Card or Table View */}
      {viewMode === 'table' ? (
        /* Table View using DataTable Component */
        <DataTable
          columns={tableColumns}
          data={filteredAppointments}
          renderRow={renderTableRow}
          emptyIcon={FaCalendarAlt}
          emptyTitle="No appointments found"
          emptyMessage="No appointments match your current filters"
          hasFilters={searchTerm !== '' || selectedStatus !== 'all'}
        />
      ) : (
        /* Card View */
        <div className="space-y-4">
          {filteredAppointments.length === 0 ? (
            <Card className={`p-12 text-center ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <FaCalendarAlt className={`w-10 h-10 ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                }`} />
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                No appointments found
              </h3>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                No appointments match your current filters. Try adjusting your search criteria.
              </p>
            </Card>
          ) : (
            filteredAppointments.map((appointment) => (
            <Card 
              key={appointment.id} 
              className={`p-6 hover:shadow-xl transition-all duration-300 border-l-4 ${
                appointment.status === 'confirmed' ? 'border-green-500' :
                appointment.status === 'pending' ? 'border-yellow-500' :
                appointment.status === 'completed' ? 'border-blue-500' :
                'border-red-500'
              } ${isDarkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'}`}
            >
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Section - Time & Status */}
                <div className="flex flex-col items-center lg:items-start gap-3 lg:border-r lg:border-gray-700/50 lg:pr-6 min-w-[180px]">
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
                    isDarkMode ? 'bg-gradient-to-br from-teal-900/30 to-cyan-900/30' : 'bg-gradient-to-br from-teal-50 to-cyan-50'
                  }`}>
                    <FaClock className="text-teal-500 text-xl" />
                    <div>
                      <span className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        {appointment.time}
                      </span>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {appointment.duration} minutes
                      </p>
                    </div>
                  </div>
                  
                  <StatusBadge 
                    status={getStatusColor(appointment.status)}
                    icon={getStatusIcon(appointment.status)}
                  />

                  {appointment.hasToothChart && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-teal-600/20 text-teal-400 rounded-full text-xs font-medium">
                      <FaTooth className="w-3 h-3" />
                      <span>Has Chart</span>
                    </div>
                  )}
                </div>

                {/* Middle Section - Patient & Treatment Info */}
                <div className="flex-1 space-y-4">
                  {/* Patient Info */}
                  <div className={`p-4 rounded-xl ${
                    isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isDarkMode ? 'bg-gradient-to-br from-teal-600 to-cyan-600' : 'bg-gradient-to-br from-teal-500 to-cyan-500'
                      }`}>
                        <FaUser className="text-white text-lg" />
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                          {appointment.patient.name}
                        </h3>
                        <div className="flex flex-wrap gap-3 mt-1">
                          <div className="flex items-center gap-1.5">
                            <FaPhone className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              {appointment.patient.phone}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <FaEnvelope className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              {appointment.patient.email}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Treatment Info */}
                  <div className={`p-4 rounded-xl border-2 ${
                    isDarkMode ? 'bg-gray-700/30 border-gray-600' : 'bg-white border-gray-200'
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isDarkMode ? 'bg-teal-900/50' : 'bg-teal-100'
                      }`}>
                        <FaStethoscope className="text-teal-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                            {appointment.treatment}
                          </h4>
                          {appointment.toothNumber && (
                            <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full font-medium">
                              Tooth #{appointment.toothNumber}
                            </span>
                          )}
                        </div>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {appointment.notes}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Section - Action Buttons */}
                <div className="flex lg:flex-col gap-2 justify-center lg:justify-start">
                  {appointment.status === 'pending' && (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleConfirmAppointment(appointment.id)}
                        title="Confirm Appointment"
                        className="text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                      >
                        <FaCheck className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => handleCancelAppointment(appointment.id)}
                        title="Cancel Appointment"
                      >
                        <FaTimes className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleAddToothChartToAppointment(appointment)}
                    title="Add Tooth Chart"
                    className="text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20"
                  >
                    <FaTooth className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditAppointment(appointment)}
                    title="Edit Appointment"
                    className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    <FaEdit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={() => handleDeleteAppointment(appointment)}
                    title="Delete Appointment"
                  >
                    <FaTrash className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
            ))
          )}
        </div>
      )}

      {/* Modals */}
      <NewAppointmentModal
        isOpen={isNewAppointmentModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveAppointment}
      />

      {/* Edit Appointment Modal */}
      <EditAppointmentModal
        isOpen={isEditAppointmentModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleUpdateAppointment}
        appointmentData={selectedAppointment}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        appointmentData={selectedAppointment}
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
          treatmentType: selectedAppointment.treatment,
          toothNumber: selectedAppointment.toothNumber,
          appointmentTime: selectedAppointment.time
        } : null}
      />
    </div>
  )
}

export default DentistAppointments