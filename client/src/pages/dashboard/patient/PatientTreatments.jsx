import { useState, useEffect, useMemo } from 'react'
import { useTheme } from '../../../contexts/ThemeContext'
import {
  FaStethoscope,
  FaSearch,
  FaTh,
  FaListAlt,
  FaCalendarAlt,
  FaTooth,
  FaDollarSign,
  FaUserMd,
  FaExclamationTriangle
} from 'react-icons/fa'
import { Card, Button, Input, LoadingSpinner, PageHeader } from '../../../components'
import TreatmentTeethStatus from '../../../components/dentist/TreatmentTeethStatus'
import { treatmentsAPI } from '../../../services/api'

const PatientTreatments = () => {
  const { isDarkMode } = useTheme()
  const [activeView, setActiveView] = useState('all') // active, completed, all
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [viewMode, setViewMode] = useState('grid') // grid or list
  
  // Data states
  const [treatments, setTreatments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch data on mount
  useEffect(() => {
    fetchTreatments()
  }, [])

  // Debounce search term to avoid excessive filtering
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const fetchTreatments = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('Fetching patient treatments...')
      const response = await treatmentsAPI.getPatientTreatments()
      console.log('Patient treatments response:', response)
      setTreatments(response.treatments || [])
    } catch (err) {
      console.error('Error fetching treatments:', err)
      setError('Failed to load treatments. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Transform treatment data from API
  const displayTreatments = useMemo(() => {
    return treatments.map(treatment => {
      // Parse teethStatus if it's a string, otherwise use as-is
      let teethStatus = []
      try {
        if (typeof treatment.teethStatus === 'string') {
          teethStatus = JSON.parse(treatment.teethStatus)
        } else if (Array.isArray(treatment.teethStatus)) {
          teethStatus = treatment.teethStatus
        }
      } catch (e) {
        console.error('Error parsing teethStatus:', e)
        teethStatus = []
      }

      // Convert database status to display format
      const statusMap = {
        'IN_PROGRESS': 'In Progress',
        'COMPLETED': 'Completed',
        'CANCELLED': 'Cancelled'
      }

      return {
        id: treatment.id,
        dentistName: `Dr. ${treatment.dentist.firstName} ${treatment.dentist.lastName}`,
        dentistSpecialization: treatment.dentist.specialization,
        treatmentType: treatment.treatmentType,
        description: treatment.description || '',
        treatmentStatus: statusMap[treatment.status] || treatment.status,
        creationDate: treatment.createdAt,
        totalAmount: treatment.totalAmount || 0,
        paidAmount: treatment.paidAmount || 0,
        notes: treatment.notes || '',
        teethStatus: teethStatus
      }
    })
  }, [treatments])

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress':
      case 'IN_PROGRESS':
        return isDarkMode 
          ? 'bg-green-900/30 text-green-400 border-green-600' 
          : 'bg-green-100 text-green-700 border-green-400'
      case 'Completed':
      case 'COMPLETED':
        return isDarkMode 
          ? 'bg-blue-900/30 text-blue-400 border-blue-600' 
          : 'bg-blue-100 text-blue-700 border-blue-400'
      case 'Cancelled':
      case 'CANCELLED':
        return isDarkMode 
          ? 'bg-red-900/30 text-red-400 border-red-600' 
          : 'bg-red-100 text-red-700 border-red-400'
      default:
        return isDarkMode 
          ? 'bg-gray-800 text-gray-300 border-gray-600' 
          : 'bg-white text-gray-700 border-gray-300'
    }
  }

  // Filter treatments
  const filteredTreatments = useMemo(() => {
    return displayTreatments.filter(treatment => {
      const matchesSearch = debouncedSearchTerm === '' || 
                           treatment.dentistName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                           treatment.treatmentType.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                           treatment.teethStatus?.some(t => t.toothNumber.toString().includes(debouncedSearchTerm))
      
      const matchesView = activeView === 'all' || 
                         (activeView === 'active' && treatment.treatmentStatus === 'In Progress') ||
                         (activeView === 'completed' && treatment.treatmentStatus === 'Completed')
      
      const matchesStatus = selectedStatus === 'all' || treatment.treatmentStatus === selectedStatus
      
      return matchesSearch && matchesView && matchesStatus
    })
  }, [displayTreatments, debouncedSearchTerm, activeView, selectedStatus])

  // Calculate stats
  const stats = useMemo(() => {
    const total = displayTreatments.length
    const active = displayTreatments.filter(t => t.treatmentStatus === 'In Progress' || t.treatmentStatus === 'IN_PROGRESS').length
    const completed = displayTreatments.filter(t => t.treatmentStatus === 'Completed' || t.treatmentStatus === 'COMPLETED').length
    const totalPaid = displayTreatments.reduce((sum, t) => sum + t.paidAmount, 0)
    const pendingPayments = displayTreatments.reduce((sum, t) => sum + (t.totalAmount - t.paidAmount), 0)
    
    return { total, active, completed, totalPaid, pendingPayments }
  }, [displayTreatments])

  const TreatmentCard = ({ treatment }) => {
    const remainingBalance = treatment.totalAmount - treatment.paidAmount
    const paymentProgress = treatment.totalAmount > 0 ? (treatment.paidAmount / treatment.totalAmount) * 100 : 0

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
              <div className="flex items-center gap-2 mt-1">
                <FaUserMd className={`text-xs ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {treatment.dentistName}
                </p>
              </div>
              {treatment.dentistSpecialization && (
                <p className={`text-xs ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-500'
                }`}>
                  {treatment.dentistSpecialization}
                </p>
              )}
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

        <div className="grid grid-cols-2 gap-3 text-sm">
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

        {treatment.notes && (
          <div className={`mt-4 pt-4 border-t ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <p className={`text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <span className="font-semibold">Notes: </span>
              {treatment.notes}
            </p>
          </div>
        )}
      </Card>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Treatment History"
          description="View your complete dental treatment timeline"
        />
        <Card className="p-8">
          <div className="text-center py-12">
            <FaExclamationTriangle className={`mx-auto text-4xl mb-4 ${
              isDarkMode ? 'text-red-400' : 'text-red-600'
            }`} />
            <h3 className={`text-xl font-bold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Error Loading Treatments</h3>
            <p className={`text-sm max-w-md mx-auto mb-4 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {error}
            </p>
            <Button onClick={fetchTreatments}>Try Again</Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Treatment History"
        description="View your complete dental treatment timeline"
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className={`p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Treatments
              </p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.total}
              </p>
            </div>
            <FaStethoscope className="text-3xl text-teal-600" />
          </div>
        </Card>

        <Card className={`p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Active
              </p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.active}
              </p>
            </div>
            <FaTooth className="text-3xl text-green-600" />
          </div>
        </Card>

        <Card className={`p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Completed
              </p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.completed}
              </p>
            </div>
            <FaTooth className="text-3xl text-blue-600" />
          </div>
        </Card>

        <Card className={`p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Paid
              </p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                ${stats.totalPaid.toFixed(0)}
              </p>
            </div>
            <FaDollarSign className="text-3xl text-green-600" />
          </div>
        </Card>

        <Card className={`p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Pending
              </p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                ${stats.pendingPayments.toFixed(0)}
              </p>
            </div>
            <FaDollarSign className="text-3xl text-orange-600" />
          </div>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card className={`p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* View Tabs */}
          <div className="flex gap-2">
            <Button
              variant={activeView === 'all' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('all')}
            >
              All Treatments ({stats.total})
            </Button>
            <Button
              variant={activeView === 'active' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('active')}
            >
              Active ({stats.active})
            </Button>
            <Button
              variant={activeView === 'completed' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('completed')}
            >
              Completed ({stats.completed})
            </Button>
          </div>

          <div className="flex gap-2 items-center">
            {/* Search */}
            <Input
              placeholder="Search treatments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={FaSearch}
              className="w-64"
            />
          </div>
        </div>
      </Card>

      {/* Treatments Grid/List */}
      {filteredTreatments.length === 0 ? (
        <Card className="p-8">
          <div className="text-center py-12">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${
              isDarkMode 
                ? 'bg-gradient-to-br from-gray-700 to-gray-800' 
                : 'bg-gradient-to-br from-gray-100 to-gray-200'
            }`}>
              <FaTooth className={`w-10 h-10 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
            </div>
            <h3 className={`text-xl font-bold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>No Treatments Found</h3>
            <p className={`text-sm max-w-md mx-auto ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {debouncedSearchTerm 
                ? 'No treatments match your search criteria.' 
                : 'Your treatment history will appear here once you start receiving dental care.'}
            </p>
          </div>
        </Card>
      ) : (
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {filteredTreatments.map(treatment => (
            <TreatmentCard key={treatment.id} treatment={treatment} />
          ))}
        </div>
      )}
    </div>
  )
}

export default PatientTreatments
