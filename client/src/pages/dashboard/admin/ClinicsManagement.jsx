import { useState, useEffect, useRef } from 'react'
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
  FaUserMd,
  FaCheck
} from 'react-icons/fa'
import { 
  Card, 
  Button, 
  LoadingSpinner, 
  ClinicModal,
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
          coordinates: clinic.coordinates,
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

  const clearFilters = () => {
    setSearchTerm('')
    setDebouncedSearchTerm('')
    setFilterCity('')
    setFilterStatus('')
    setCurrentPage(1)
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
        setSelectedClinic(null)
        setConfirmAction(null)
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

  // Stats configuration for StatsOverview component
  const statsConfig = [
    {
      label: 'Total Clinics',
      value: stats.total,
      icon: FaHospital,
      gradient: 'from-teal-600 to-cyan-600'
    },
    {
      label: 'Active Clinics',
      value: stats.active,
      icon: FaCheckCircle,
      gradient: 'from-green-600 to-green-700'
    },
    {
      label: 'Inactive Clinics',
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
    { key: 'clinic', label: 'Clinic' },
    { key: 'location', label: 'Location' },
    { key: 'contact', label: 'Contact' },
    { key: 'staff', label: 'Staff' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' }
  ]

  // Render table row
  const renderRow = (clinic, index) => {
    const actions = [
      {
        icon: FaEye,
        onClick: () => {
          setSelectedClinic(clinic)
          setShowDetailsModal(true)
        },
        title: 'View Details',
        variant: 'default'
      },
      {
        icon: FaEdit,
        onClick: () => handleEditClinic(clinic),
        title: 'Edit',
        variant: 'default'
      },
      {
        icon: clinic.isActive ? FaTimesCircle : FaCheckCircle,
        onClick: () => handleToggleClinicStatus(clinic),
        title: clinic.isActive ? 'Deactivate' : 'Activate',
        variant: clinic.isActive ? 'warning' : 'success'
      }
    ]

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
          <StatusBadge isActive={clinic.isActive} />
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm">
          <ActionButtons actions={actions} />
        </td>
      </tr>
    )
  }

  // Clinic Details Modal Component (keeping this inline as it's specific to clinics)
  const ClinicDetailsModal = ({ clinic, onClose }) => {
    if (!clinic) return null

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
                    <FaHospital className="w-12 h-12 text-teal-600" />
                  </div>
                  {/* Status indicator on avatar */}
                  <div className={`absolute bottom-1 right-1 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center ${
                    clinic.isActive ? 'bg-green-500' : 'bg-red-500'
                  }`}>
                    {clinic.isActive ? (
                      <FaCheck className="w-3 h-3 text-white" />
                    ) : (
                      <FaTimes className="w-3 h-3 text-white" />
                    )}
                  </div>
                </div>
                
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-1">
                    {clinic.name}
                  </h2>
                  <p className="text-teal-100 text-sm mb-2">
                    Dental Clinic
                  </p>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${
                    clinic.isActive
                      ? 'bg-green-900/20 text-green-300 border-green-700'
                      : 'bg-red-900/20 text-red-300 border-red-700'
                  }`}>
                    {clinic.isActive ? <FaCheckCircle className="w-3 h-3" /> : <FaTimesCircle className="w-3 h-3" />}
                    {clinic.isActive ? 'Active' : 'Inactive'}
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
                    <FaHospital className="w-5 h-5 text-teal-600" />
                    Basic Information
                  </h3>
                  <div className={`grid grid-cols-2 gap-4 p-4 rounded-lg ${
                    isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}>
                    <div>
                      <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Clinic Name
                      </p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {clinic.name}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Registration Number
                      </p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {clinic.registrationNumber || 'N/A'}
                      </p>
                    </div>
                    {clinic.website && (
                      <div className="col-span-2">
                        <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Website
                        </p>
                        <a href={clinic.website} target="_blank" rel="noopener noreferrer" 
                           className="text-sm font-medium text-teal-600 hover:underline">
                          {clinic.website}
                        </a>
                      </div>
                    )}
                    {clinic.description && (
                      <div className="col-span-2">
                        <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Description
                        </p>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {clinic.description}
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
                          {getCityLabel(clinic.address.city)}
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
                          Full Address
                        </p>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {clinic.address.fullAddress}
                        </p>
                      </div>
                    </div>
                    {clinic.coordinates && (
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
                            {clinic.coordinates}
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
                          {clinic.email}
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
                          {clinic.phone.full}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Working Hours & Staff */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      <FaClock className="w-5 h-5 text-teal-600" />
                      Working Hours
                    </h3>
                    <div className={`p-4 rounded-lg ${
                      isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                    }`}>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {formatWorkingHours(clinic.workingHours)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      <FaUserMd className="w-5 h-5 text-teal-600" />
                      Staff
                    </h3>
                    <div className={`p-4 rounded-lg space-y-2 ${
                      isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                    }`}>
                      <div className="flex justify-between">
                        <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Doctors:
                        </span>
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {clinic.doctors?.length || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Secretaries:
                        </span>
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {clinic.secretaries?.length || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Services Available */}
                {clinic.servicesAvailable && clinic.servicesAvailable.length > 0 && (
                  <div>
                    <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Services Available
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {clinic.servicesAvailable.map((service, index) => (
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
      {/* Page Header */}
      <PageHeader
        title="Clinics Management"
        description="Manage and add registered clinics in the system"
        action={{
          label: 'Add New Clinic',
          onClick: handleAddClinic,
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
          searchPlaceholder="Search for clinic..."
        />
      </Card>

      {/* Clinics Table */}
      <DataTable
        columns={columns}
        data={clinics}
        renderRow={renderRow}
        loading={filtering}
        emptyMessage="No clinics yet"
        emptyIcon={FaHospital}
        emptyTitle="No clinics found"
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
        item={selectedClinic}
        action={confirmAction}
        itemName={selectedClinic?.name}
        itemType="Clinic"
      />
    </div>
  )
}

export default ClinicsManagement