import { useState, useEffect, useMemo } from 'react'
import { 
  FaCalendarAlt,
  FaUser,
  FaPhone,
  FaSearch,
  FaEnvelope,
  FaStethoscope,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaFilter,
  FaEye
} from 'react-icons/fa'
import { 
  Button, 
  Input, 
  Select, 
  PageHeader, 
  StatusBadge,
  StatsOverview,
  DataTable,
  LoadingSpinner,
  Card
} from '..'
import { useTheme } from '../../contexts/ThemeContext'
import AppointmentDetailsModal from './AppointmentDetailsModal'
import { appointmentsAPI } from '../../services/api'

const DentistAppointmentHistory = () => {
  const { isDarkMode } = useTheme()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedMonth, setSelectedMonth] = useState('all')
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

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

  // Transform API data
  const transformAppointment = (apt) => {
    const startTime = new Date(apt.startTime)
    const endTime = new Date(apt.endTime)
    const duration = Math.round((endTime - startTime) / 60000)

    return {
      id: apt.id,
      date: startTime.toLocaleDateString(),
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
      status: apt.status,
      notes: apt.sessionNotes || apt.patientNotes || '',
      clinic: apt.clinic,
      rawData: apt
    }
  }

  // Get month from date
  const getMonth = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
  }

  // Filter appointments
  const filteredAppointments = useMemo(() => {
    return appointments
      .map(transformAppointment)
      .filter(apt => {
        const matchesSearch = 
          apt.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          apt.patient.phone.includes(searchTerm) ||
          apt.treatment.toLowerCase().includes(searchTerm.toLowerCase())
        
        const matchesStatus = selectedStatus === 'all' || apt.status === selectedStatus
        
        const matchesMonth = selectedMonth === 'all' || getMonth(apt.startTime) === selectedMonth
        
        return matchesSearch && matchesStatus && matchesMonth
      })
      .sort((a, b) => new Date(b.startTime) - new Date(a.startTime)) // Most recent first
  }, [appointments, searchTerm, selectedStatus, selectedMonth])

  // Get unique months for filter
  const availableMonths = useMemo(() => {
    const months = [...new Set(appointments.map(apt => getMonth(apt.startTime)))]
    return months.sort((a, b) => new Date(b) - new Date(a))
  }, [appointments])

  // Calculate statistics
  const stats = useMemo(() => {
    const total = filteredAppointments.length
    const completed = filteredAppointments.filter(a => a.status === 'COMPLETED').length
    const cancelled = filteredAppointments.filter(a => a.status === 'CANCELLED').length
    const confirmed = filteredAppointments.filter(a => a.status === 'CONFIRMED').length
    const pending = filteredAppointments.filter(a => a.status === 'PENDING').length

    return { total, completed, cancelled, confirmed, pending }
  }, [filteredAppointments])

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment)
    setIsDetailsModalOpen(true)
  }

  const handleCloseDetails = () => {
    setIsDetailsModalOpen(false)
    setSelectedAppointment(null)
  }

  // Status badge configuration
  const getStatusConfig = (status) => {
    switch (status) {
      case 'COMPLETED':
        return { icon: FaCheckCircle, color: 'blue', label: 'Completed' }
      case 'CANCELLED':
        return { icon: FaTimesCircle, color: 'red', label: 'Cancelled' }
      case 'CONFIRMED':
        return { icon: FaCheckCircle, color: 'green', label: 'Confirmed' }
      case 'PENDING':
        return { icon: FaClock, color: 'orange', label: 'Pending' }
      default:
        return { icon: FaClock, color: 'gray', label: status }
    }
  }

  // Render appointment row
  const renderAppointmentRow = (appointment) => {
    const statusConfig = getStatusConfig(appointment.status)
    const StatusIcon = statusConfig.icon

    return (
      <tr 
        key={appointment.id}
        className={`
          border-b transition-colors cursor-pointer
          ${isDarkMode 
            ? 'border-gray-700 hover:bg-gray-700/50' 
            : 'border-gray-200 hover:bg-gray-50'
          }
        `}
        onClick={() => handleViewDetails(appointment)}
      >
        {/* Date & Time */}
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className={`
              p-2 rounded-lg
              ${isDarkMode ? 'bg-teal-900/30' : 'bg-teal-100'}
            `}>
              <FaCalendarAlt className="w-4 h-4 text-teal-600" />
            </div>
            <div>
              <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {appointment.date}
              </p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {appointment.time}
              </p>
            </div>
          </div>
        </td>

        {/* Patient */}
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center
              ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'}
            `}>
              <FaUser className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {appointment.patient.name}
              </p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {appointment.patient.phone}
              </p>
            </div>
          </div>
        </td>

        {/* Treatment */}
        <td className="px-6 py-4">
          <div className="flex items-center gap-2">
            <FaStethoscope className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
              {appointment.treatment}
            </span>
          </div>
        </td>

        {/* Status */}
        <td className="px-6 py-4">
          <span className={`
            inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
            ${statusConfig.color === 'blue' 
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
              : statusConfig.color === 'green'
              ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
              : statusConfig.color === 'red'
              ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
              : statusConfig.color === 'orange'
              ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-300'
            }
          `}>
            <StatusIcon className="w-3.5 h-3.5" />
            {statusConfig.label}
          </span>
        </td>

        {/* Actions */}
        <td className="px-6 py-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleViewDetails(appointment)
            }}
            title="View Details"
          >
            <FaEye className="w-4 h-4" />
          </Button>
        </td>
      </tr>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Appointment History"
          description="View past appointments and their details"
        />
        <div className="flex justify-center items-center h-96">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Appointment History"
          description="View past appointments and their details"
        />
        <Card className="p-8 text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Button onClick={fetchAppointments}>Retry</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Appointment History"
        description="View and manage past appointments"
      />

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatsOverview
          icon={FaCalendarAlt}
          label="Total"
          value={stats.total}
          color="purple"
        />
        <StatsOverview
          icon={FaCheckCircle}
          label="Completed"
          value={stats.completed}
          color="blue"
        />
        <StatsOverview
          icon={FaCheckCircle}
          label="Confirmed"
          value={stats.confirmed}
          color="green"
        />
        <StatsOverview
          icon={FaClock}
          label="Pending"
          value={stats.pending}
          color="orange"
        />
        <StatsOverview
          icon={FaTimesCircle}
          label="Cancelled"
          value={stats.cancelled}
          color="red"
        />
      </div>

      {/* Filters */}
      <Card>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <Input
              icon={FaSearch}
              placeholder="Search by patient, phone, or treatment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {/* Status Filter */}
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              icon={FaFilter}
            >
              <option value="all">All Status</option>
              <option value="COMPLETED">Completed</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PENDING">Pending</option>
              <option value="CANCELLED">Cancelled</option>
            </Select>

            {/* Month Filter */}
            <Select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              icon={FaCalendarAlt}
            >
              <option value="all">All Months</option>
              {availableMonths.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </Select>
          </div>

          {/* Clear Filters */}
          {(searchTerm || selectedStatus !== 'all' || selectedMonth !== 'all') && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('')
                  setSelectedStatus('all')
                  setSelectedMonth('all')
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Appointments Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`
              ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}
            `}>
              <tr>
                <th className={`
                  px-6 py-3 text-left text-xs font-medium uppercase tracking-wider
                  ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}
                `}>
                  Date & Time
                </th>
                <th className={`
                  px-6 py-3 text-left text-xs font-medium uppercase tracking-wider
                  ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}
                `}>
                  Patient
                </th>
                <th className={`
                  px-6 py-3 text-left text-xs font-medium uppercase tracking-wider
                  ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}
                `}>
                  Treatment
                </th>
                <th className={`
                  px-6 py-3 text-left text-xs font-medium uppercase tracking-wider
                  ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}
                `}>
                  Status
                </th>
                <th className={`
                  px-6 py-3 text-left text-xs font-medium uppercase tracking-wider
                  ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}
                `}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map(renderAppointmentRow)
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <FaCalendarAlt className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">No appointments found</p>
                      <p className="text-sm mt-2">Try adjusting your filters</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Results Count */}
        {filteredAppointments.length > 0 && (
          <div className={`
            px-6 py-3 border-t
            ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-600'}
          `}>
            <p className="text-sm">
              Showing {filteredAppointments.length} result{filteredAppointments.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </Card>

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <AppointmentDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={handleCloseDetails}
          appointment={selectedAppointment}
        />
      )}
    </div>
  )
}

export default DentistAppointmentHistory
