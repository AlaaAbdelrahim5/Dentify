import { useMemo, useState, useEffect } from 'react'
import { 
  FaUserTie, 
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaBan,
  FaVenus,
  FaMars
} from 'react-icons/fa'
import { 
  PageHeader,
  StatsOverview,
  FilterBar,
  DataTable,
  StatusBadge,
  ActionButtons,
  ConfirmationModal,
  SecretaryDetailsModal,
  LoadingSpinner
} from '../../../components'
import { useTheme } from '../../../contexts/ThemeContext'
import { secretariesAPI } from '../../../services/api'
import { CITY_OPTIONS, STATUS_OPTIONS } from '../../../utils/constants'
import { formatDate as formatDateHelper, calculateAge, getImageUrl } from '../../../utils/helpers'
import { useDebounce } from '../../../hooks'

const SecretariesManagement = () => {
  const { isDarkMode } = useTheme()
  
  // State management
  const [secretaries, setSecretaries] = useState([])
  const [filteredSecretaries, setFilteredSecretaries] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtering, setFiltering] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCity, setFilterCity] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterGender, setFilterGender] = useState('')
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [selectedSecretary, setSelectedSecretary] = useState(null)
  const [confirmAction, setConfirmAction] = useState(null)
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const [error, setError] = useState(null)
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
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
      
      const response = await secretariesAPI.getAll()
      
      if (response && response.success) {
        const secretariesData = response.data || []
        
        // Store ALL secretaries
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

  // Client-side filtering
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
        const city = secretary.address?.city?.toLowerCase() || secretary.city?.toLowerCase() || ''
        const clinicName = secretary.clinic?.clinicName?.toLowerCase() || ''
        const searchLower = debouncedSearchTerm.toLowerCase()
        
        return fullName.includes(searchLower) ||
               email.includes(searchLower) ||
               city.includes(searchLower) ||
               clinicName.includes(searchLower)
      })
    }

    // Gender filter
    if (filterGender) {
      filtered = filtered.filter(secretary => 
        secretary.gender?.toLowerCase() === filterGender.toLowerCase()
      )
    }

    // Status filter
    if (filterStatus) {
      const isActive = filterStatus === 'ACTIVE'
      filtered = filtered.filter(secretary => {
        const status = secretary.userId?.status?.toUpperCase() === 'ACTIVE'
        return status === isActive
      })
    }

    // City filter
    if (filterCity) {
      filtered = filtered.filter(secretary => {
        const city = (secretary.address?.city || secretary.city || '').toLowerCase()
        return city === filterCity.toLowerCase()
      })
    }

    setFilteredSecretaries(filtered)
    if (!isFirstLoad) {
      setFiltering(false)
    }
  }, [secretaries, debouncedSearchTerm, filterGender, filterStatus, filterCity, isFirstLoad])

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
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

  // Stats configuration
  const statsConfig = useMemo(() => [
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
  ], [stats])

  // Filter configuration
  const filterProps = useMemo(() => ({
    searchTerm,
    onSearchChange: handleSearch,
    debouncedSearchTerm,
    filters: [
      {
        placeholder: 'All Cities',
        value: filterCity,
        onChange: (e) => setFilterCity(e.target.value),
        options: CITY_OPTIONS
      },
      {
        placeholder: 'All Genders',
        value: filterGender,
        onChange: (e) => setFilterGender(e.target.value),
        options: [
          { value: 'male', label: 'Male' },
          { value: 'female', label: 'Female' }
        ]
      },
      {
        placeholder: 'All Status',
        value: filterStatus,
        onChange: (e) => setFilterStatus(e.target.value),
        options: STATUS_OPTIONS
      }
    ],
    onClearFilters: () => {
      setSearchTerm('')
      setFilterCity('')
      setFilterGender('')
      setFilterStatus('')
    },
    filtering,
    searchPlaceholder: 'Search secretaries by name, email, or clinic...'
  }), [searchTerm, debouncedSearchTerm, filterCity, filterGender, filterStatus, filtering])

  // Columns configuration
  const columns = [
    { key: 'secretary', label: 'Secretary' },
    { key: 'contact', label: 'Contact' },
    { key: 'clinic', label: 'Clinic & Location' },
    { key: 'gender', label: 'Gender' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' }
  ]

  // Render table row
  const renderRow = useMemo(() => (secretary) => {
    const isActive = secretary.userId?.status?.toUpperCase() === 'ACTIVE'
    
    return (
      <tr key={secretary._id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
        {/* Secretary Info */}
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
            <div className="ml-4">
              <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                {secretary.firstName} {secretary.lastName}
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Age: {calculateAge(secretary.birthDate)}
              </div>
            </div>
          </div>
        </td>

        {/* Contact */}
        <td className="px-6 py-4 whitespace-nowrap">
          <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
            {secretary.userId?.email || 'N/A'}
          </div>
          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {secretary.userId?.phone || 'N/A'}
          </div>
        </td>

        {/* Clinic & Location */}
        <td className="px-6 py-4 whitespace-nowrap">
          <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
            {secretary.clinic?.clinicName || 'N/A'}
          </div>
          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {secretary.address?.city || secretary.city || 'N/A'}
          </div>
        </td>

        {/* Gender */}
        <td className="px-6 py-4 whitespace-nowrap">
          <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
            {secretary.gender?.charAt(0).toUpperCase() + secretary.gender?.slice(1)}
          </div>
        </td>

        {/* Status */}
        <td className="px-6 py-4 whitespace-nowrap">
          <StatusBadge 
            isActive={isActive}
            activeIcon={FaCheckCircle}
            inactiveIcon={FaTimesCircle}
          />
        </td>

        {/* Actions */}
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <ActionButtons
            actions={[
              {
                icon: FaEye,
                onClick: () => {
                  setSelectedSecretary(secretary)
                  setShowDetailsModal(true)
                },
                title: 'View Details',
                variant: 'default',
                key: 'view'
              },
              {
                icon: isActive ? FaBan : FaCheckCircle,
                onClick: () => handleToggleSecretaryStatus(secretary),
                title: isActive ? 'Deactivate' : 'Activate',
                variant: isActive ? 'warning' : 'success',
                key: 'toggle'
              }
            ]}
          />
        </td>
      </tr>
    )
  }, [isDarkMode])

  const tableProps = {
    columns,
    data: filteredSecretaries,
    renderRow,
    loading: filtering,
    emptyMessage: searchTerm || filterGender || filterStatus || filterCity ? 'Try adjusting your search criteria' : 'No secretaries yet',
    emptyIcon: FaUserTie,
    hasFilters: !!(searchTerm || filterGender || filterStatus || filterCity)
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
    itemType: 'secretary'
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
      {/* Page Header */}
      <PageHeader
        title="Secretaries Management"
        description="Manage all clinic secretaries across the platform"
      />

      {/* Statistics */}
      <StatsOverview stats={statsConfig} />

      {/* Filters */}
      <FilterBar {...filterProps} />

      {/* Data Table */}
      <DataTable {...tableProps} />

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
      <ConfirmationModal {...confirmProps} />
    </div>
  )
}

export default SecretariesManagement
