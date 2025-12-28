import { useState, useEffect } from 'react'
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
  SecretaryModal,
  SecretaryDetailsModal
} from '../../../components'
import { useTheme } from '../../../contexts/ThemeContext'
import { secretariesAPI } from '../../../services/api'
import { CITY_OPTIONS_LOWERCASE, GENDER_OPTIONS, STATUS_OPTIONS } from '../../../utils/constants'
import { calculateAge, capitalizeFirstLetter, getImageUrl } from '../../../utils/helpers'
import { useDebounce } from '../../../hooks'
import { formatDate as formatDateHelper } from '../../../utils/helpers'

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
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0
  })

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
    if (!cityValue) return 'N/A'
    const city = CITY_OPTIONS_LOWERCASE.find(c => c.value === cityValue?.toLowerCase())
    return city ? city.label : cityValue
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
    const status = secretary.userId?.status
    const action = status === 'ACTIVE' || status === 'active' ? 'deactivate' : 'activate'
    
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
            <div className="shrink-0 h-10 w-10">
              {secretary.userId?.profileImage ? (
                <img
                  className="h-10 w-10 rounded-full object-cover"
                  src={getImageUrl(secretary.userId.profileImage)}
                  alt={`${secretary.firstName} ${secretary.lastName}`}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.querySelector('.fallback-avatar').style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={`h-10 w-10 rounded-full flex items-center justify-center fallback-avatar ${secretary.userId?.profileImage ? 'hidden' : ''} ${
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
      <SecretaryDetailsModal
        isOpen={showDetailsModal}
        secretary={selectedSecretary}
        onClose={() => {
          setShowDetailsModal(false)
          setSelectedSecretary(null)
        }}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        itemType="Secretary"
        {...confirmProps}
      />
    </div>
  )
}

export default SecretariesManagement