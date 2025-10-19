import { useState, useEffect, useRef } from 'react'
import { 
  FaPlus, 
  FaSearch, 
  FaEdit, 
  FaUserTie,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaVenus,
  FaMars,
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaTimes,
  FaCheck,
  FaFilter
} from 'react-icons/fa'
import { Card, Button, Input, LoadingSpinner } from '../../../components'
import { useTheme } from '../../../contexts/ThemeContext'
import { secretariesAPI } from '../../../services/api'
import SecretaryModal from '../../../components/clinic/SecretaryModal'

const SecretariesManagement = () => {
  const { isDarkMode } = useTheme()
  const [secretaries, setSecretaries] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtering, setFiltering] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterGender, setFilterGender] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedSecretary, setSelectedSecretary] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null)
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const searchTimeoutRef = useRef(null)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0
  })

  const cities = [
    { value: 'ramallah', label: 'Ramallah' },
    { value: 'jerusalem', label: 'Jerusalem' },
    { value: 'bethlehem', label: 'Bethlehem' },
    { value: 'hebron', label: 'Hebron' },
    { value: 'nablus', label: 'Nablus' },
    { value: 'jenin', label: 'Jenin' },
    { value: 'gaza', label: 'Gaza' },
    { value: 'khan_yunis', label: 'Khan Yunis' },
    { value: 'rafah', label: 'Rafah' }
  ]

  // Fetch secretaries from API
  const fetchSecretaries = async (isFiltering = false) => {
    try {
      if (isFiltering) {
        setFiltering(true)
      } else {
        setLoading(true)
      }
      setError(null)
      
      const response = await secretariesAPI.getForClinic()
      
      if (response && response.success) {
        const secretariesData = response.data || []
        
        // Apply filters
        let filtered = secretariesData
        
        if (debouncedSearchTerm) {
          filtered = filtered.filter(secretary => {
            const fullName = `${secretary.firstName} ${secretary.lastName}`.toLowerCase()
            const email = secretary.userId?.email?.toLowerCase() || ''
            const city = secretary.address?.city?.toLowerCase() || ''
            const searchLower = debouncedSearchTerm.toLowerCase()
            
            return fullName.includes(searchLower) ||
                   email.includes(searchLower) ||
                   city.includes(searchLower)
          })
        }
        
        if (filterGender) {
          filtered = filtered.filter(secretary => 
            secretary.gender.toLowerCase() === filterGender.toLowerCase()
          )
        }
        
        if (filterStatus) {
          const isActive = filterStatus === 'true'
          filtered = filtered.filter(secretary => {
            const status = secretary.userId?.status?.toLowerCase() === 'active'
            return status === isActive
          })
        }
        
        setSecretaries(filtered)
        
        // Calculate stats from all data
        const total = secretariesData.length
        const active = secretariesData.filter(s => 
          s.userId?.status?.toLowerCase() === 'active'
        ).length
        const inactive = total - active
        
        setStats({ total, active, inactive })
      } else {
        setError(response?.message || 'Failed to fetch secretaries')
      }
    } catch (error) {
      console.error('Error fetching secretaries:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load secretaries'
      setError(errorMessage)
    } finally {
      if (isFiltering) {
        setFiltering(false)
      } else {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    fetchSecretaries()
    setIsFirstLoad(false)
  }, [])

  // Debounce search term
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchTerm])

  // Re-fetch when filters change
  useEffect(() => {
    if (!isFirstLoad) {
      fetchSecretaries(true)
    }
  }, [debouncedSearchTerm, filterGender, filterStatus, isFirstLoad])

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleGenderFilter = (e) => {
    setFilterGender(e.target.value)
  }

  const handleStatusFilter = (e) => {
    setFilterStatus(e.target.value)
  }

  const getStatusColor = (status) => {
    return status?.toLowerCase() === 'active' ? 'text-green-600' : 'text-red-600'
  }

  const getStatusIcon = (status) => {
    return status?.toLowerCase() === 'active' ? FaCheckCircle : FaTimesCircle
  }

  const getCityLabel = (cityValue) => {
    const city = cities.find(c => c.value === cityValue?.toLowerCase())
    return city ? city.label : cityValue
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB')
  }

  const calculateAge = (birthDate) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const handleAddSecretary = () => {
    setSelectedSecretary(null)
    setShowAddModal(true)
  }

  const handleEditSecretary = (secretary) => {
    setSelectedSecretary(secretary)
    setShowEditModal(true)
  }

  const handleToggleSecretaryStatus = async (secretary) => {
    const action = secretary.userId?.status?.toLowerCase() === 'active' ? 'deactivate' : 'activate'
    
    setSelectedSecretary(secretary)
    setConfirmAction(action)
    setShowConfirmModal(true)
  }

  const executeToggleStatus = async () => {
    const secretary = selectedSecretary
    const action = confirmAction

    try {
      // You'll need to implement this API endpoint
      const response = await secretariesAPI.toggleStatus(secretary._id)

      if (response.success) {
        setShowConfirmModal(false)
        fetchSecretaries(true)
      } else {
        setError(`Failed to ${action} secretary: ` + (response.error || response.message || 'Unknown error'))
      }
    } catch (error) {
      console.error(`Error ${action}ing secretary:`, error)
      setError(`Network error. Please try again. Details: ${error.message}`)
    }
  }

  const handleSecretarySave = async (secretaryData) => {
    try {
      setError(null)
      
      if (selectedSecretary) {
        // Edit existing secretary - structure data according to API expectations
        const updateData = {
          userData: {
            email: secretaryData.userId.email,
            phone: secretaryData.userId.phone,
            ...(secretaryData.userId.password && { password: secretaryData.userId.password })
          },
          secretaryData: {
            firstName: secretaryData.firstName,
            lastName: secretaryData.lastName,
            birthDate: secretaryData.birthDate,
            gender: secretaryData.gender,
            address: {
              city: secretaryData.address.city
            }
          }
        }
        
        const response = await secretariesAPI.update(selectedSecretary._id, updateData)
        
        if (response.success) {
          // Update the secretary in the list
          setSecretaries(prev => prev.map(s => 
            s._id === selectedSecretary._id ? response.data : s
          ))
          setShowEditModal(false)
          setSelectedSecretary(null)
          // Refresh to update stats
          fetchSecretaries(true)
        } else {
          setError(response.message || 'Failed to update secretary')
        }
      } else {
        // Add new secretary - match the expected API structure
        const createData = {
          firstName: secretaryData.firstName,
          lastName: secretaryData.lastName,
          birthDate: secretaryData.birthDate,
          gender: secretaryData.gender,
          address: {
            city: secretaryData.address.city
          },
          userId: {
            email: secretaryData.userId.email,
            phone: secretaryData.userId.phone,
            password: secretaryData.userId.password,
            role: 'Secretary',
            status: 'active'
          }
        }
        
        const response = await secretariesAPI.create(createData)
        
        if (response.success) {
          // Add the new secretary to the list
          setSecretaries(prev => [response.data, ...prev])
          setShowAddModal(false)
          // Refresh to update stats
          fetchSecretaries(true)
        } else {
          setError(response.message || 'Failed to create secretary')
        }
      }
    } catch (error) {
      console.error('Error saving secretary:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save secretary. Please try again.'
      setError(errorMessage)
    }
  }

  // Modern Confirmation Modal Component
  const ConfirmationModal = ({ isOpen, onClose, onConfirm, secretary, action }) => {
    if (!isOpen || !secretary) return null

    const isDeactivate = action === 'deactivate'

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop with blur */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="flex min-h-full items-center justify-center p-4">
          <div
            className={`relative rounded-2xl shadow-2xl w-full max-w-md transform transition-all ${
              isDarkMode
                ? "bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700"
                : "bg-gradient-to-br from-white to-gray-50 border border-gray-200"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon Section */}
            <div className="flex flex-col items-center pt-8 pb-4">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
                  isDeactivate
                    ? 'bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-500/50'
                    : 'bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg shadow-green-500/50'
                }`}
              >
                {isDeactivate ? (
                  <FaTimesCircle className="w-10 h-10 text-white" />
                ) : (
                  <FaCheckCircle className="w-10 h-10 text-white" />
                )}
              </div>

              {/* Title */}
              <h3 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {isDeactivate ? 'Deactivate Secretary?' : 'Activate Secretary?'}
              </h3>

              {/* Message */}
              <p className={`text-center px-6 mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Are you sure you want to {action}{' '}
                <span className="font-semibold">{secretary.firstName} {secretary.lastName}</span>?
              </p>

              {/* Additional Info */}
              <p className={`text-sm text-center px-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {isDeactivate
                  ? 'The secretary will no longer be able to access the system.'
                  : 'The secretary will be able to access the system and perform duties.'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 p-6 pt-2">
              <button
                onClick={onClose}
                className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105 ${
                  isDarkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 px-6 py-3 rounded-xl font-medium text-white transition-all transform hover:scale-105 shadow-lg ${
                  isDeactivate
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-orange-500/50'
                    : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-green-500/50'
                }`}
              >
                {isDeactivate ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Secretary Details Modal Component
  const SecretaryDetailsModal = ({ secretary, onClose }) => {
    if (!secretary) return null

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="flex min-h-full items-center justify-center p-4">
          <div
            className={`relative rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col ${
              isDarkMode
                ? "bg-gray-800 border border-gray-700"
                : "bg-white border border-gray-200"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with gradient background */}
            <div className="relative bg-gradient-to-r from-teal-600 to-cyan-600 p-6">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-lg transition-colors bg-white/10 hover:bg-white/20 text-white"
              >
                <FaTimes className="w-5 h-5" />
              </button>
              
              {/* Avatar and basic info */}
              <div className="flex items-center gap-4 mt-8">
                <div className="relative">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg ${
                    secretary.gender?.toLowerCase() === 'female' ? 'bg-pink-100' : 'bg-blue-100'
                  }`}>
                    {secretary.gender?.toLowerCase() === 'female' ? (
                      <FaVenus className="w-12 h-12 text-pink-600" />
                    ) : (
                      <FaMars className="w-12 h-12 text-blue-600" />
                    )}
                  </div>
                  {/* Status indicator on avatar */}
                  <div className={`absolute bottom-1 right-1 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center ${
                    secretary.userId?.status?.toLowerCase() === 'active' ? 'bg-green-500' : 'bg-red-500'
                  }`}>
                    {secretary.userId?.status?.toLowerCase() === 'active' ? (
                      <FaCheck className="w-3 h-3 text-white" />
                    ) : (
                      <FaTimes className="w-3 h-3 text-white" />
                    )}
                  </div>
                </div>
                
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-1">
                    {secretary.firstName} {secretary.lastName}
                  </h2>
                  <p className="text-teal-100 text-sm mb-2">
                    Secretary • Age: {calculateAge(secretary.birthDate)}
                  </p>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${
                    secretary.userId?.status?.toLowerCase() === 'active'
                      ? 'bg-green-900/20 text-green-300 border-green-700'
                      : 'bg-red-900/20 text-red-300 border-red-700'
                  }`}>
                    {secretary.userId?.status?.toLowerCase() === 'active' ? (
                      <FaCheckCircle className="w-3 h-3" />
                    ) : (
                      <FaTimesCircle className="w-3 h-3" />
                    )}
                    {secretary.userId?.status?.toLowerCase() === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    <FaUserTie className="w-5 h-5 text-teal-600" />
                    Basic Information
                  </h3>
                  <div className={`grid grid-cols-2 gap-4 p-4 rounded-lg ${
                    isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}>
                    <div>
                      <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        First Name
                      </p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {secretary.firstName}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Last Name
                      </p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {secretary.lastName}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Gender
                      </p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {secretary.gender?.charAt(0).toUpperCase() + secretary.gender?.slice(1)}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Birth Date
                      </p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {formatDate(secretary.birthDate)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    <FaEnvelope className="w-5 h-5 text-teal-600" />
                    Contact Information
                  </h3>
                  <div className={`space-y-3 p-4 rounded-lg ${
                    isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isDarkMode ? 'bg-gray-600' : 'bg-white'
                      }`}>
                        <FaEnvelope className="w-4 h-4 text-teal-600" />
                      </div>
                      <div className="flex-1">
                        <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Email Address
                        </p>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {secretary.userId?.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isDarkMode ? 'bg-gray-600' : 'bg-white'
                      }`}>
                        <FaPhone className="w-4 h-4 text-teal-600" />
                      </div>
                      <div className="flex-1">
                        <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Phone Number
                        </p>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {secretary.userId?.phone}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isDarkMode ? 'bg-gray-600' : 'bg-white'
                      }`}>
                        <FaMapMarkerAlt className="w-4 h-4 text-teal-600" />
                      </div>
                      <div className="flex-1">
                        <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          City
                        </p>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {getCityLabel(secretary.address?.city)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Employment Information */}
                <div>
                  <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    <FaCalendarAlt className="w-5 h-5 text-teal-600" />
                    Employment Information
                  </h3>
                  <div className={`p-4 rounded-lg ${
                    isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}>
                    <div className="flex justify-between">
                      <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Join Date:
                      </span>
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {formatDate(secretary.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading && secretaries.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Secretaries Management
          </h1>
          <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage your clinic secretaries and their information
          </p>
        </div>
        <Button
          onClick={handleAddSecretary}
          className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-600"
        >
          <FaPlus className="w-4 h-4" />
          Add New Secretary
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Secretaries
              </p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.total}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-teal-600 to-cyan-600 flex items-center justify-center">
              <FaUserTie className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Active Secretaries
              </p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.active}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-600 to-green-700 flex items-center justify-center">
              <FaCheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Inactive Secretaries
              </p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.inactive}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-600 to-red-700 flex items-center justify-center">
              <FaTimesCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search secretaries..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10 pr-8"
              disabled={filtering}
            />
            {searchTerm !== debouncedSearchTerm && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>

          <select
            value={filterGender}
            onChange={handleGenderFilter}
            disabled={filtering}
            className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-50 ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-gray-200' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>

          <select
            value={filterStatus}
            onChange={handleStatusFilter}
            disabled={filtering}
            className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-50 ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-gray-200' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>

          <Button
            onClick={() => {
              setSearchTerm('')
              setDebouncedSearchTerm('')
              setFilterGender('')
              setFilterStatus('')
            }}
            variant="outline"
            className="flex items-center gap-2"
            disabled={filtering}
          >
            {filtering ? (
              <LoadingSpinner className="w-4 h-4" />
            ) : (
              <FaFilter className="w-4 h-4" />
            )}
            {filtering ? 'Filtering...' : 'Clear Filters'}
          </Button>
        </div>
      </Card>

      {/* Secretaries Table */}
      <Card>
        {filtering && (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        )}
        
        {!filtering && secretaries.length === 0 && (
          <div className="text-center py-12">
            <FaUserTie className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              No secretaries found
            </h3>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {searchTerm || filterGender || filterStatus ? 'Try adjusting your search criteria' : 'No secretaries yet'}
            </p>
          </div>
        )}

        {!filtering && secretaries.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Secretary
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Contact
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Location
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Gender
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Status
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {secretaries.map((secretary) => {
                  const StatusIcon = getStatusIcon(secretary.userId?.status)
                  const isActive = secretary.userId?.status?.toLowerCase() === 'active'
                  return (
                    <tr key={secretary._id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            secretary.gender?.toLowerCase() === 'female'
                              ? 'bg-pink-100 text-pink-600'
                              : 'bg-blue-100 text-blue-600'
                          }`}>
                            {secretary.gender?.toLowerCase() === 'female' ? (
                              <FaVenus className="w-5 h-5" />
                            ) : (
                              <FaMars className="w-5 h-5" />
                            )}
                          </div>
                          <div className="ml-3">
                            <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {secretary.firstName} {secretary.lastName}
                            </div>
                            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Age: {calculateAge(secretary.birthDate)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {secretary.userId?.email}
                        </div>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {secretary.userId?.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {getCityLabel(secretary.address?.city)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {secretary.gender?.charAt(0).toUpperCase() + secretary.gender?.slice(1)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${
                          isActive
                            ? isDarkMode 
                              ? 'bg-green-900/20 text-green-400 border-green-800'
                              : 'bg-green-100 text-green-800 border-green-200'
                            : isDarkMode
                              ? 'bg-red-900/20 text-red-400 border-red-800'
                              : 'bg-red-100 text-red-800 border-red-200'
                        }`}>
                          <StatusIcon className="w-3 h-3" />
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedSecretary(secretary)
                              setShowDetailsModal(true)
                            }}
                            className={`p-2 rounded-lg transition-colors ${
                              isDarkMode ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                            }`}
                            title="View Details"
                          >
                            <FaEye className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleEditSecretary(secretary)}
                            className={`p-2 rounded-lg transition-colors ${
                              isDarkMode ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                            }`}
                            title="Edit"
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleToggleSecretaryStatus(secretary)}
                            className={`p-2 rounded-lg transition-colors ${
                              isActive
                                ? 'text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/20'
                                : 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20'
                            }`}
                            title={isActive ? 'Deactivate' : 'Activate'}
                          >
                            {isActive ? <FaTimesCircle className="w-4 h-4" /> : <FaCheckCircle className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add Secretary Modal */}
      <SecretaryModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        secretary={null}
        onSave={handleSecretarySave}
      />

      {/* Edit Secretary Modal */}
      <SecretaryModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedSecretary(null)
        }}
        secretary={selectedSecretary}
        onSave={handleSecretarySave}
      />

      {/* Secretary Details Modal */}
      {showDetailsModal && (
        <SecretaryDetailsModal
          secretary={selectedSecretary}
          onClose={() => {
            setShowDetailsModal(false)
            setSelectedSecretary(null)
          }}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false)
          setSelectedSecretary(null)
          setConfirmAction(null)
        }}
        onConfirm={executeToggleStatus}
        secretary={selectedSecretary}
        action={confirmAction}
      />
    </div>
  )
}

export default SecretariesManagement