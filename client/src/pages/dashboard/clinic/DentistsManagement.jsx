import { useState, useEffect } from 'react'
import { 
  FaPlus, 
  FaSearch, 
  FaEdit, 
  FaTrash, 
  FaUserMd,
  FaClock,
  FaMapMarkerAlt,
  FaGraduationCap,
  FaFilter,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaCertificate
} from 'react-icons/fa'
import { useTheme } from '../../../contexts/ThemeContext'
import { Button } from '../../../components'
import DentistModal from '../../../components/clinic/DentistModal'
import { dentistsAPI } from '../../../services/api'

const DentistsManagement = () => {
  const { isDarkMode } = useTheme()
  const [dentists, setDentists] = useState([])
  const [filteredDentists, setFilteredDentists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSpecialization, setFilterSpecialization] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDentist, setSelectedDentist] = useState(null)

  // Specializations list
  const specializations = [
    'General Dentistry',
    'Orthodontics',
    'Endodontics',
    'Periodontics',
    'Oral Surgery',
    'Prosthodontics',
    'Pediatric Dentistry',
    'Oral Pathology',
    'Cosmetic Dentistry',
    'Implantology'
  ]

  useEffect(() => {
    const loadDentists = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await dentistsAPI.getAll()
        if (response.success) {
          setDentists(response.data)
          setFilteredDentists(response.data)
        } else {
          setError('Failed to load dentists')
        }
      } catch (error) {
        console.error('Error loading dentists:', error)
        setError('Failed to load dentists. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadDentists()
  }, [])

  // Filter dentists based on search and filters
  useEffect(() => {
    let filtered = dentists

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(dentist =>
        `${dentist.firstName} ${dentist.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dentist.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dentist.specialization.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase())) ||
        dentist.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Specialization filter
    if (filterSpecialization) {
      filtered = filtered.filter(dentist => 
        dentist.specialization.includes(filterSpecialization)
      )
    }

    // Status filter (based on user status)
    if (filterStatus) {
      filtered = filtered.filter(dentist => 
        dentist.userId?.status === filterStatus
      )
    }

    setFilteredDentists(filtered)
  }, [dentists, searchTerm, filterSpecialization, filterStatus])

  const handleAddDentist = () => {
    setSelectedDentist(null)
    setIsModalOpen(true)
  }

  const handleEditDentist = (dentist) => {
    setSelectedDentist(dentist)
    setIsModalOpen(true)
  }

  const handleViewDentist = (dentist) => {
    // Could open a detailed view modal
    console.log('Viewing dentist:', dentist)
  }

  const handleDeleteDentist = async (dentistId) => {
    if (window.confirm('Are you sure you want to delete this dentist? This action cannot be undone.')) {
      try {
        const response = await dentistsAPI.delete(dentistId)
        if (response.success) {
          setDentists(prev => prev.filter(d => d._id !== dentistId))
          // Show success message (you can add a toast notification here)
        } else {
          setError('Failed to delete dentist')
        }
      } catch (error) {
        console.error('Error deleting dentist:', error)
        setError('Failed to delete dentist. Please try again.')
      }
    }
  }

  const handleModalSave = async (dentistData) => {
    try {
      setError(null)
      
      if (selectedDentist) {
        // Edit existing dentist
        const response = await dentistsAPI.update(selectedDentist._id, dentistData)
        if (response.success) {
          setDentists(prev => prev.map(d => 
            d._id === selectedDentist._id 
              ? response.data
              : d
          ))
          setIsModalOpen(false)
        } else {
          setError('Failed to update dentist')
        }
      } else {
        // Add new dentist (send request to admin for approval)
        const response = await dentistsAPI.create(dentistData)
        if (response.success) {
          setDentists(prev => [response.data, ...prev])
          setIsModalOpen(false)
          // Show success message
          alert('Dentist request sent to admin for approval. You will be notified once approved.')
        } else {
          setError('Failed to create dentist request')
        }
      }
    } catch (error) {
      console.error('Error saving dentist:', error)
      setError('Failed to save dentist. Please try again.')
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <FaCheckCircle className="w-3 h-3" />
            Active
          </span>
        )
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            <FaClock className="w-3 h-3" />
            Pending Approval
          </span>
        )
      case 'inactive':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <FaTimesCircle className="w-3 h-3" />
            Inactive
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
            Unknown
          </span>
        )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-400">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
            <div className="ml-auto">
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Dentists Management
          </h1>
          <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage dentist requests and profiles for your clinic
          </p>
        </div>
        <Button
          onClick={handleAddDentist}
          className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-600"
        >
          <FaPlus className="w-4 h-4" />
          Request New Dentist
        </Button>
      </div>

      {/* Search and Filters */}
      <div className={`p-6 rounded-lg ${
        isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <input
              type="text"
              placeholder="Search dentists..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          {/* Specialization Filter */}
          <div className="relative">
            <FaGraduationCap className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <select
              value={filterSpecialization}
              onChange={(e) => setFilterSpecialization(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-gray-100'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">All Specializations</option>
              {specializations.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <FaFilter className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-gray-100'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending Approval</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-center">
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {filteredDentists.length} of {dentists.length} dentists
            </span>
          </div>
        </div>
      </div>

      {/* Dentists Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredDentists.map((dentist) => (
          <div
            key={dentist._id}
            className={`p-6 rounded-lg border transition-all duration-200 hover:shadow-lg ${
              isDarkMode
                ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center">
                  <FaUserMd className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Dr. {dentist.firstName} {dentist.lastName}
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {dentist.userId?.email}
                  </p>
                </div>
              </div>
              {getStatusBadge(dentist.userId?.status || 'pending')}
            </div>

            {/* License & Specialization */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2">
                <FaCertificate className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  License: {dentist.licenseNumber}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FaGraduationCap className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {dentist.specialization.slice(0, 2).join(', ')}
                  {dentist.specialization.length > 2 && ` +${dentist.specialization.length - 2} more`}
                </span>
              </div>
              {dentist.address?.city && (
                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {dentist.address.city}
                  </span>
                </div>
              )}
            </div>

            {/* Working Hours */}
            {dentist.workingHours && dentist.workingHours.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <FaClock className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Working Hours
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-1">
                  {dentist.workingHours.slice(0, 3).map((schedule, index) => (
                    <div key={index} className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {schedule.day}: {schedule.startTime} - {schedule.endTime}
                    </div>
                  ))}
                  {dentist.workingHours.length > 3 && (
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      +{dentist.workingHours.length - 3} more days
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => handleViewDentist(dentist)}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300'
                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                }`}
                title="View Details"
              >
                <FaEye className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleEditDentist(dentist)}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300'
                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                }`}
                title="Edit"
              >
                <FaEdit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteDentist(dentist._id)}
                className="p-2 rounded-lg transition-colors hover:bg-red-100 text-red-500 hover:text-red-700 dark:hover:bg-red-900 dark:hover:text-red-300"
                title="Delete"
              >
                <FaTrash className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredDentists.length === 0 && (
        <div className="text-center py-12">
          <FaUserMd className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
          <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
            No dentists found
          </h3>
          <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {searchTerm || filterSpecialization || filterStatus
              ? 'Try adjusting your search or filters'
              : 'Get started by requesting your first dentist'}
          </p>
          {!searchTerm && !filterSpecialization && !filterStatus && (
            <Button
              onClick={handleAddDentist}
              className="bg-gradient-to-r from-teal-600 to-cyan-600"
            >
              <FaPlus className="w-4 h-4 mr-2" />
              Request New Dentist
            </Button>
          )}
        </div>
      )}

      {/* Dentist Modal */}
      <DentistModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleModalSave}
        dentist={selectedDentist}
      />
    </div>
  )
}

export default DentistsManagement