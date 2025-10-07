import { useState } from 'react'
import { 
  FaUsers,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaCalendarAlt,
  FaSearch,
  FaFilter,
  FaPlus,
  FaEdit,
  FaEye,
  FaFileAlt,
  FaBirthdayCake,
  FaMapMarkerAlt,
  FaTrash
} from 'react-icons/fa'
import { Card, Button, Input } from '../../../components'
import { useTheme } from '../../../contexts/ThemeContext'
import NewPatientModal from '../../../components/dentist/NewPatientModal'
import EditPatientModal from '../../../components/dentist/EditPatientModal'
import DeleteConfirmationModal from '../../../components/dentist/DeleteConfirmationModal'
import PatientDetailsModal from '../../../components/dentist/PatientDetailsModal'

const DentistPatients = () => {
  const { isDarkMode } = useTheme()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [viewMode, setViewMode] = useState('grid') // grid or list
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false)
  const [isEditPatientModalOpen, setIsEditPatientModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null)

  // Mock patients data
  const mockPatients = [
    {
      id: 1,
      name: 'John Smith',
      email: 'john@email.com',
      phone: '+1234567890',
      dateOfBirth: '1985-03-15',
      address: 'New York, NY',
      lastVisit: '2024-01-15',
      nextAppointment: '2024-02-20',
      totalVisits: 8,
      status: 'active',
      medicalHistory: ['Diabetes', 'High Blood Pressure'],
      avatar: null
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah@email.com',
      phone: '+1234567891',
      dateOfBirth: '1990-07-22',
      address: 'Los Angeles, CA',
      lastVisit: '2024-01-20',
      nextAppointment: null,
      totalVisits: 12,
      status: 'active',
      medicalHistory: ['Allergic to Penicillin'],
      avatar: null
    },
    {
      id: 3,
      name: 'Mike Wilson',
      email: 'mike@email.com',
      phone: '+1234567892',
      dateOfBirth: '1978-11-03',
      address: 'Chicago, IL',
      lastVisit: '2023-12-10',
      nextAppointment: '2024-02-25',
      totalVisits: 5,
      status: 'inactive',
      medicalHistory: [],
      avatar: null
    },
    {
      id: 4,
      name: 'Emily Davis',
      email: 'emily@email.com',
      phone: '+1234567893',
      dateOfBirth: '1995-05-18',
      address: 'Houston, TX',
      lastVisit: '2024-01-25',
      nextAppointment: '2024-02-15',
      totalVisits: 3,
      status: 'active',
      medicalHistory: ['Gum Disease'],
      avatar: null
    }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'new':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const calculateAge = (dateOfBirth) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const filteredPatients = mockPatients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.phone.includes(searchTerm)
    const matchesFilter = selectedFilter === 'all' || patient.status === selectedFilter
    return matchesSearch && matchesFilter
  })

  // Modal handlers
  const handleNewPatient = () => {
    setIsNewPatientModalOpen(true)
  }

  const handleCloseNewPatientModal = () => {
    setIsNewPatientModalOpen(false)
  }

  const handleSaveNewPatient = (patientData) => {
    // Here you would typically save to your backend
    console.log('New patient:', patientData)
    // For now, just log the data
    // You can implement the actual save logic here
  }

  const handleEditPatient = (patient) => {
    setSelectedPatient(patient)
    setIsEditPatientModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setIsEditPatientModalOpen(false)
    setSelectedPatient(null)
  }

  const handleUpdatePatient = (updatedPatient) => {
    // Here you would typically update in your backend
    console.log('Updated patient:', updatedPatient)
    // For now, just log the data
    // You can implement the actual update logic here
  }

  const handleDeletePatient = (patient) => {
    setSelectedPatient(patient)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = () => {
    // Here you would typically delete from your backend
    console.log('Delete patient:', selectedPatient.id)
    // You can implement the actual delete logic here
    setIsDeleteModalOpen(false)
    setSelectedPatient(null)
  }

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setSelectedPatient(null)
  }

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient)
    setIsDetailsModalOpen(true)
  }

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false)
    setSelectedPatient(null)
  }

  const handleEditFromDetails = (patient) => {
    setIsDetailsModalOpen(false)
    setSelectedPatient(patient)
    setIsEditPatientModalOpen(true)
  }

  const PatientCard = ({ patient }) => (
    <Card className={`p-6 ${
      isDarkMode ? 'bg-gray-800' : 'bg-white'
    } hover:shadow-lg transition-shadow`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isDarkMode ? 'bg-teal-900' : 'bg-teal-100'
          }`}>
            <FaUser className="text-teal-600" />
          </div>
          <div>
            <h3 className={`font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>
              {patient.name}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs border ${
              getStatusColor(patient.status)
            }`}>
              {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleViewPatient(patient)}
            title="View Patient Details"
          >
            <FaEye className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleEditPatient(patient)}
            title="Edit Patient"
          >
            <FaEdit className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-red-600"
            onClick={() => handleDeletePatient(patient)}
            title="Delete Patient"
          >
            <FaTrash className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <FaBirthdayCake className="text-gray-500" />
          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
            Age: {calculateAge(patient.dateOfBirth)} years
          </span>
        </div>
        <div className="flex items-center gap-2">
          <FaPhone className="text-gray-500" />
          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
            {patient.phone}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <FaEnvelope className="text-gray-500" />
          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
            {patient.email}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <FaMapMarkerAlt className="text-gray-500" />
          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
            {patient.address}
          </span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className={`font-medium ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Last Visit
            </p>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
              {formatDate(patient.lastVisit)}
            </p>
          </div>
          <div>
            <p className={`font-medium ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Next Visit
            </p>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
              {formatDate(patient.nextAppointment)}
            </p>
          </div>
        </div>
        <div className="mt-2">
          <p className={`font-medium ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Total Visits: {patient.totalVisits}
          </p>
        </div>
      </div>
    </Card>
  )

  const PatientRow = ({ patient }) => (
    <Card className={`p-4 ${
      isDarkMode ? 'bg-gray-800' : 'bg-white'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isDarkMode ? 'bg-teal-900' : 'bg-teal-100'
          }`}>
            <FaUser className="text-teal-600" />
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <h3 className={`font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>
                {patient.name}
              </h3>
              <span className={`px-2 py-1 rounded-full text-xs border ${
                getStatusColor(patient.status)
              }`}>
                {patient.status}
              </span>
            </div>
            <div className="text-sm">
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                {patient.phone}
              </p>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                {patient.email}
              </p>
            </div>
            <div className="text-sm">
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                Last: {formatDate(patient.lastVisit)}
              </p>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                Next: {formatDate(patient.nextAppointment)}
              </p>
            </div>
            <div className="text-sm">
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                {patient.totalVisits} visits
              </p>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                Age: {calculateAge(patient.dateOfBirth)}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleViewPatient(patient)}
            title="View Patient Details"
          >
            <FaEye className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleEditPatient(patient)}
            title="Edit Patient"
          >
            <FaEdit className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-red-600"
            onClick={() => handleDeletePatient(patient)}
            title="Delete Patient"
          >
            <FaTrash className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            My Patients
          </h1>
          <p className={`mt-1 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Manage patient records and information
          </p>
        </div>
        <Button variant="primary" onClick={handleNewPatient}>
          <FaPlus className="w-4 h-4 mr-2" />
          Add Patient
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={`p-4 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Total Patients</p>
              <p className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>{mockPatients.length}</p>
            </div>
            <FaUsers className="w-8 h-8 text-blue-500" />
          </div>
        </Card>

        <Card className={`p-4 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Active</p>
              <p className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>{mockPatients.filter(p => p.status === 'active').length}</p>
            </div>
            <FaUser className="w-8 h-8 text-green-500" />
          </div>
        </Card>

        <Card className={`p-4 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>This Month</p>
              <p className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>12</p>
            </div>
            <FaCalendarAlt className="w-8 h-8 text-purple-500" />
          </div>
        </Card>

        <Card className={`p-4 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Reports</p>
              <p className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>45</p>
            </div>
            <FaFileAlt className="w-8 h-8 text-orange-500" />
          </div>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card className={`p-4 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={FaSearch}
              />
            </div>
            <div className="sm:w-48">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">All Patients</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="new">New</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${
                viewMode === 'grid'
                  ? 'bg-teal-600 text-white'
                  : isDarkMode
                    ? 'bg-gray-700 text-gray-300'
                    : 'bg-gray-100 text-gray-600'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${
                viewMode === 'list'
                  ? 'bg-teal-600 text-white'
                  : isDarkMode
                    ? 'bg-gray-700 text-gray-300'
                    : 'bg-gray-100 text-gray-600'
              }`}
            >
              List
            </button>
          </div>
        </div>
      </Card>

      {/* Patients Display */}
      {filteredPatients.length === 0 ? (
        <Card className={`p-8 text-center ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <FaUsers className={`w-12 h-12 mx-auto mb-4 ${
            isDarkMode ? 'text-gray-500' : 'text-gray-400'
          }`} />
          <h3 className={`text-lg font-semibold mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            No patients found
          </h3>
          <p className={`${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            No patients match your current search or filter
          </p>
        </Card>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'space-y-4'
        }>
          {filteredPatients.map((patient) => (
            viewMode === 'grid' 
              ? <PatientCard key={patient.id} patient={patient} />
              : <PatientRow key={patient.id} patient={patient} />
          ))}
        </div>
      )}

      {/* New Patient Modal */}
      <NewPatientModal
        isOpen={isNewPatientModalOpen}
        onClose={handleCloseNewPatientModal}
        onSave={handleSaveNewPatient}
      />

      {/* Edit Patient Modal */}
      <EditPatientModal
        isOpen={isEditPatientModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleUpdatePatient}
        patientData={selectedPatient}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        appointmentData={selectedPatient ? {
          patient: { name: selectedPatient.name },
          treatment: 'Patient Record',
          time: ''
        } : null}
      />

      {/* Patient Details Modal */}
      <PatientDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        patientData={selectedPatient}
        onEdit={handleEditFromDetails}
      />
    </div>
  )
}

export default DentistPatients