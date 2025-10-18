import { useState, useEffect, useRef, useCallback } from 'react'
import { 
  FaHospital, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch, 
  FaFilter,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaEye
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

  const handleDeleteClinic = async (clinic) => {
    if (!confirm(`Are you sure you want to delete "${clinic.name}"? This action will deactivate the clinic.`)) {
      return
    }

    try {
      const token = localStorage.getItem('dentify_access_token') || sessionStorage.getItem('dentify_access_token')
      
      const response = await fetch(`http://localhost:5000/api/clinics/${clinic._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success) {
        // Remove from the current list or refetch
        fetchClinics(true)
        fetchStats()
        alert('Clinic deleted successfully')
      } else {
        alert('Failed to delete clinic: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error deleting clinic:', error)
      alert('Network error. Please try again.')
    }
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Clinics Management</h2>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Manage and add registered clinics in the system</p>
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
        <Card className={`p-6 border ${isDarkMode 
          ? 'bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-700/30' 
          : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>Total Clinics</p>
              <p className={`text-3xl font-bold ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>{stats.total}</p>
            </div>
            <FaHospital className={`w-8 h-8 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          </div>
        </Card>

        <Card className={`p-6 border ${isDarkMode 
          ? 'bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-700/30' 
          : 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>Active Clinics</p>
              <p className={`text-3xl font-bold ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>{stats.active}</p>
            </div>
            <FaCheckCircle className={`w-8 h-8 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
          </div>
        </Card>

        <Card className={`p-6 border ${isDarkMode 
          ? 'bg-gradient-to-br from-red-900/20 to-red-800/20 border-red-700/30' 
          : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>Inactive Clinics</p>
              <p className={`text-3xl font-bold ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>{stats.inactive}</p>
            </div>
            <FaTimesCircle className={`w-8 h-8 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
          </div>
        </Card>
      </div>

      {/* Filters */}
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
      <div className="relative">
        {filtering && (
          <div className={`absolute inset-0 bg-opacity-75 flex items-center justify-center z-10 rounded-lg ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <LoadingSpinner />
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {clinics.map((clinic) => {
          const StatusIcon = getStatusIcon(clinic.isActive)
          return (
            <Card key={clinic._id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{clinic.name}</h3>
                    <StatusIcon className={`w-4 h-4 ${getStatusColor(clinic.isActive)}`} />
                  </div>
                  <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{clinic.description || 'No description available'}</p>
                </div>
              </div>

              <div className="space-y-3">
                {/* Address */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FaMapMarkerAlt className="w-4 h-4 text-teal-600" />
                  <span>{clinic.address.fullAddress} - {getCityLabel(clinic.address.city)}</span>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FaPhone className="w-4 h-4 text-teal-600" />
                  <span>{clinic.phone.full}</span>
                </div>

                {/* Email */}
                {clinic.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaEnvelope className="w-4 h-4 text-teal-600" />
                    <span>{clinic.email}</span>
                  </div>
                )}

                {/* Working Hours */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FaClock className="w-4 h-4 text-teal-600" />
                  <span>Working Hours: {formatWorkingHours(clinic.workingHours)}</span>
                </div>

                {/* Doctors Count */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">Doctors: {clinic.doctors?.length || 0}</span>
                  <span className="font-medium">Secretaries: {clinic.secretaries?.length || 0}</span>
                </div>
              </div>

              {/* Actions */}
              <div className={`flex gap-2 mt-4 pt-4 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                <Button
                  onClick={() => setSelectedClinic(clinic)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <FaEye className="w-3 h-3" />
                  View
                </Button>
                <Button
                  onClick={() => handleEditClinic(clinic)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <FaEdit className="w-3 h-3" />
                  Edit
                </Button>
                <Button
                  onClick={() => handleDeleteClinic(clinic)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 text-red-600 hover:bg-red-50"
                >
                  <FaTrash className="w-3 h-3" />
                  Delete
                </Button>
              </div>
            </Card>
          )
        })}
        </div>

        {clinics.length === 0 && !loading && (
          <Card className="p-12 text-center">
            <FaHospital className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>No Clinics Found</h3>
            <p className={`mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No clinics match your search criteria</p>
            <Button
              onClick={handleAddClinic}
              className="bg-gradient-to-r from-teal-600 to-cyan-600"
            >
              Add New Clinic
            </Button>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            variant="outline"
            size="sm"
          >
            Previous
          </Button>
          
          <span className={`flex items-center px-4 py-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Page {currentPage} of {totalPages}
          </span>
          
          <Button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            variant="outline"
            size="sm"
          >
            Next
          </Button>
        </div>
      )}

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
    </div>
  )
}

export default ClinicsManagement