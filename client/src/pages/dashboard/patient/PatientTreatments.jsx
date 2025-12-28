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
import { Card, Button, Input, LoadingSpinner, PageHeader, TreatmentTeethStatus, TreatmentPlanCard } from '../../../components'
import { treatmentsAPI } from '../../../services/api'
import { getStatusColor, safeJsonParse, ensureArray, sumField, countWhere, calculateRemainingBalance, normalizeStatus } from '../../../utils/helpers'

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
  const [filtering, setFiltering] = useState(false)
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const [error, setError] = useState(null)

  // Fetch data when filters change
  useEffect(() => {
    if (!isFirstLoad) {
      fetchTreatments(true)
    }
  }, [debouncedSearchTerm, selectedStatus, activeView])

  // Initial load
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

  const fetchTreatments = async (isFiltering = false) => {
    try {
      if (isFiltering) {
        setFiltering(true)
      } else {
        setLoading(true)
      }
      setError(null)
      const response = await treatmentsAPI.getPatientTreatments()
      setTreatments(response.treatments || [])
    } catch (err) {
      console.error('Error fetching treatments:', err)
      setError('Failed to load treatments. Please try again.')
    } finally {
      if (isFiltering) {
        setFiltering(false)
      } else {
        setLoading(false)
        setIsFirstLoad(false)
      }
    }
  }

  // Transform treatment data from API
  const displayTreatments = useMemo(() => {
    return treatments.map(treatment => {
      // Parse teethStatus if it's a string, otherwise use as-is
      const teethStatus = typeof treatment.teethStatus === 'string'
        ? ensureArray(safeJsonParse(treatment.teethStatus, []))
        : ensureArray(treatment.teethStatus)

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
        treatmentName: treatment.treatmentName,
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

  // Filter treatments
  const filteredTreatments = useMemo(() => {
    return displayTreatments.filter(treatment => {
      const matchesSearch = debouncedSearchTerm === '' || 
                           treatment.dentistName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                           treatment.treatmentName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                           treatment.teethStatus?.some(t => t.toothNumber.toString().includes(debouncedSearchTerm))
      
      const matchesView = activeView === 'all' || 
                         (activeView === 'active' && treatment.treatmentStatus === 'In Progress') ||
                         (activeView === 'completed' && treatment.treatmentStatus === 'Completed')
      
      const matchesStatus = selectedStatus === 'all' || treatment.treatmentStatus === selectedStatus
      
      return matchesSearch && matchesView && matchesStatus
    })
  }, [displayTreatments, debouncedSearchTerm, activeView, selectedStatus])

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
        title="Treatments"
        description="View your complete dental treatment timeline"
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className={`p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Treatments
              </p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                {loading ? '-' : stats.total}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-full bg-gradient-to-r from-teal-600 to-teal-700 flex items-center justify-center`}>
              <FaStethoscope className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className={`p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Active
              </p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                {loading ? '-' : stats.active}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center`}>
              <FaTooth className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className={`p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Completed
              </p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                {loading ? '-' : stats.completed}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-full bg-gradient-to-r from-green-600 to-green-700 flex items-center justify-center`}>
              <FaTooth className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className={`p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Paid
              </p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                {loading ? '-' : `$${stats.totalPaid.toFixed(0)}`}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-full bg-gradient-to-r from-green-600 to-emerald-700 flex items-center justify-center`}>
              <FaDollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className={`p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Pending
              </p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                {loading ? '-' : `$${stats.pendingPayments.toFixed(0)}`}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-full bg-gradient-to-r from-orange-600 to-orange-700 flex items-center justify-center`}>
              <FaDollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card className={`p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder="Search treatments, dentist, or tooth numbers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={FaSearch}
            />
            {filtering && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <LoadingSpinner size="sm" />
              </div>
            )}
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
          </div>
        </div>
      </Card>

      {/* Treatments Grid/List */}
      {!loading && !filtering && filteredTreatments.length === 0 ? (
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(loading || filtering) && filteredTreatments.length === 0 ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            filteredTreatments.map(treatment => (
              <TreatmentPlanCard 
                key={treatment.id} 
                treatment={treatment}
                onClick={() => {}}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default PatientTreatments
