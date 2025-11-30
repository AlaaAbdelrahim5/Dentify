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
import { 
  Card, 
  Button, 
  Input, 
  LoadingSpinner,
  PageHeader,
  StatsOverview,
  FilterBar,
  DataTable,
  StatusBadge,
  ActionButtons,
  ConfirmationModal,
  SecretaryModal
} from '../../../components'
import { useTheme } from '../../../contexts/ThemeContext'
import { secretariesAPI } from '../../../services/api'

const SecretariesManagement = () => {
  const { isDarkMode } = useTheme()
  const [secretaries, setSecretaries] = useState([])
  const [filteredSecretaries, setFilteredSecretaries] = useState([])
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
        
        // Store ALL secretaries (no filtering here)
        setSecretaries(secretariesData)
        
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

  // Client-side filtering (like Dentists component)
  useEffect(() => {
    if (!isFirstLoad) {
      setFiltering(true)
    }
    
    let filtered = secretaries

    // Search filter
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

    // Gender filter
    if (filterGender) {
      filtered = filtered.filter(secretary => 
        secretary.gender.toLowerCase() === filterGender.toLowerCase()
      )
    }

    // Status filter
    if (filterStatus) {
      const isActive = filterStatus === 'true'
      filtered = filtered.filter(secretary => {
        const status = secretary.userId?.status?.toLowerCase() === 'active'
        return status === isActive
      })
    }

    setFilteredSecretaries(filtered)
    if (!isFirstLoad) {
      setFiltering(false)
    }
  }, [secretaries, debouncedSearchTerm, filterGender, filterStatus, isFirstLoad])

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
        // Refresh to get updated data
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
          // No need to refresh - client-side filtering will update automatically
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
          // No need to refresh - client-side filtering will update automatically
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

  // Component configurations
  const statsConfig = [
    {
      label: 'Total Secretaries',
      value: stats.total,
      icon: FaUserTie,
      gradient: 'from-teal-600 to-cyan-600'
    },
    {
      label: 'Active Secretaries',
      value: stats.active,
      icon: FaCheckCircle,
      gradient: 'from-green-600 to-green-700'
    },
    {
      label: 'Inactive Secretaries',
      value: stats.inactive,
      icon: FaTimesCircle,
      gradient: 'from-red-600 to-red-700'
    }
  ]

  const filterProps = {
    searchTerm,
    onSearchChange: handleSearch,
    debouncedSearchTerm,
    filters: [
      {
        placeholder: 'All Genders',
        value: filterGender,
        onChange: handleGenderFilter,
        options: [
          { value: 'male', label: 'Male' },
          { value: 'female', label: 'Female' }
        ]
      },
      {
        placeholder: 'All Status',
        value: filterStatus,
        onChange: handleStatusFilter,
        options: [
          { value: 'true', label: 'Active' },
          { value: 'false', label: 'Inactive' }
        ]
      }
    ],
    onClearFilters: () => {
      setSearchTerm('')
      setDebouncedSearchTerm('')
      setFilterGender('')
      setFilterStatus('')
    },
    filtering,
    searchPlaceholder: 'Search secretaries...'
  }

  const columns = [
    { key: 'secretary', label: 'Secretary' },
    { key: 'contact', label: 'Contact' },
    { key: 'location', label: 'Location' },
    { key: 'gender', label: 'Gender' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' }
  ]

  const renderRow = (secretary) => {
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
          <StatusBadge 
            isActive={isActive}
            activeIcon={FaCheckCircle}
            inactiveIcon={FaTimesCircle}
          />
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm">
          <ActionButtons
            actions={[
              {
                icon: FaEye,
                onClick: () => {
                  setSelectedSecretary(secretary)
                  setShowDetailsModal(true)
                },
                title: 'View Details',
                variant: 'default'
              },
              {
                icon: FaEdit,
                onClick: () => handleEditSecretary(secretary),
                title: 'Edit',
                variant: 'default'
              },
              {
                icon: isActive ? FaTimesCircle : FaCheckCircle,
                onClick: () => handleToggleSecretaryStatus(secretary),
                title: isActive ? 'Deactivate' : 'Activate',
                variant: isActive ? 'warning' : 'success'
              }
            ]}
          />
        </td>
      </tr>
    )
  }

  const tableProps = {
    columns,
    data: filteredSecretaries,
    renderRow,
    loading: filtering,
    emptyMessage: searchTerm || filterGender || filterStatus ? 'Try adjusting your search criteria' : 'No secretaries yet',
    emptyIcon: FaUserTie,
    hasFilters: !!(searchTerm || filterGender || filterStatus)
  }

  const confirmProps = {
    isOpen: showConfirmModal,
    onClose: () => {
      setShowConfirmModal(false)
      setSelectedSecretary(null)
      setConfirmAction(null)
    },
    onConfirm: executeToggleStatus,
    item: selectedSecretary,
    action: confirmAction,
    itemName: selectedSecretary ? `${selectedSecretary.firstName} ${selectedSecretary.lastName}` : '',
    itemType: 'Secretary'
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
                  <StatusBadge 
                    isActive={secretary.userId?.status?.toLowerCase() === 'active'}
                    activeIcon={FaCheckCircle}
                    inactiveIcon={FaTimesCircle}
                  />
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

  if (loading && filteredSecretaries.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Secretaries Management"
        description="Manage your clinic secretaries and their information"
        action={{
          label: 'Add New Secretary',
          onClick: handleAddSecretary,
          icon: FaPlus,
          gradient: 'from-teal-600 to-cyan-600'
        }}
      />

      {/* Statistics */}
      <StatsOverview stats={statsConfig} />

      {/* Search and Filters */}
      <FilterBar {...filterProps} />

      {/* Secretaries Table */}
      <DataTable {...tableProps} />

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
        itemType="Secretary"
        {...confirmProps}
      />
    </div>
  )
}

export default SecretariesManagement