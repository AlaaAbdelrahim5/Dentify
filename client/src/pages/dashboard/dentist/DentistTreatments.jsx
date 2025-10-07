import { useState } from 'react'
import { 
  FaStethoscope,
  FaUser,
  FaCalendarAlt,
  FaClock,
  FaDollarSign,
  FaSearch,
  FaFilter,
  FaPlus,
  FaEdit,
  FaEye,
  FaTrash,
  FaCheck,
  FaPlay,
  FaPause,
  FaTooth,
  FaExclamationTriangle,
  FaListAlt,
  FaTh
} from 'react-icons/fa'
import { Card, Button, Input } from '../../../components'
import { useTheme } from '../../../contexts/ThemeContext'
import NewTreatmentModal from '../../../components/dentist/NewTreatmentModal'
import TreatmentDetailsModal from '../../../components/dentist/TreatmentDetailsModal'
import DeleteConfirmationModal from '../../../components/dentist/DeleteConfirmationModal'

const DentistTreatments = () => {
  const { isDarkMode } = useTheme()
  const [activeView, setActiveView] = useState('active') // active, completed, all
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedPriority, setSelectedPriority] = useState('all')
  const [viewMode, setViewMode] = useState('grid') // grid or list
  const [isNewTreatmentModalOpen, setIsNewTreatmentModalOpen] = useState(false)
  const [isTreatmentDetailsModalOpen, setIsTreatmentDetailsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedTreatment, setSelectedTreatment] = useState(null)

  // Mock treatments data
  const mockTreatments = [
    {
      id: 1,
      patientName: 'John Smith',
      treatmentType: 'Root Canal',
      toothNumber: '14',
      description: 'Root canal treatment for infected tooth',
      estimatedDuration: '120',
      estimatedCost: '800.00',
      priority: 'high',
      status: 'in-progress',
      startDate: '2024-01-15',
      completionDate: '2024-02-15',
      notes: 'Patient experiencing mild discomfort',
      preConditions: 'Pre-medication required',
      postCareInstructions: 'Avoid hard foods for 24 hours'
    },
    {
      id: 2,
      patientName: 'Sarah Johnson',
      treatmentType: 'Dental Cleaning',
      toothNumber: '',
      description: 'Routine dental cleaning and checkup',
      estimatedDuration: '60',
      estimatedCost: '120.00',
      priority: 'medium',
      status: 'planned',
      startDate: '2024-02-20',
      completionDate: '2024-02-20',
      notes: 'Regular maintenance cleaning',
      preConditions: '',
      postCareInstructions: 'Continue regular brushing and flossing'
    },
    {
      id: 3,
      patientName: 'Mike Wilson',
      treatmentType: 'Crown Installation',
      toothNumber: '25',
      description: 'Ceramic crown installation on molar',
      estimatedDuration: '90',
      estimatedCost: '1200.00',
      priority: 'medium',
      status: 'completed',
      startDate: '2024-01-10',
      completionDate: '2024-01-25',
      notes: 'Crown fitted successfully',
      preConditions: 'Root canal completed',
      postCareInstructions: 'Avoid sticky foods for 48 hours'
    },
    {
      id: 4,
      patientName: 'Emily Davis',
      treatmentType: 'Tooth Extraction',
      toothNumber: '18',
      description: 'Wisdom tooth extraction due to impaction',
      estimatedDuration: '45',
      estimatedCost: '300.00',
      priority: 'urgent',
      status: 'planned',
      startDate: '2024-02-10',
      completionDate: '2024-02-10',
      notes: 'Impacted wisdom tooth causing pain',
      preConditions: 'Antibiotics prescribed',
      postCareInstructions: 'Ice pack for 20 minutes every hour'
    }
  ]

  // Mock patients for new treatment modal
  const mockPatients = [
    { id: 1, name: 'John Smith' },
    { id: 2, name: 'Sarah Johnson' },
    { id: 3, name: 'Mike Wilson' },
    { id: 4, name: 'Emily Davis' },
    { id: 5, name: 'Robert Brown' }
  ]

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'planned':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const filteredTreatments = mockTreatments.filter(treatment => {
    const matchesSearch = treatment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         treatment.treatmentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         treatment.toothNumber.includes(searchTerm)
    
    const matchesView = activeView === 'all' || 
                       (activeView === 'active' && ['planned', 'in-progress'].includes(treatment.status)) ||
                       (activeView === 'completed' && treatment.status === 'completed')
    
    const matchesStatus = selectedStatus === 'all' || treatment.status === selectedStatus
    const matchesPriority = selectedPriority === 'all' || treatment.priority === selectedPriority
    
    return matchesSearch && matchesView && matchesStatus && matchesPriority
  })

  const getStats = () => {
    const total = mockTreatments.length
    const active = mockTreatments.filter(t => ['planned', 'in-progress'].includes(t.status)).length
    const completed = mockTreatments.filter(t => t.status === 'completed').length
    const urgent = mockTreatments.filter(t => t.priority === 'urgent').length
    
    return { total, active, completed, urgent }
  }

  const stats = getStats()

  // Modal handlers
  const handleNewTreatment = () => {
    setIsNewTreatmentModalOpen(true)
  }

  const handleCloseNewTreatmentModal = () => {
    setIsNewTreatmentModalOpen(false)
  }

  const handleSaveNewTreatment = (treatmentData) => {
    console.log('New treatment:', treatmentData)
    // Here you would typically save to your backend
  }

  const handleViewTreatment = (treatment) => {
    setSelectedTreatment(treatment)
    setIsTreatmentDetailsModalOpen(true)
  }

  const handleCloseTreatmentDetailsModal = () => {
    setIsTreatmentDetailsModalOpen(false)
    setSelectedTreatment(null)
  }

  const handleEditTreatment = (treatment) => {
    console.log('Edit treatment:', treatment)
    // Here you would open edit modal or navigate to edit page
  }

  const handleDeleteTreatment = (treatment) => {
    setSelectedTreatment(treatment)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = () => {
    console.log('Delete treatment:', selectedTreatment.id)
    setIsDeleteModalOpen(false)
    setSelectedTreatment(null)
  }

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setSelectedTreatment(null)
  }

  const handleUpdateStatus = (treatmentId, newStatus) => {
    console.log('Update status:', treatmentId, newStatus)
    // Here you would update the treatment status in your backend
  }

  const TreatmentCard = ({ treatment }) => (
    <Card className={`p-6 ${
      isDarkMode ? 'bg-gray-800' : 'bg-white'
    } hover:shadow-lg transition-shadow`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isDarkMode ? 'bg-teal-900' : 'bg-teal-100'
          }`}>
            <FaTooth className="text-teal-600" />
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
              {treatment.toothNumber && ` • Tooth #${treatment.toothNumber}`}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <span className={`px-2 py-1 rounded-full text-xs border ${
            getPriorityColor(treatment.priority)
          }`}>
            {treatment.priority.charAt(0).toUpperCase() + treatment.priority.slice(1)}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs border ${
            getStatusColor(treatment.status)
          }`}>
            {treatment.status.charAt(0).toUpperCase() + treatment.status.slice(1)}
          </span>
        </div>
      </div>

      <p className={`text-sm mb-4 ${
        isDarkMode ? 'text-gray-300' : 'text-gray-600'
      }`}>
        {treatment.description}
      </p>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <FaClock className="text-gray-500" />
          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
            {treatment.estimatedDuration} min
          </span>
        </div>
        <div className="flex items-center gap-2">
          <FaDollarSign className="text-gray-500" />
          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
            ${treatment.estimatedCost}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <FaCalendarAlt className="text-gray-500" />
          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
            {new Date(treatment.startDate).toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <FaExclamationTriangle className="text-gray-500" />
          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
            {treatment.priority} priority
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
        {treatment.status === 'planned' && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleUpdateStatus(treatment.id, 'in-progress')}
            title="Start Treatment"
            className="text-blue-600"
          >
            <FaPlay className="w-4 h-4" />
          </Button>
        )}
        {treatment.status === 'in-progress' && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleUpdateStatus(treatment.id, 'completed')}
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

  return (
    <div className="space-y-6">
      {/* Header */}
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
            Manage treatment plans and procedures
          </p>
        </div>
        <Button variant="primary" onClick={handleNewTreatment}>
          <FaPlus className="w-4 h-4 mr-2" />
          New Treatment Plan
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className={`p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Total Treatments</p>
              <p className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>{stats.total}</p>
            </div>
            <FaStethoscope className="w-8 h-8 text-teal-500" />
          </div>
        </Card>

        <Card className={`p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Active Treatments</p>
              <p className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>{stats.active}</p>
            </div>
            <FaPlay className="w-8 h-8 text-blue-500" />
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
              }`}>{stats.completed}</p>
            </div>
            <FaCheck className="w-8 h-8 text-green-500" />
          </div>
        </Card>

        <Card className={`p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Urgent Cases</p>
              <p className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>{stats.urgent}</p>
            </div>
            <FaExclamationTriangle className="w-8 h-8 text-red-500" />
          </div>
        </Card>
      </div>

      {/* View Selector */}
      <Card className={`p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex flex-wrap gap-2">
          {['active', 'completed', 'all'].map((view) => (
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
              {view === 'active' ? 'Active Treatments' : view === 'completed' ? 'Completed' : 'All Treatments'}
            </button>
          ))}
        </div>
      </Card>

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
              <option value="planned">Planned</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="on-hold">On Hold</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className={`px-3 py-2 border rounded-lg ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <div className="flex border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 ${
                  viewMode === 'grid'
                    ? 'bg-teal-600 text-white'
                    : isDarkMode
                      ? 'bg-gray-700 text-gray-300'
                      : 'bg-gray-100 text-gray-700'
                }`}
              >
                <FaTh className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 ${
                  viewMode === 'list'
                    ? 'bg-teal-600 text-white'
                    : isDarkMode
                      ? 'bg-gray-700 text-gray-300'
                      : 'bg-gray-100 text-gray-700'
                }`}
              >
                <FaListAlt className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Treatments List */}
      {filteredTreatments.length === 0 ? (
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
            <TreatmentCard key={treatment.id} treatment={treatment} />
          ))}
        </div>
      )}

      {/* Modals */}
      <NewTreatmentModal
        isOpen={isNewTreatmentModalOpen}
        onClose={handleCloseNewTreatmentModal}
        onSave={handleSaveNewTreatment}
        patients={mockPatients}
      />

      <TreatmentDetailsModal
        isOpen={isTreatmentDetailsModalOpen}
        onClose={handleCloseTreatmentDetailsModal}
        treatmentData={selectedTreatment}
        onEdit={handleEditTreatment}
        onUpdateStatus={handleUpdateStatus}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        appointmentData={selectedTreatment ? {
          patient: { name: selectedTreatment.patientName },
          treatment: selectedTreatment.treatmentType,
          time: ''
        } : null}
      />
    </div>
  )
}

export default DentistTreatments