import { useState } from 'react'
import { useTheme } from '../../../contexts/ThemeContext'
import {
  FaStethoscope,
  FaPlus,
  FaSearch,
  FaTh,
  FaListAlt,
  FaCheck,
  FaEye,
  FaEdit,
  FaTrash,
  FaDollarSign,
  FaCalendarAlt,
  FaTooth,
  FaMoneyBillWave,
  FaXRay,
  FaExclamationTriangle
} from 'react-icons/fa'
import { Card, Button, Input } from '../../../components'
import NewTreatmentModal from '../../../components/dentist/NewTreatmentModal'
import TreatmentDetailsModal from '../../../components/dentist/TreatmentDetailsModal'
import PaymentModal from '../../../components/dentist/PaymentModal'
import RadiologyRequestModal from '../../../components/dentist/RadiologyRequestModal'
import DeleteConfirmationModal from '../../../components/dentist/DeleteConfirmationModal'
import TreatmentTeethStatus from '../../../components/dentist/TreatmentTeethStatus'
import TreatmentPlanCard from '../../../components/dentist/TreatmentPlanCard'

const DentistTreatments = () => {
  const { isDarkMode } = useTheme()
  const [activeView, setActiveView] = useState('active') // active, completed, all
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [viewMode, setViewMode] = useState('grid') // grid or list
  
  // Modals state
  const [isNewTreatmentModalOpen, setIsNewTreatmentModalOpen] = useState(false)
  const [isTreatmentDetailsModalOpen, setIsTreatmentDetailsModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isRadiologyModalOpen, setIsRadiologyModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedTreatment, setSelectedTreatment] = useState(null)

  // Mock treatments data with new database structure
  const mockTreatments = [
    {
      id: 1,
      patientId: 101,
      patientName: 'John Smith',
      dentistId: 1,
      treatmentType: 'Root Canal',
      description: 'Root canal treatment for infected tooth',
      treatmentStatus: 'In Progress',
      creationDate: '2024-01-15',
      totalAmount: 800.00,
      paidAmount: 400.00,
      notes: 'Patient experiencing mild discomfort',
      priority: 'High',
      steps: [
        { title: 'Diagnosis', status: 'completed', date: '2024-01-15', notes: 'Infected pulp confirmed' },
        { title: 'X-Ray & Analysis', status: 'completed', date: '2024-01-16', notes: 'Root canal imaging done' },
        { title: 'Root Canal Procedure', status: 'current', date: '2024-01-20', notes: 'Treatment in progress' },
        { title: 'Crown Installation', status: 'upcoming', date: '', notes: 'Scheduled after healing' },
        { title: 'Follow-up', status: 'upcoming', date: '', notes: 'Check after 2 weeks' }
      ],
      teethStatus: [
        {
          toothNumber: 14,
          conditionStatus: 'Root Canal',
          treatmentPriority: 'High',
          diagnosedDate: '2024-01-15',
          notes: 'Infected pulp'
        }
      ]
    },
    {
      id: 2,
      patientId: 102,
      patientName: 'Sarah Johnson',
      dentistId: 1,
      treatmentType: 'Cleaning',
      description: 'Routine dental cleaning and checkup',
      treatmentStatus: 'Completed',
      creationDate: '2024-02-01',
      totalAmount: 120.00,
      paidAmount: 120.00,
      notes: 'Regular maintenance cleaning',
      priority: 'Low',
      steps: [
        { title: 'Initial Checkup', status: 'completed', date: '2024-02-01', notes: 'No issues found' },
        { title: 'Cleaning', status: 'completed', date: '2024-02-01', notes: 'Deep cleaning done' },
        { title: 'Polishing', status: 'completed', date: '2024-02-01', notes: 'Teeth polished' },
        { title: 'Final Check', status: 'completed', date: '2024-02-01', notes: 'All clear' }
      ],
      teethStatus: []
    },
    {
      id: 3,
      patientId: 103,
      patientName: 'Mike Wilson',
      dentistId: 1,
      treatmentType: 'Crown Installation',
      description: 'Ceramic crown installation on molar',
      treatmentStatus: 'Completed',
      creationDate: '2024-01-10',
      totalAmount: 1200.00,
      paidAmount: 1200.00,
      notes: 'Crown fitted successfully',
      priority: 'Medium',
      steps: [
        { title: 'Diagnosis', status: 'completed', date: '2024-01-10', notes: 'Tooth prepared' },
        { title: 'Tooth Preparation', status: 'completed', date: '2024-01-11', notes: 'Shaped for crown' },
        { title: 'Impression', status: 'completed', date: '2024-01-11', notes: 'Mold taken' },
        { title: 'Temporary Crown', status: 'completed', date: '2024-01-12', notes: 'Temporary installed' },
        { title: 'Crown Installation', status: 'completed', date: '2024-01-20', notes: 'Permanent crown fitted' }
      ],
      teethStatus: [
        {
          toothNumber: 25,
          conditionStatus: 'Crown',
          treatmentPriority: 'Medium',
          diagnosedDate: '2024-01-10',
          notes: 'Crown installation complete'
        }
      ]
    },
    {
      id: 4,
      patientId: 104,
      patientName: 'Emily Davis',
      dentistId: 1,
      treatmentType: 'Extraction',
      description: 'Wisdom tooth extraction due to impaction',
      treatmentStatus: 'In Progress',
      creationDate: '2024-02-10',
      totalAmount: 300.00,
      paidAmount: 0.00,
      notes: 'Impacted wisdom tooth causing pain',
      priority: 'High',
      steps: [
        { title: 'Consultation', status: 'completed', date: '2024-02-10', notes: 'Impaction confirmed' },
        { title: 'X-Ray', status: 'completed', date: '2024-02-11', notes: 'Position verified' },
        { title: 'Extraction Procedure', status: 'current', date: '2024-02-15', notes: 'Scheduled for extraction' },
        { title: 'Post-Op Care', status: 'upcoming', date: '', notes: 'Recovery monitoring' }
      ],
      teethStatus: [
        {
          toothNumber: 18,
          conditionStatus: 'Extracted',
          treatmentPriority: 'High',
          diagnosedDate: '2024-02-10',
          notes: 'Requires extraction'
        }
      ]
    },
    {
      id: 5,
      patientId: 105,
      patientName: 'Robert Brown',
      dentistId: 1,
      treatmentType: 'Filling',
      description: 'Multiple cavity fillings',
      treatmentStatus: 'In Progress',
      creationDate: '2024-02-15',
      totalAmount: 450.00,
      paidAmount: 225.00,
      notes: 'Three cavities detected',
      priority: 'Medium',
      steps: [
        { title: 'Diagnosis', status: 'completed', date: '2024-02-15', notes: 'Three cavities found' },
        { title: 'First Filling', status: 'completed', date: '2024-02-16', notes: 'Tooth #12 done' },
        { title: 'Second Filling', status: 'current', date: '2024-02-20', notes: 'Tooth #19 in progress' },
        { title: 'Third Filling', status: 'upcoming', date: '', notes: 'Tooth #30 pending' },
        { title: 'Follow-up', status: 'upcoming', date: '', notes: 'Check after 1 week' }
      ],
      teethStatus: [
        {
          toothNumber: 12,
          conditionStatus: 'Cavity',
          treatmentPriority: 'Medium',
          diagnosedDate: '2024-02-15',
          notes: 'Small cavity'
        },
        {
          toothNumber: 19,
          conditionStatus: 'Cavity',
          treatmentPriority: 'High',
          diagnosedDate: '2024-02-15',
          notes: 'Deep cavity'
        },
        {
          toothNumber: 30,
          conditionStatus: 'Cavity',
          treatmentPriority: 'Low',
          diagnosedDate: '2024-02-15',
          notes: 'Surface cavity'
        }
      ]
    }
  ]

  // Mock patients for new treatment modal
  const mockPatients = [
    { id: 101, name: 'John Smith' },
    { id: 102, name: 'Sarah Johnson' },
    { id: 103, name: 'Mike Wilson' },
    { id: 104, name: 'Emily Davis' },
    { id: 105, name: 'Robert Brown' }
  ]

  // Mock radiology centers
  const mockRadiologyCenters = [
    { id: 1, name: 'Central Radiology Center' },
    { id: 2, name: 'Advanced Imaging Clinic' },
    { id: 3, name: 'DentaScan Radiology' }
  ]

  // Mock payments (in real app, this would be fetched per treatment)
  const mockPayments = {
    1: [
      { amount: 200, paymentMethod: 'Cash', paymentDate: '2024-01-15', notes: 'Initial payment' },
      { amount: 200, paymentMethod: 'Card', paymentDate: '2024-01-22', notes: 'Second installment' }
    ],
    5: [
      { amount: 225, paymentMethod: 'Card', paymentDate: '2024-02-15', notes: 'Down payment' }
    ]
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress':
        return isDarkMode 
          ? 'bg-blue-900/30 text-blue-400 border-blue-600' 
          : 'bg-blue-100 text-blue-700 border-blue-400'
      case 'Completed':
        return isDarkMode 
          ? 'bg-green-900/30 text-green-400 border-green-600' 
          : 'bg-green-100 text-green-700 border-green-400'
      case 'Cancelled':
        return isDarkMode 
          ? 'bg-red-900/30 text-red-400 border-red-600' 
          : 'bg-red-100 text-red-700 border-red-400'
      default:
        return isDarkMode 
          ? 'bg-gray-800 text-gray-300 border-gray-600' 
          : 'bg-white text-gray-700 border-gray-300'
    }
  }

  const filteredTreatments = mockTreatments.filter(treatment => {
    const matchesSearch = treatment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         treatment.treatmentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         treatment.teethStatus?.some(t => t.toothNumber.toString().includes(searchTerm))
    
    const matchesView = activeView === 'all' || 
                       (activeView === 'active' && treatment.treatmentStatus === 'In Progress') ||
                       (activeView === 'completed' && treatment.treatmentStatus === 'Completed')
    
    const matchesStatus = selectedStatus === 'all' || treatment.treatmentStatus === selectedStatus
    
    return matchesSearch && matchesView && matchesStatus
  })

  const getStats = () => {
    const total = mockTreatments.length
    const active = mockTreatments.filter(t => t.treatmentStatus === 'In Progress').length
    const completed = mockTreatments.filter(t => t.treatmentStatus === 'Completed').length
    const totalRevenue = mockTreatments.reduce((sum, t) => sum + t.paidAmount, 0)
    const pendingPayments = mockTreatments.reduce((sum, t) => sum + (t.totalAmount - t.paidAmount), 0)
    
    return { total, active, completed, totalRevenue, pendingPayments }
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
    setIsTreatmentDetailsModalOpen(false)
    // Open edit modal (reuse NewTreatmentModal with initialData)
    setSelectedTreatment(treatment)
    setIsNewTreatmentModalOpen(true)
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
    setIsTreatmentDetailsModalOpen(false)
  }

  const handleAddPayment = (treatment) => {
    setSelectedTreatment(treatment)
    setIsTreatmentDetailsModalOpen(false)
    setIsPaymentModalOpen(true)
  }

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false)
    setSelectedTreatment(null)
  }

  const handleSavePayment = (paymentData) => {
    console.log('New payment:', paymentData)
    // Here you would save payment to backend
  }

  const handleRequestRadiology = (treatment) => {
    setSelectedTreatment(treatment)
    setIsTreatmentDetailsModalOpen(false)
    setIsRadiologyModalOpen(true)
  }

  const handleCloseRadiologyModal = () => {
    setIsRadiologyModalOpen(false)
    setSelectedTreatment(null)
  }

  const handleSaveRadiologyRequest = (requestData) => {
    console.log('New radiology request:', requestData)
    // Here you would save radiology request to backend
  }

  const TreatmentCard = ({ treatment }) => {
    const remainingBalance = treatment.totalAmount - treatment.paidAmount
    const paymentProgress = (treatment.paidAmount / treatment.totalAmount) * 100

    return (
      <Card className={`p-6 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      } hover:shadow-lg transition-shadow`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isDarkMode ? 'bg-teal-900' : 'bg-teal-100'
            }`}>
              <FaStethoscope className="text-teal-600" />
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
              </p>
            </div>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs border ${
            getStatusColor(treatment.treatmentStatus)
          }`}>
            {treatment.treatmentStatus}
          </span>
        </div>

        {treatment.description && (
          <p className={`text-sm mb-4 line-clamp-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {treatment.description}
          </p>
        )}

        {/* Teeth Status Preview */}
        {treatment.teethStatus && treatment.teethStatus.length > 0 && (
          <div className="mb-4">
            <TreatmentTeethStatus teethStatus={treatment.teethStatus} compact={true} />
          </div>
        )}

        {/* Payment Info */}
        <div className={`p-3 rounded-lg mb-4 ${
          isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Payment Progress
            </span>
            <span className={`text-xs font-semibold ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {paymentProgress.toFixed(0)}%
            </span>
          </div>
          <div className={`w-full h-2 rounded-full overflow-hidden mb-2 ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
          }`}>
            <div
              className="h-full bg-gradient-to-r from-green-500 to-teal-500"
              style={{ width: `${paymentProgress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs">
            <div>
              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                Paid:{' '}
              </span>
              <span className={`font-semibold ${
                isDarkMode ? 'text-green-400' : 'text-green-600'
              }`}>
                ${treatment.paidAmount.toFixed(2)}
              </span>
            </div>
            <div>
              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                Balance:{' '}
              </span>
              <span className={`font-semibold ${
                remainingBalance > 0
                  ? isDarkMode ? 'text-orange-400' : 'text-orange-600'
                  : isDarkMode ? 'text-green-400' : 'text-green-600'
              }`}>
                ${remainingBalance.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <FaCalendarAlt className="text-gray-500" />
            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
              {new Date(treatment.creationDate).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FaDollarSign className="text-gray-500" />
            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
              ${treatment.totalAmount.toFixed(2)}
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
          {remainingBalance > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleAddPayment(treatment)}
              title="Add Payment"
              className="text-green-600"
            >
              <FaMoneyBillWave className="w-4 h-4" />
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleRequestRadiology(treatment)}
            title="Request Radiology"
            className="text-purple-600"
          >
            <FaXRay className="w-4 h-4" />
          </Button>
          {treatment.treatmentStatus === 'In Progress' && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleUpdateStatus(treatment.id, 'Completed')}
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
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
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
            Manage treatment plans and track progress
          </p>
        </div>
        <Button variant="primary" onClick={handleNewTreatment}>
          <FaPlus className="w-4 h-4 mr-2" />
          New Treatment Plan
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
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
              }`}>Active</p>
              <p className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>{stats.active}</p>
            </div>
            <FaExclamationTriangle className="w-8 h-8 text-blue-500" />
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
              }`}>Total Revenue</p>
              <p className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>${stats.totalRevenue.toFixed(0)}</p>
            </div>
            <FaDollarSign className="w-8 h-8 text-green-500" />
          </div>
        </Card>

        <Card className={`p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Pending</p>
              <p className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>${stats.pendingPayments.toFixed(0)}</p>
            </div>
            <FaMoneyBillWave className="w-8 h-8 text-orange-500" />
          </div>
        </Card>
      </div>

      {/* View Tabs */}
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
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
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

      {/* Treatments Grid/List */}
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
            viewMode === 'grid' ? (
              <TreatmentPlanCard 
                key={treatment.id} 
                treatment={treatment}
                onClick={() => handleViewTreatment(treatment)}
              />
            ) : (
              <TreatmentCard key={treatment.id} treatment={treatment} />
            )
          ))}
        </div>
      )}

      {/* Modals */}
      <NewTreatmentModal
        isOpen={isNewTreatmentModalOpen}
        onClose={handleCloseNewTreatmentModal}
        onSave={handleSaveNewTreatment}
        patients={mockPatients}
        initialData={selectedTreatment && isNewTreatmentModalOpen ? selectedTreatment : null}
      />

      <TreatmentDetailsModal
        isOpen={isTreatmentDetailsModalOpen}
        onClose={handleCloseTreatmentDetailsModal}
        treatmentData={selectedTreatment}
        onEdit={handleEditTreatment}
        onUpdateStatus={handleUpdateStatus}
        onAddPayment={handleAddPayment}
        onRequestRadiology={handleRequestRadiology}
        onBookStepAppointment={(stepInfo) => {
          console.log('Book appointment for step:', stepInfo)
          // TODO: Open appointment booking modal with step info
        }}
        payments={selectedTreatment ? mockPayments[selectedTreatment.id] || [] : []}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={handleClosePaymentModal}
        onSave={handleSavePayment}
        treatmentInfo={selectedTreatment ? {
          id: selectedTreatment.id,
          treatmentType: selectedTreatment.treatmentType,
          patientName: selectedTreatment.patientName,
          totalAmount: selectedTreatment.totalAmount,
          paidAmount: selectedTreatment.paidAmount
        } : null}
      />

      <RadiologyRequestModal
        isOpen={isRadiologyModalOpen}
        onClose={handleCloseRadiologyModal}
        onSave={handleSaveRadiologyRequest}
        patients={mockPatients}
        radiologyCenters={mockRadiologyCenters}
        patientInfo={selectedTreatment ? {
          id: selectedTreatment.patientId,
          name: selectedTreatment.patientName
        } : null}
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
