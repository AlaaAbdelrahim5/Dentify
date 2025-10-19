import { useState, useEffect, useRef, useCallback } from 'react'
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
import { Card, Button, Input, LoadingSpinner, RadiologyModal } from '../../../components'
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
          name: center.registrationNumber, // Using registration number as name since there's no centerName field
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

  // Modern Confirmation Modal Component
  const ConfirmationModal = ({ isOpen, onClose, onConfirm, center, action }) => {
    if (!isOpen || !center) return null

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
                {isDeactivate ? 'Deactivate Center?' : 'Activate Center?'}
              </h3>

              {/* Message */}
              <p className={`text-center px-6 mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Are you sure you want to {action}{' '}
                <span className="font-semibold">{center.name}</span>?
              </p>

              {/* Additional Info */}
              <p className={`text-sm text-center px-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {isDeactivate
                  ? 'The radiology center will no longer be accessible to users.'
                  : 'The radiology center will be accessible and fully functional.'}
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

  // Center Details Modal Component
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
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Radiology Centers Management
          </h1>
          <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage and add registered radiology centers in the system
          </p>
        </div>
        <Button
          onClick={handleAddCenter}
          className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-600"
        >
          <FaPlus className="w-4 h-4" />
          Add New Center
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Centers
              </p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.total}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-teal-600 to-cyan-600 flex items-center justify-center">
              <FaXRay className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Active Centers
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
                Inactive Centers
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
              placeholder="Search for center..."
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
            value={filterCity}
            onChange={handleCityFilter}
            disabled={filtering}
            className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-50 ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-gray-200' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="">All Cities</option>
            {cities.map((city) => (
              <option key={city.value} value={city.value}>
                {city.label}
              </option>
            ))}
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
            onClick={clearFilters}
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

      {/* Centers List */}
      <Card>
        {filtering && (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        )}
        
        {!filtering && centers.length === 0 && (
          <div className="text-center py-12">
            <FaXRay className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              No radiology centers found
            </h3>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {searchTerm || filterCity || filterStatus ? 'Try adjusting your search criteria' : 'No radiology centers yet'}
            </p>
          </div>
        )}

        {!filtering && centers.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Center
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Location
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Contact
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Services
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
                {centers.map((center) => (
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
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${
                        center.isActive
                          ? isDarkMode 
                            ? 'bg-green-900/20 text-green-400 border-green-800'
                            : 'bg-green-100 text-green-800 border-green-200'
                          : isDarkMode
                            ? 'bg-red-900/20 text-red-400 border-red-800'
                            : 'bg-red-100 text-red-800 border-red-200'
                      }`}>
                        {center.isActive ? <FaCheckCircle className="w-3 h-3" /> : <FaTimesCircle className="w-3 h-3" />}
                        {center.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedCenter(center)
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
                          onClick={() => handleEditCenter(center)}
                          className={`p-2 rounded-lg transition-colors ${
                            isDarkMode ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                          }`}
                          title="Edit"
                        >
                          <FaEdit className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleToggleCenterStatus(center)}
                          className={`p-2 rounded-lg transition-colors ${
                            center.isActive
                              ? 'text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/20'
                              : 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20'
                          }`}
                          title={center.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {center.isActive ? <FaTimesCircle className="w-4 h-4" /> : <FaCheckCircle className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 dark:border-gray-700">
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Modals */}
      <RadiologyModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleCenterSave}
      />

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
        center={selectedCenter}
        action={confirmAction}
      />
    </div>
  )
}

export default RadiologyManagement