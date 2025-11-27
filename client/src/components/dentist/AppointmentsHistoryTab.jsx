import { useState, useMemo } from 'react'
import { 
  FaCalendarAlt, 
  FaClock,
  FaFilter,
  FaStethoscope,
  FaStickyNote,
  FaCheckCircle,
  FaHourglassHalf,
  FaTimesCircle,
  FaDollarSign,
  FaInfoCircle
} from 'react-icons/fa'
import { useTheme } from '../../contexts/ThemeContext'
import { Card, Select, StatusBadge, Button, DataTable } from '../index'

const AppointmentsHistoryTab = ({ appointments = [] }) => {
  const { isDarkMode } = useTheme()
  const [statusFilter, setStatusFilter] = useState('all')

  // Filter appointments based on status
  const filteredAppointments = useMemo(() => {
    if (statusFilter === 'all') return appointments

    return appointments.filter(apt => 
      apt.status?.toLowerCase() === statusFilter.toLowerCase()
    )
  }, [appointments, statusFilter])

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
        return FaCheckCircle
      case 'COMPLETED':
        return FaCheckCircle
      case 'PENDING':
        return FaHourglassHalf
      case 'CANCELLED':
        return FaTimesCircle
      default:
        return FaClock
    }
  }

  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: appointments.length,
      completed: appointments.filter(a => a.status?.toUpperCase() === 'COMPLETED').length,
      pending: appointments.filter(a => a.status?.toUpperCase() === 'PENDING').length,
      cancelled: appointments.filter(a => a.status?.toUpperCase() === 'CANCELLED').length
    }
  }, [appointments])

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className={`p-4 rounded-lg border-l-4 ${
        isDarkMode 
          ? 'bg-blue-900/20 border-blue-600' 
          : 'bg-blue-50 border-blue-600'
      }`}>
        <div className="flex items-start gap-3">
          <FaInfoCircle className={`mt-0.5 flex-shrink-0 ${
            isDarkMode ? 'text-blue-400' : 'text-blue-600'
          }`} />
          <div>
            <h4 className={`font-semibold mb-1 ${
              isDarkMode ? 'text-blue-400' : 'text-blue-700'
            }`}>
              Appointment History
            </h4>
            <p className={`text-sm ${
              isDarkMode ? 'text-blue-300/80' : 'text-blue-600/80'
            }`}>
              Complete record of all appointments for this patient, including scheduled, completed, and cancelled visits.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className={`p-4 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gradient-to-br from-blue-50 to-blue-100'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${
              isDarkMode ? 'bg-blue-900/30' : 'bg-blue-200'
            }`}>
              <FaCalendarAlt className="text-blue-600 text-xl" />
            </div>
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total
              </p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                {stats.total}
              </p>
            </div>
          </div>
        </Card>

        <Card className={`p-4 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gradient-to-br from-green-50 to-green-100'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${
              isDarkMode ? 'bg-green-900/30' : 'bg-green-200'
            }`}>
              <FaCheckCircle className="text-green-600 text-xl" />
            </div>
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Completed
              </p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                {stats.completed}
              </p>
            </div>
          </div>
        </Card>

        <Card className={`p-4 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gradient-to-br from-yellow-50 to-yellow-100'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${
              isDarkMode ? 'bg-yellow-900/30' : 'bg-yellow-200'
            }`}>
              <FaHourglassHalf className="text-yellow-600 text-xl" />
            </div>
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Pending
              </p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                {stats.pending}
              </p>
            </div>
          </div>
        </Card>

        <Card className={`p-4 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gradient-to-br from-red-50 to-red-100'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${
              isDarkMode ? 'bg-red-900/30' : 'bg-red-200'
            }`}>
              <FaTimesCircle className="text-red-600 text-xl" />
            </div>
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Cancelled
              </p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                {stats.cancelled}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className={`p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'
              }`}>
                <FaCalendarAlt className="text-blue-600 text-xl" />
              </div>
              <div>
                <h3 className={`text-xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  Appointments
                </h3>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {filteredAppointments.length} {filteredAppointments.length === 1 ? 'appointment' : 'appointments'}
                </p>
              </div>
            </div>
            {statusFilter !== 'all' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStatusFilter('all')}
                className="flex items-center gap-2"
              >
                <FaFilter className="w-4 h-4" />
                Clear Filter
              </Button>
            )}
          </div>

          {/* Filter */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              placeholder="All Appointments"
              icon={FaFilter}
              options={[
                { value: 'all', label: 'All Appointments' },
                { value: 'pending', label: 'Pending' },
                { value: 'confirmed', label: 'Confirmed' },
                { value: 'completed', label: 'Completed' },
                { value: 'cancelled', label: 'Cancelled' }
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Appointments Table */}
      <DataTable
        columns={[
          {
            label: 'Date & Time',
            accessor: 'appointmentDate',
            render: (value, item) => (
              <div className="flex items-start gap-2">
                <FaCalendarAlt className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <div>
                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {formatDate(value)}
                  </p>
                  <p className={`text-sm flex items-center gap-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <FaClock className="text-xs" />
                    {formatTime(item.startTime)} - {formatTime(item.endTime)}
                  </p>
                </div>
              </div>
            )
          },
          {
            label: 'Status',
            accessor: 'status',
            render: (value) => {
              const Icon = getStatusIcon(value)
              return (
                <StatusBadge
                  status={value?.toLowerCase()}
                  icon={Icon}
                  label={value}
                />
              )
            }
          },
          {
            label: 'Treatment',
            accessor: 'treatmentId',
            render: (value, item) => (
              value ? (
                <div className="flex items-start gap-2">
                  <FaStethoscope className={`mt-1 text-teal-600`} />
                  <div>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      Linked to Treatment
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      ID: #{value}
                    </p>
                  </div>
                </div>
              ) : (
                <span className={`text-sm italic ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  General Appointment
                </span>
              )
            )
          },
          {
            label: 'Session Cost',
            accessor: 'sessionCost',
            render: (value) => (
              value ? (
                <div className="flex items-center gap-2">
                  <FaDollarSign className="text-green-600" />
                  <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    ${value.toFixed(2)}
                  </span>
                </div>
              ) : (
                <span className={`text-sm italic ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Not set
                </span>
              )
            )
          },
          {
            label: 'Notes',
            accessor: 'patientNotes',
            render: (value, item) => {
              const notes = value || item.sessionNotes
              return notes ? (
                <div className="flex items-start gap-2 max-w-xs">
                  <FaStickyNote className={`mt-0.5 flex-shrink-0 text-sm ${
                    isDarkMode ? 'text-yellow-400' : 'text-yellow-600'
                  }`} />
                  <span className={`text-sm line-clamp-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {notes}
                  </span>
                </div>
              ) : (
                <span className={`text-sm italic ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  No notes
                </span>
              )
            }
          }
        ]}
        data={filteredAppointments}
        loading={false}
        emptyIcon={FaCalendarAlt}
        emptyTitle="No appointments found"
        emptyMessage="This patient has no appointment records"
        hasFilters={statusFilter !== 'all'}
      />
    </div>
  )
}

export default AppointmentsHistoryTab
