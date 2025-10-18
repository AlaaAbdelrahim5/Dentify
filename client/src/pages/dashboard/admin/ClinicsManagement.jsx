import { useState, useEffect, useRef, useCallback } from 'react'
import { 
  FaHospital, 
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
  FaUserMd
} from 'react-icons/fa'
import { Card, Button, Input, LoadingSpinner, ClinicModal } from '../../../components'
import { useTheme } from '../../../contexts/ThemeContext'
import { clinicsAPI } from '../../../services/api'

const ClinicsManagement = () => {
  const { isDarkMode } = useTheme()
  const [clinics, setClinics] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtering, setFiltering] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCity, setFilterCity] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedClinic, setSelectedClinic] = useState(null)
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

  // Fetch clinics
  const fetchClinics = async (isFiltering = false) => {
    try {
      if (isFiltering) {
        setFiltering(true)
      } else {
        setLoading(true)
      }
      
      const params = {
        page: currentPage,
        limit: 10,
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
        ...(filterCity && { city: filterCity }),
        ...(filterStatus && { isActive: filterStatus })
      }

      const queryString = new URLSearchParams(params).toString()
      const response = await fetch(`http://localhost:5000/api/clinics?${queryString}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('dentify_access_token') || sessionStorage.getItem('dentify_access_token')}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success) {
        // Transform backend data to match frontend expectations
        const transformedClinics = data.data.map(clinic => ({
          _id: clinic.userId,
          name: clinic.clinicName,
          description: clinic.description || '',
          address: {
            fullAddress: clinic.location || '',
            city: clinic.city
          },
          phone: {
            full: clinic.user?.phone || ''
          },
          email: clinic.user?.email || '',
          workingHours: clinic.workingHours || {},
          doctors: clinic.dentists || [],
          secretaries: clinic.secretaries || [],
          isActive: clinic.user?.status === 'ACTIVE',
          registrationNumber: clinic.registrationNumber,
          website: clinic.website,
          servicesAvailable: clinic.servicesAvailable || []
        }))
        
        setClinics(transformedClinics)
        setTotalPages(data.pagination.pages)
      }
    } catch (error) {
      console.error('Error fetching clinics:', error)
    } finally {
      if (isFiltering) {
        setFiltering(false)
      } else {
        setLoading(false)
      }
    }
  }

  // Fetch clinic statistics
  const fetchStats = async () => {
    try {
      const data = await clinicsAPI.getStats()
      
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
    fetchClinics()
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
      fetchClinics(true) // Pass true to indicate this is filtering
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

  const getStatusColor = (isActive) => {
    return isActive ? 'text-green-600' : 'text-red-600'
  }

  const getStatusIcon = (isActive) => {
    return isActive ? FaCheckCircle : FaTimesCircle
  }

  const formatWorkingHours = (workingHours) => {
    if (!workingHours || workingHours.length === 0) return 'Not specified'
    
    // Handle array format from backend
    if (Array.isArray(workingHours)) {
      if (workingHours.length === 0) return 'Closed'
      
      const firstDay = workingHours[0]
      return `${firstDay.startTime} - ${firstDay.endTime}`
    }
    
    // Handle object format (legacy)
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const openDays = days.filter(day => workingHours[day]?.isOpen)
    
    if (openDays.length === 0) return 'Closed'
    
    const firstDay = openDays[0]
    const firstDayHours = workingHours[firstDay]
    
    return `${firstDayHours.start} - ${firstDayHours.end}`
  }

  const getCityLabel = (cityValue) => {
    const city = cities.find(c => c.value === cityValue)
    return city ? city.label : cityValue
  }

  const handleClinicSave = (savedClinic, action) => {
    if (action === 'created') {
      // Refresh the list to show new clinic
      fetchClinics(true) // Use filtering state instead of full loading
      fetchStats()
    } else if (action === 'updated') {
      // Update the clinic in the current list
      setClinics(prev => prev.map(clinic => 
        clinic._id === savedClinic._id ? savedClinic : clinic
      ))
      fetchStats()
    }
  }

  const handleEditClinic = (clinic) => {
    setSelectedClinic(clinic)
    setShowEditModal(true)
  }

  const handleAddClinic = () => {
    setSelectedClinic(null)
    setShowAddModal(true)
  }

  const handleToggleClinicStatus = async (clinic) => {
    const action = clinic.isActive ? 'deactivate' : 'activate'
    
    setSelectedClinic(clinic)
    setConfirmAction(action)
    setShowConfirmModal(true)
  }

  const executeToggleStatus = async () => {
    const clinic = selectedClinic
    const action = confirmAction

    try {
      console.log('Toggling clinic status for clinic ID:', clinic._id)
      const response = await clinicsAPI.toggleStatus(clinic._id)
      console.log('Toggle status response:', response)

      if (response.success) {
        setShowConfirmModal(false)
        fetchClinics(true)
        fetchStats()
        // You can add a success toast notification here instead of alert
      } else {
        alert(`Failed to ${action} clinic: ` + (response.error || response.message || 'Unknown error'))
      }
    } catch (error) {
      console.error(`Error ${action}ing clinic:`, error)
      alert(`Network error. Please try again. Details: ${error.message}`)
    }
  }

  // Modern Confirmation Modal Component
  const ConfirmationModal = ({ isOpen, onClose, onConfirm, clinic, action }) => {
    if (!isOpen || !clinic) return null

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
                {isDeactivate ? 'Deactivate Clinic?' : 'Activate Clinic?'}
              </h3>

              {/* Message */}
              <p className={`text-center px-6 mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Are you sure you want to {action}{' '}
                <span className="font-semibold">{clinic.name}</span>?
              </p>

              {/* Additional Info */}
              <p className={`text-sm text-center px-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {isDeactivate
                  ? 'The clinic will no longer be accessible to users.'
                  : 'The clinic will be accessible and fully functional.'}
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

  // Clinic Details Modal Component
  const ClinicDetailsModal = ({ clinic, onClose }) => {
    if (!clinic) return null

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-transparent transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="flex min-h-full items-center justify-center p-4">
          <div
            className={`relative rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col ${
              isDarkMode
                ? "bg-gray-800 border border-gray-700"
                : "bg-white border border-gray-200"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className={`flex items-center justify-between p-6 border-b flex-shrink-0 ${
                isDarkMode
                  ? "border-gray-700 bg-gray-800"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-teal-600 to-cyan-600 flex items-center justify-center">
                    <FaHospital className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {clinic.name}
                    </h2>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Dental Clinic
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                  }`}
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${
                      clinic.isActive
                        ? isDarkMode 
                          ? 'bg-green-900/20 text-green-400 border-green-800'
                          : 'bg-green-100 text-green-800 border-green-200'
                        : isDarkMode
                          ? 'bg-red-900/20 text-red-400 border-red-800'
                          : 'bg-red-100 text-red-800 border-red-200'
                    }`}>
                      {clinic.isActive ? <FaCheckCircle className="w-3 h-3" /> : <FaTimesCircle className="w-3 h-3" />}
                      {clinic.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Basic Information */}
                <Card className="p-4">
                  <h3 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    <FaHospital className="w-4 h-4 text-teal-600" />
                    Basic Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Clinic Name:</span>
                      <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{clinic.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Registration Number:</span>
                      <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{clinic.registrationNumber || 'N/A'}</span>
                    </div>
                    {clinic.description && (
                      <div className="flex justify-between">
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Description:</span>
                        <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-right max-w-xs`}>{clinic.description}</span>
                      </div>
                    )}
                    {clinic.website && (
                      <div className="flex justify-between">
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Website:</span>
                        <a href={clinic.website} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">
                          {clinic.website}
                        </a>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Location Information */}
                <Card className="p-4">
                  <h3 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    <FaMapMarkerAlt className="w-4 h-4 text-teal-600" />
                    Location
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>City:</span>
                      <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{getCityLabel(clinic.address.city)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Address:</span>
                      <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-right max-w-xs`}>{clinic.address.fullAddress}</span>
                    </div>
                  </div>
                </Card>

                {/* Contact Information */}
                <Card className="p-4">
                  <h3 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    <FaEnvelope className="w-4 h-4 text-teal-600" />
                    Contact Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Email:</span>
                      <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{clinic.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Phone:</span>
                      <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{clinic.phone.full}</span>
                    </div>
                  </div>
                </Card>

                {/* Working Hours */}
                <Card className="p-4">
                  <h3 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    <FaClock className="w-4 h-4 text-teal-600" />
                    Working Hours
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Schedule:</span>
                      <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{formatWorkingHours(clinic.workingHours)}</span>
                    </div>
                  </div>
                </Card>

                {/* Staff Information */}
                <Card className="p-4">
                  <h3 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    <FaUserMd className="w-4 h-4 text-teal-600" />
                    Staff
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Doctors:</span>
                      <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{clinic.doctors?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Secretaries:</span>
                      <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{clinic.secretaries?.length || 0}</span>
                    </div>
                  </div>
                </Card>

                {/* Services */}
                {clinic.servicesAvailable && clinic.servicesAvailable.length > 0 && (
                  <Card className="p-4">
                    <h3 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Services Available
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {clinic.servicesAvailable.map((service, index) => (
                        <span
                          key={index}
                          className={`px-3 py-1 rounded-full text-sm ${
                            isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading && clinics.length === 0) {
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
            Clinics Management
          </h1>
          <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage and add registered clinics in the system
          </p>
        </div>
        <Button
          onClick={handleAddClinic}
          className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-600"
        >
          <FaPlus className="w-4 h-4" />
          Add New Clinic
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Clinics
              </p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.total}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-teal-600 to-cyan-600 flex items-center justify-center">
              <FaHospital className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Active Clinics
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
                Inactive Clinics
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
              placeholder="Search for clinic..."
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
            {cities.map(city => (
              <option key={city.value} value={city.value}>{city.label}</option>
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
            onClick={() => {
              setSearchTerm('')
              setDebouncedSearchTerm('')
              setFilterCity('')
              setFilterStatus('')
              setCurrentPage(1)
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

      {/* Clinics List */}
      <Card>
        {filtering && (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        )}
        
        {!filtering && clinics.length === 0 && (
          <div className="text-center py-12">
            <FaHospital className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              No clinics found
            </h3>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {searchTerm || filterCity || filterStatus ? 'Try adjusting your search criteria' : 'No clinics yet'}
            </p>
          </div>
        )}

        {!filtering && clinics.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Clinic
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
                    Staff
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
                {clinics.map((clinic) => {
                  const StatusIcon = getStatusIcon(clinic.isActive)
                  return (
                    <tr key={clinic._id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-600 to-cyan-600 flex items-center justify-center">
                            <FaHospital className="w-5 h-5 text-white" />
                          </div>
                          <div className="ml-3">
                            <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {clinic.name}
                            </div>
                            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {clinic.registrationNumber || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {getCityLabel(clinic.address.city)}
                        </div>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {clinic.address.fullAddress}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {clinic.email}
                        </div>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {clinic.phone.full}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          <div>Doctors: {clinic.doctors?.length || 0}</div>
                          <div>Secretaries: {clinic.secretaries?.length || 0}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${
                          clinic.isActive
                            ? isDarkMode 
                              ? 'bg-green-900/20 text-green-400 border-green-800'
                              : 'bg-green-100 text-green-800 border-green-200'
                            : isDarkMode
                              ? 'bg-red-900/20 text-red-400 border-red-800'
                              : 'bg-red-100 text-red-800 border-red-200'
                        }`}>
                          <StatusIcon className="w-3 h-3" />
                          {clinic.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedClinic(clinic)
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
                            onClick={() => handleEditClinic(clinic)}
                            className={`p-2 rounded-lg transition-colors ${
                              isDarkMode ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                            }`}
                            title="Edit"
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleToggleClinicStatus(clinic)}
                            className={`p-2 rounded-lg transition-colors ${
                              clinic.isActive
                                ? 'text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/20'
                                : 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20'
                            }`}
                            title={clinic.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {clinic.isActive ? <FaTimesCircle className="w-4 h-4" /> : <FaCheckCircle className="w-4 h-4" />}
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

      {/* Add Clinic Modal */}
      <ClinicModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        clinic={null}
        onSave={handleClinicSave}
      />

      {/* Edit Clinic Modal */}
      <ClinicModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedClinic(null)
        }}
        clinic={selectedClinic}
        onSave={handleClinicSave}
      />

      {/* Clinic Details Modal */}
      {showDetailsModal && (
        <ClinicDetailsModal
          clinic={selectedClinic}
          onClose={() => {
            setShowDetailsModal(false)
            setSelectedClinic(null)
          }}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false)
          setSelectedClinic(null)
          setConfirmAction(null)
        }}
        onConfirm={executeToggleStatus}
        clinic={selectedClinic}
        action={confirmAction}
      />
    </div>
  )
}

export default ClinicsManagement