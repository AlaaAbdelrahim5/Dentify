import { useState } from 'react'
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
  FaTimes
} from 'react-icons/fa'
import { Card, Button, Input } from '../../../components'
import { useTheme } from '../../../contexts/ThemeContext'
import NewAppointmentModal from '../../../components/dentist/NewAppointmentModal'
import EditAppointmentModal from '../../../components/dentist/EditAppointmentModal'
import DeleteConfirmationModal from '../../../components/dentist/DeleteConfirmationModal'

const DentistAppointments = () => {
  const { isDarkMode } = useTheme()
  const [activeView, setActiveView] = useState('today') // today, week, month
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [isNewAppointmentModalOpen, setIsNewAppointmentModalOpen] = useState(false)
  const [isEditAppointmentModalOpen, setIsEditAppointmentModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)

  // Mock appointments data
  const mockAppointments = [
    {
      id: 1,
      time: '09:00 AM',
      duration: 30,
      patient: {
        name: 'John Smith',
        phone: '+1234567890',
        email: 'john@email.com'
      },
      treatment: 'Dental Cleaning',
      status: 'confirmed',
      notes: 'Regular checkup and cleaning'
    },
    {
      id: 2,
      time: '10:30 AM',
      duration: 60,
      patient: {
        name: 'Sarah Johnson',
        phone: '+1234567891',
        email: 'sarah@email.com'
      },
      treatment: 'Root Canal',
      status: 'confirmed',
      notes: 'Follow-up appointment'
    },
    {
      id: 3,
      time: '02:00 PM',
      duration: 45,
      patient: {
        name: 'Mike Wilson',
        phone: '+1234567892',
        email: 'mike@email.com'
      },
      treatment: 'Tooth Extraction',
      status: 'pending',
      notes: 'Wisdom tooth removal'
    },
    {
      id: 4,
      time: '03:30 PM',
      duration: 30,
      patient: {
        name: 'Emily Davis',
        phone: '+1234567893',
        email: 'emily@email.com'
      },
      treatment: 'Consultation',
      status: 'completed',
      notes: 'Initial consultation for braces'
    }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const handleNewAppointment = () => {
    setIsNewAppointmentModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsNewAppointmentModalOpen(false)
  }

  const handleSaveAppointment = (appointmentData) => {
    // Here you would typically save to your backend
    console.log('New appointment:', appointmentData)
    // For now, just log the data
    // You can implement the actual save logic here
  }

  const handleEditAppointment = (appointment) => {
    setSelectedAppointment(appointment)
    setIsEditAppointmentModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setIsEditAppointmentModalOpen(false)
    setSelectedAppointment(null)
  }

  const handleUpdateAppointment = (updatedAppointment) => {
    // Here you would typically update in your backend
    console.log('Updated appointment:', updatedAppointment)
    // For now, just log the data
    // You can implement the actual update logic here
  }

  const handleDeleteAppointment = (appointment) => {
    setSelectedAppointment(appointment)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = () => {
    // Here you would typically delete from your backend
    console.log('Delete appointment:', selectedAppointment.id)
    // You can implement the actual delete logic here
    setIsDeleteModalOpen(false)
    setSelectedAppointment(null)
  }

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setSelectedAppointment(null)
  }

  const handleConfirmAppointment = (appointmentId) => {
    console.log('Confirm appointment:', appointmentId)
    // Update appointment status to confirmed
  }

  const handleCancelAppointment = (appointmentId) => {
    console.log('Cancel appointment:', appointmentId)
    // Update appointment status to cancelled
  }

  const filteredAppointments = mockAppointments.filter(appointment => {
    const matchesSearch = appointment.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.treatment.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || appointment.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            Appointments
          </h1>
          <p className={`mt-1 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Manage your appointment schedule
          </p>
        </div>
        <Button variant="primary" onClick={handleNewAppointment}>
          <FaPlus className="w-4 h-4 mr-2" />
          New Appointment
        </Button>
      </div>

      {/* View Selector */}
      <Card className={`p-4 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="flex flex-wrap gap-2">
          {['today', 'week', 'month'].map((view) => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                activeView === view
                  ? 'bg-teal-600 text-white'
                  : isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {view}
            </button>
          ))}
        </div>
      </Card>

      {/* Filters */}
      <Card className={`p-4 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search patients or treatments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={FaSearch}
            />
          </div>
          <div className="sm:w-48">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAppointments.length === 0 ? (
          <Card className={`p-8 text-center ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <FaCalendarAlt className={`w-12 h-12 mx-auto mb-4 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`} />
            <h3 className={`text-lg font-semibold mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              No appointments found
            </h3>
            <p className={`${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              No appointments match your current filters
            </p>
          </Card>
        ) : (
          filteredAppointments.map((appointment) => (
            <Card key={appointment.id} className={`p-6 ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      <FaClock className="text-teal-600" />
                      <span className={isDarkMode ? 'text-white' : 'text-gray-800'}>
                        {appointment.time}
                      </span>
                      <span className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        ({appointment.duration} min)
                      </span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm border ${
                      getStatusColor(appointment.status)
                    }`}>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FaUser className="text-gray-500" />
                        <span className={`font-medium ${
                          isDarkMode ? 'text-white' : 'text-gray-800'
                        }`}>
                          {appointment.patient.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaPhone className="text-gray-500" />
                        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                          {appointment.patient.phone}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <div className={`font-medium mb-2 ${
                        isDarkMode ? 'text-white' : 'text-gray-800'
                      }`}>
                        {appointment.treatment}
                      </div>
                      <p className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {appointment.notes}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {appointment.status === 'pending' && (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleConfirmAppointment(appointment.id)}
                        title="Confirm Appointment"
                      >
                        <FaCheck className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600"
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
                    onClick={() => handleEditAppointment(appointment)}
                    title="Edit Appointment"
                  >
                    <FaEdit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-600"
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

      {/* New Appointment Modal */}
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
    </div>
  )
}

export default DentistAppointments