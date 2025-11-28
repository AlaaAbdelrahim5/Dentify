import { useState, useEffect } from 'react'
import { 
  FaCalendarAlt, 
  FaPlus, 
  FaSearch,
  FaFilter,
  FaClock,
  FaUser,
  FaUserMd,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle
} from 'react-icons/fa'
import { Card, Button, Input, Select, LoadingSpinner, StatusBadge, Pagination } from '../../../components'
import { useTheme } from '../../../contexts/ThemeContext'
import { authUtils } from '../../../utils/auth'

const SecretaryAppointments = ({ userData, onTabChange }) => {
  const { isDarkMode } = useTheme()
  const [appointments, setAppointments] = useState([])
  const [dentists, setDentists] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterDentist, setFilterDentist] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false)
  const itemsPerPage = 10

  useEffect(() => {
    fetchAppointments()
    fetchDentists()
  }, [])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const token = authUtils.getAccessToken()
      
      const response = await fetch('http://localhost:5000/api/appointments/clinic', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setAppointments(data.appointments || [])
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
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

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A'
    try {
      const [hours, minutes] = timeString.split(':')
      const hour = parseInt(hours)
      const ampm = hour >= 12 ? 'PM' : 'AM'
      const displayHour = hour % 12 || 12
      return `${displayHour}:${minutes} ${ampm}`
    } catch (error) {
      return timeString
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'yellow',
      confirmed: 'blue',
      completed: 'green',
      cancelled: 'red'
    }
    return colors[status] || 'gray'
  }

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      const token = authUtils.getAccessToken()
      
      const response = await fetch(`http://localhost:5000/api/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (response.ok) {
        fetchAppointments()
      }
    } catch (error) {
      console.error('Error updating appointment status:', error)
    }
  }

  // Filter and search appointments
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      appointment.patient?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.patient?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.dentist?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.dentist?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || appointment.status === filterStatus
    const matchesDentist = filterDentist === 'all' || appointment.dentistId === parseInt(filterDentist)
    
    return matchesSearch && matchesStatus && matchesDentist
  })

  // Sort appointments by date and time
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    const dateA = new Date(a.date)
    const dateB = new Date(b.date)
    if (dateA.getTime() !== dateB.getTime()) {
      return dateA - dateB
    }
    return a.time?.localeCompare(b.time || '') || 0
  })

  // Pagination
  const totalPages = Math.ceil(sortedAppointments.length / itemsPerPage)
  const paginatedAppointments = sortedAppointments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
            Appointments Management
          </h2>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            View and manage all clinic appointments
          </p>
        </div>
        <Button
          variant="primary"
          className="flex items-center gap-2"
          onClick={() => setShowNewAppointmentModal(true)}
        >
          <FaPlus className="w-4 h-4" />
          New Appointment
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <Input
              type="text"
              placeholder="Search by patient or dentist name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </Select>

          <Select
            value={filterDentist}
            onChange={(e) => setFilterDentist(e.target.value)}
          >
            <option value="all">All Dentists</option>
            {dentists.map((dentist) => (
              <option key={dentist._id || dentist.userId} value={dentist._id || dentist.userId}>
                Dr. {dentist.firstName} {dentist.lastName}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={`p-4 border ${isDarkMode 
          ? 'bg-gray-800/50 border-gray-700' 
          : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
              <FaCalendarAlt className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <div>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total</p>
              <p className={`text-xl font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                {filteredAppointments.length}
              </p>
            </div>
          </div>
        </Card>

        <Card className={`p-4 border ${isDarkMode 
          ? 'bg-gray-800/50 border-gray-700' 
          : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-yellow-900/30' : 'bg-yellow-100'}`}>
              <FaClock className={`w-5 h-5 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
            </div>
            <div>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Scheduled</p>
              <p className={`text-xl font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                {filteredAppointments.filter(a => a.status === 'scheduled').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className={`p-4 border ${isDarkMode 
          ? 'bg-gray-800/50 border-gray-700' 
          : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-green-900/30' : 'bg-green-100'}`}>
              <FaCheckCircle className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
            </div>
            <div>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Confirmed</p>
              <p className={`text-xl font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                {filteredAppointments.filter(a => a.status === 'confirmed').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className={`p-4 border ${isDarkMode 
          ? 'bg-gray-800/50 border-gray-700' 
          : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-red-900/30' : 'bg-red-100'}`}>
              <FaTimesCircle className={`w-5 h-5 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
            </div>
            <div>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Cancelled</p>
              <p className={`text-xl font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                {filteredAppointments.filter(a => a.status === 'cancelled').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Appointments List */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : paginatedAppointments.length === 0 ? (
          <div className="text-center py-12">
            <FaCalendarAlt className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              No appointments found
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                      Patient
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                      Dentist
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                      Date & Time
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                      Reason
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                      Status
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {paginatedAppointments.map((appointment) => (
                    <tr key={appointment.id} className={`${isDarkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'} transition-colors`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isDarkMode ? 'bg-teal-900/30' : 'bg-teal-100'
                          }`}>
                            <FaUser className={`w-4 h-4 ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`} />
                          </div>
                          <div className="ml-3">
                            <p className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                              {appointment.patient?.firstName} {appointment.patient?.lastName}
                            </p>
                            {appointment.patient?.user?.phone && (
                              <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                {appointment.patient.user.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FaUserMd className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                          <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                            Dr. {appointment.dentist?.firstName} {appointment.dentist?.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                            {formatDate(appointment.date)}
                          </p>
                          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {formatTime(appointment.time)}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                          {appointment.reason || 'General checkup'}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={appointment.status} variant={getStatusColor(appointment.status)} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          {appointment.status === 'scheduled' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateStatus(appointment.id, 'confirmed')}
                              title="Confirm appointment"
                            >
                              <FaCheckCircle className="w-4 h-4 text-green-600" />
                            </Button>
                          )}
                          {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateStatus(appointment.id, 'cancelled')}
                              title="Cancel appointment"
                            >
                              <FaTimesCircle className="w-4 h-4 text-red-600" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  )
}

export default SecretaryAppointments
