import { useState, useEffect, useRef } from 'react'
import { 
  FaXRay, 
  FaPlus, 
  FaEdit, 
  FaSearch, 
  FaFilter,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaTimes,
  FaCog,
  FaCheck
} from 'react-icons/fa'
import { 
  Card, 
  Button, 
  LoadingSpinner, 
  RadiologyModal,
  PageHeader,
  StatsOverview,
  FilterBar,
  DataTable,
  Pagination,
  StatusBadge,
  ActionButtons,
  ConfirmationModal
} from '../../../components'
import { useTheme } from '../../../contexts/ThemeContext'
import { radiologyAPI } from '../../../services/api'

const RadiologyManagement = () => {
  const { isDarkMode } = useTheme()
  const [centers, setCenters] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtering, setFiltering] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCity, setFilterCity] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedCenter, setSelectedCenter] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null)
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const searchTimeoutRef = useRef(null)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0
  })

  const cities = [
    { value: 'acre', label: 'Acre' },
    { value: 'al_bireh', label: 'Al-Bireh' },
    { value: 'beersheba', label: 'Beersheba' },
    { value: 'beit_hanoun', label: 'Beit Hanoun' },
    { value: 'beit_jala', label: 'Beit Jala' },
    { value: 'beit_lahia', label: 'Beit Lahia' },
    { value: 'beit_sahour', label: 'Beit Sahour' },
    { value: 'bethlehem', label: 'Bethlehem' },
    { value: 'deir_al_balah', label: 'Deir al-Balah' },
    { value: 'gaza', label: 'Gaza' },
    { value: 'haifa', label: 'Haifa' },
    { value: 'hebron', label: 'Hebron' },
    { value: 'jabalya', label: 'Jabalya' },
    { value: 'jaffa', label: 'Jaffa' },
    { value: 'jenin', label: 'Jenin' },
    { value: 'jericho', label: 'Jericho' },
    { value: 'jerusalem', label: 'Jerusalem' },
    { value: 'khan_yunis', label: 'Khan Yunis' },
    { value: 'lydd', label: 'Lydd' },
    { value: 'nablus', label: 'Nablus' },
    { value: 'nazareth', label: 'Nazareth' },
    { value: 'qalqilya', label: 'Qalqilya' },
    { value: 'rafah', label: 'Rafah' },
    { value: 'ramallah', label: 'Ramallah' },
    { value: 'ramla', label: 'Ramla' },
    { value: 'safad', label: 'Safad' },
    { value: 'salfit', label: 'Salfit' },
    { value: 'tiberias', label: 'Tiberias' },
    { value: 'tubas', label: 'Tubas' },
    { value: 'tulkarm', label: 'Tulkarm' }
  ]

  // Fetch centers
  const fetchCenters = async (isFiltering = false) => {
    try {
      if (isFiltering) {
        setFiltering(true)
      } else {
        setLoading(true)
      }
      
      const token = localStorage.getItem('dentify_access_token') || sessionStorage.getItem('dentify_access_token')
      
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
        ...(filterCity && { city: filterCity }),
        ...(filterStatus && { isActive: filterStatus })
      })

      const response = await fetch(`http://localhost:5000/api/radiology-centers?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        // Transform backend data to match frontend expectations
        const transformedCenters = data.data.map(center => ({
          _id: center.userId,
          name: center.centerName || center.registrationNumber, // Use centerName from database
          registrationNumber: center.registrationNumber,
          description: center.description || '',
          address: {
            street: center.location || '',
            city: center.city
          },
          phone: {
            full: center.user?.phone || '',
            countryCode: '',
            number: center.user?.phone || ''
          },
          email: center.user?.email || '',
          workingHours: center.workingHours || {},
          services: center.supportedTypes || [],
          equipment: [], // Not in schema, set empty array
          isActive: center.user?.status === 'ACTIVE',
          website: center.website,
          coordinates: center.coordinates
        }))
        
        setCenters(transformedCenters)
        setTotalPages(data.pagination?.pages || 1)
      } else {
        console.error('Failed to fetch centers:', data.message)
        setCenters([])
      }
    } catch (error) {
      console.error('Error fetching centers:', error)
      setCenters([])
    } finally {
      if (isFiltering) {
        setFiltering(false)
      } else {
        setLoading(false)
      }
    }
  }

  // Fetch center statistics
  const fetchStats = async () => {
    try {
      const data = await radiologyAPI.getStats()
      
      if (data && data.success && data.data) {
        setStats({
          total: data.data.total || 0,
          active: data.data.active || 0,
          inactive: data.data.pending || 0
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  useEffect(() => {
    fetchCenters()
    fetchStats()
    setIsFirstLoad(false)
  }, [])

  // Debounce search term
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300) // 300ms delay
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchTerm])

  // Separate effect for filtering that doesn't show full page loading
  useEffect(() => {
    if (!isFirstLoad) {
      fetchCenters(true) // Pass true to indicate this is filtering
    }
  }, [currentPage, debouncedSearchTerm, filterCity, filterStatus, isFirstLoad])

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const handleCityFilter = (e) => {
    setFilterCity(e.target.value)
    setCurrentPage(1)
  }

  const handleStatusFilter = (e) => {
    setFilterStatus(e.target.value)
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setDebouncedSearchTerm('')
    setFilterCity('')
    setFilterStatus('')
    setCurrentPage(1)
  }

  const getCityLabel = (cityValue) => {
    const city = cities.find(c => c.value === cityValue)
    return city ? city.label : cityValue
  }

  const handleCenterSave = (savedCenter, action) => {
    if (action === 'created') {
      // Refresh the list to show new center
      fetchCenters(true) // Use filtering state instead of full loading
      fetchStats()
    } else if (action === 'updated') {
      // Update the center in the current list
      setCenters(prev => prev.map(center => 
        center._id === savedCenter._id ? savedCenter : center
      ))
      fetchStats()
    }
  }

  const handleEditCenter = (center) => {
    setSelectedCenter(center)
    setShowEditModal(true)
  }

  const handleAddCenter = () => {
    setSelectedCenter(null)
    setShowAddModal(true)
  }

  const handleToggleCenterStatus = async (center) => {
    const action = center.isActive ? 'deactivate' : 'activate'
    
    setSelectedCenter(center)
    setConfirmAction(action)
    setShowConfirmModal(true)
  }

  const executeToggleStatus = async () => {
    const center = selectedCenter
    const action = confirmAction

    try {
      console.log('Toggling center status for center ID:', center._id)
      const response = await radiologyAPI.toggleStatus(center._id)
      console.log('Toggle status response:', response)

      if (response.success) {
        setShowConfirmModal(false)
        setSelectedCenter(null)
        setConfirmAction(null)
        fetchCenters(true)
        fetchStats()
      } else {
        alert(`Failed to ${action} center: ` + (response.error || response.message || 'Unknown error'))
      }
    } catch (error) {
      console.error(`Error ${action}ing center:`, error)
      alert(`Network error. Please try again. Details: ${error.message}`)
    }
  }

  // Stats configuration for StatsOverview component
  const statsConfig = [
    {
      label: 'Total Centers',
      value: stats.total,
      icon: FaXRay,
      gradient: 'from-teal-600 to-cyan-600'
    },
    {
      label: 'Active Centers',
      value: stats.active,
      icon: FaCheckCircle,
      gradient: 'from-green-600 to-green-700'
    },
    {
      label: 'Inactive Centers',
      value: stats.inactive,
      icon: FaTimesCircle,
      gradient: 'from-red-600 to-red-700'
    }
  ]

  // Filter configuration for FilterBar component
  const filters = [
    {
      value: filterCity,
      onChange: handleCityFilter,
      options: cities,
      placeholder: 'All Cities'
    },
    {
      value: filterStatus,
      onChange: handleStatusFilter,
      options: [
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' }
      ],
      placeholder: 'All Status'
    }
  ]

  // Table columns configuration
  const columns = [
    { key: 'center', label: 'Center' },
    { key: 'location', label: 'Location' },
    { key: 'contact', label: 'Contact' },
    { key: 'services', label: 'Services' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' }
  ]

  // Render table row
  const renderRow = (center, index) => {
    const actions = [
      {
        icon: FaEye,
        onClick: () => {
          setSelectedCenter(center)
          setShowDetailsModal(true)
        },
        title: 'View Details',
        variant: 'default'
      },
      {
        icon: FaEdit,
        onClick: () => handleEditCenter(center),
        title: 'Edit',
        variant: 'default'
      },
      {
        icon: center.isActive ? FaTimesCircle : FaCheckCircle,
        onClick: () => handleToggleCenterStatus(center),
        title: center.isActive ? 'Deactivate' : 'Activate',
        variant: center.isActive ? 'warning' : 'success'
      }
    ]

    return (
      <tr key={center._id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-600 to-cyan-600 flex items-center justify-center">
              <FaXRay className="w-5 h-5 text-white" />
            </div>
            <div className="ml-3">
              <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {center.name}
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {center.registrationNumber || 'N/A'}
              </div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {getCityLabel(center.address?.city)}
          </div>
          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {center.address?.street}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {center.email}
          </div>
          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {center.phone?.full}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {center.services?.length || 0} services
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <StatusBadge isActive={center.isActive} />
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm">
          <ActionButtons actions={actions} />
        </td>
      </tr>
    )
  }

  // Center Details Modal Component (keeping this inline as it's specific to radiology centers)
  const CenterDetailsModal = ({ center, onClose }) => {
    if (!center) return null

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
                  <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-lg">
                    <FaXRay className="w-12 h-12 text-teal-600" />
                  </div>
                  {/* Status indicator on avatar */}
                  <div className={`absolute bottom-1 right-1 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center ${
                    center.isActive ? 'bg-green-500' : 'bg-red-500'
                  }`}>
                    {center.isActive ? (
                      <FaCheck className="w-3 h-3 text-white" />
                    ) : (
                      <FaTimes className="w-3 h-3 text-white" />
                    )}
                  </div>
                </div>
                
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-1">
                    {center.name}
                  </h2>
                  <p className="text-teal-100 text-sm mb-2">
                    Radiology Center
                  </p>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${
                    center.isActive
                      ? 'bg-green-900/20 text-green-300 border-green-700'
                      : 'bg-red-900/20 text-red-300 border-red-700'
                  }`}>
                    {center.isActive ? <FaCheckCircle className="w-3 h-3" /> : <FaTimesCircle className="w-3 h-3" />}
                    {center.isActive ? 'Active' : 'Inactive'}
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
                    <FaXRay className="w-5 h-5 text-teal-600" />
                    Basic Information
                  </h3>
                  <div className={`grid grid-cols-2 gap-4 p-4 rounded-lg ${
                    isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}>
                    <div>
                      <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Center Name
                      </p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {center.name}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Registration Number
                      </p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {center.registrationNumber || 'N/A'}
                      </p>
                    </div>
                    {center.website && (
                      <div className="col-span-2">
                        <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Website
                        </p>
                        <a href={center.website} target="_blank" rel="noopener noreferrer" 
                           className="text-sm font-medium text-teal-600 hover:underline">
                          {center.website}
                        </a>
                      </div>
                    )}
                    {center.description && (
                      <div className="col-span-2">
                        <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Description
                        </p>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {center.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div>
                  <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    <FaMapMarkerAlt className="w-5 h-5 text-teal-600" />
                    Location
                  </h3>
                  <div className={`space-y-3 p-4 rounded-lg ${
                    isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}>
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
                          {getCityLabel(center.address?.city)}
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
                          Street Address
                        </p>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {center.address?.street}
                        </p>
                      </div>
                    </div>
                    {center.coordinates && (
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isDarkMode ? 'bg-gray-600' : 'bg-white'
                        }`}>
                          <FaMapMarkerAlt className="w-4 h-4 text-teal-600" />
                        </div>
                        <div className="flex-1">
                          <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Coordinates
                          </p>
                          <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {center.coordinates}
                          </p>
                        </div>
                      </div>
                    )}
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
                          {center.email}
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
                          {center.phone?.full}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Services & Equipment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Services */}
                  {center.services && center.services.length > 0 && (
                    <div>
                      <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        <FaCog className="w-5 h-5 text-teal-600" />
                        Services
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {center.services.map((service, index) => (
                          <span
                            key={index}
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              isDarkMode ? 'bg-teal-900/20 text-teal-400 border border-teal-800' : 'bg-teal-100 text-teal-700 border border-teal-200'
                            }`}
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Equipment */}
                  {center.equipment && center.equipment.length > 0 && (
                    <div>
                      <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        Equipment
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {center.equipment.map((item, index) => (
                          <span
                            key={index}
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading && centers.length === 0) {
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
        title="Radiology Centers Management"
        description="Manage and add registered radiology centers in the system"
        action={{
          label: 'Add New Center',
          onClick: handleAddCenter,
          icon: FaPlus,
          gradient: 'from-teal-600 to-cyan-600'
        }}
      />

      {/* Statistics Overview */}
      <StatsOverview stats={statsConfig} />

      {/* Search and Filters */}
      <Card className="p-6">
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={handleSearch}
          debouncedSearchTerm={debouncedSearchTerm}
          filters={filters}
          onClearFilters={clearFilters}
          filtering={filtering}
          searchPlaceholder="Search for center..."
        />
      </Card>

      {/* Centers Table */}
      <DataTable
        columns={columns}
        data={centers}
        renderRow={renderRow}
        loading={filtering}
        emptyMessage="No radiology centers yet"
        emptyIcon={FaXRay}
        emptyTitle="No radiology centers found"
        hasFilters={!!(searchTerm || filterCity || filterStatus)}
      />

      {/* Pagination */}
      <Card>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </Card>

      {/* Add Center Modal */}
      <RadiologyModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleCenterSave}
      />

      {/* Edit Center Modal */}
      <RadiologyModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        center={selectedCenter}
        onSave={handleCenterSave}
      />

      {/* Center Details Modal */}
      {showDetailsModal && (
        <CenterDetailsModal
          center={selectedCenter}
          onClose={() => {
            setShowDetailsModal(false)
            setSelectedCenter(null)
          }}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false)
          setSelectedCenter(null)
          setConfirmAction(null)
        }}
        onConfirm={executeToggleStatus}
        item={selectedCenter}
        action={confirmAction}
        itemName={selectedCenter?.name}
        itemType="Radiology Center"
      />
    </div>
  )
}

export default RadiologyManagement