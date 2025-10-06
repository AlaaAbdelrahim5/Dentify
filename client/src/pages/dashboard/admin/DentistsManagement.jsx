import { useState, useEffect, useRef, useCallback } from 'react'
import { 
  FaUserMd, 
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
  FaEye,
  FaCheck,
  FaTimes,
  FaCertificate,
  FaHospital,
  FaCalendarAlt,
  FaUsers
} from 'react-icons/fa'
import { MdPending, MdVerified, MdBlock } from 'react-icons/md'
import { Card, Button, Input, LoadingSpinner } from '../../../components'
import { useTheme } from '../../../contexts/ThemeContext'

const DentistsManagement = () => {
  const { isDarkMode } = useTheme()
  const [dentists, setDentists] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtering, setFiltering] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCity, setFilterCity] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterSpecialization, setFilterSpecialization] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedDentist, setSelectedDentist] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const searchTimeoutRef = useRef(null)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    active: 0,
    suspended: 0
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

  const specializations = [
    { value: 'General Dentistry', label: 'General Dentistry' },
    { value: 'Orthodontics', label: 'Orthodontics' },
    { value: 'Endodontics', label: 'Endodontics' },
    { value: 'Periodontics', label: 'Periodontics' },
    { value: 'Oral Surgery', label: 'Oral Surgery' },
    { value: 'Prosthodontics', label: 'Prosthodontics' },
    { value: 'Pediatric Dentistry', label: 'Pediatric Dentistry' },
    { value: 'Oral Pathology', label: 'Oral Pathology' },
    { value: 'Cosmetic Dentistry', label: 'Cosmetic Dentistry' },
    { value: 'Implantology', label: 'Implantology' }
  ]

  const statusOptions = [
    { value: 'pending', label: 'Pending Approval' },
    { value: 'active', label: 'Active' },
    { value: 'suspended', label: 'Suspended' }
  ]

  // Fetch dentists with all statuses for admin
  const fetchDentists = async (isFiltering = false) => {
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
        includeAll: 'true', // Include all statuses for admin
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
        ...(filterCity && { city: filterCity }),
        ...(filterStatus && { status: filterStatus }),
        ...(filterSpecialization && { specialization: filterSpecialization })
      })

      const response = await fetch(`http://localhost:5000/api/dentists?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success) {
        setDentists(data.data)
        setTotalPages(data.pagination.pages)
      }
    } catch (error) {
      console.error('Error fetching dentists:', error)
    } finally {
      if (isFiltering) {
        setFiltering(false)
      } else {
        setLoading(false)
      }
    }
  }

  // Fetch dentist statistics
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('dentify_access_token') || sessionStorage.getItem('dentify_access_token')
      
      const response = await fetch('http://localhost:5000/api/dentists/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('Error fetching dentist stats:', error)
    }
  }

  // Approve dentist
  const approveDentist = async (dentistId) => {
    try {
      const token = localStorage.getItem('dentify_access_token') || sessionStorage.getItem('dentify_access_token')
      
      const response = await fetch(`http://localhost:5000/api/dentists/${dentistId}/approve`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success) {
        // Refresh the list
        fetchDentists(true)
        fetchStats()
      } else {
        alert(data.message || 'Failed to approve dentist')
      }
    } catch (error) {
      console.error('Error approving dentist:', error)
      alert('Failed to approve dentist')
    }
  }

  // Suspend dentist
  const suspendDentist = async (dentistId) => {
    try {
      const token = localStorage.getItem('dentify_access_token') || sessionStorage.getItem('dentify_access_token')
      
      const response = await fetch(`http://localhost:5000/api/dentists/${dentistId}/suspend`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success) {
        // Refresh the list
        fetchDentists(true)
        fetchStats()
      } else {
        alert(data.message || 'Failed to suspend dentist')
      }
    } catch (error) {
      console.error('Error suspending dentist:', error)
      alert('Failed to suspend dentist')
    }
  }

  // Debounce search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchTerm])

  // Fetch data when filters change
  useEffect(() => {
    if (!isFirstLoad) {
      setCurrentPage(1)
      fetchDentists(true)
    }
  }, [debouncedSearchTerm, filterCity, filterStatus, filterSpecialization])

  // Fetch data when page changes
  useEffect(() => {
    if (!isFirstLoad) {
      fetchDentists(false)
    }
  }, [currentPage])

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchDentists(), fetchStats()])
      setIsFirstLoad(false)
    }
    loadData()
  }, [])

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        darkColor: 'bg-yellow-900/20 text-yellow-400 border-yellow-800',
        icon: MdPending 
      },
      active: { 
        color: 'bg-green-100 text-green-800 border-green-200', 
        darkColor: 'bg-green-900/20 text-green-400 border-green-800',
        icon: MdVerified 
      },
      suspended: { 
        color: 'bg-red-100 text-red-800 border-red-200', 
        darkColor: 'bg-red-900/20 text-red-400 border-red-800',
        icon: MdBlock 
      }
    }

    const config = statusConfig[status] || statusConfig.pending
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${
        isDarkMode ? config.darkColor : config.color
      }`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (timeString) => {
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const DentistDetailsModal = ({ dentist, onClose }) => {
    if (!dentist) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className={`max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl ${
          isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'
        }`}>
          {/* Header */}
          <div className={`sticky top-0 z-10 px-6 py-4 border-b ${
            isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-teal-600 to-cyan-600 flex items-center justify-center">
                  <FaUserMd className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Dr. {dentist.fullName}
                  </h2>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    License: {dentist.licenseNumber}
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
          <div className="p-6 space-y-6">
            {/* Status and Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusBadge(dentist.status)}
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Registered on {formatDate(dentist.createdAt)}
                </span>
              </div>
              <div className="flex gap-2">
                {dentist.status === 'pending' && (
                  <>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => approveDentist(dentist._id)}
                      className="flex items-center gap-1"
                    >
                      <FaCheck className="w-3 h-3" />
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => suspendDentist(dentist._id)}
                      className="flex items-center gap-1"
                    >
                      <FaTimes className="w-3 h-3" />
                      Reject
                    </Button>
                  </>
                )}
                {dentist.status === 'active' && (
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={() => suspendDentist(dentist._id)}
                    className="flex items-center gap-1"
                  >
                    <MdBlock className="w-3 h-3" />
                    Suspend
                  </Button>
                )}
                {dentist.status === 'suspended' && (
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => approveDentist(dentist._id)}
                    className="flex items-center gap-1"
                  >
                    <FaCheck className="w-3 h-3" />
                    Reactivate
                  </Button>
                )}
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-4">
                <h3 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  <FaUserMd className="w-4 h-4 text-teal-600" />
                  Personal Information
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Name:</span>
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{dentist.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Gender:</span>
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                      {dentist.gender.charAt(0).toUpperCase() + dentist.gender.slice(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Birth Date:</span>
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                      {formatDate(dentist.birthDate)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>City:</span>
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{dentist.address.city}</span>
                  </div>
                </div>
              </Card>

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
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{dentist.user?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Phone:</span>
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{dentist.user?.phone}</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Professional Information */}
            <Card className="p-4">
              <h3 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <FaCertificate className="w-4 h-4 text-teal-600" />
                Professional Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className={`block text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    License Number
                  </span>
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {dentist.licenseNumber}
                  </span>
                </div>
                <div>
                  <span className={`block text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Specializations
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {dentist.specialization.map((spec, index) => (
                      <span
                        key={index}
                        className={`px-2 py-1 rounded-full text-xs ${
                          isDarkMode ? 'bg-teal-900/20 text-teal-400' : 'bg-teal-100 text-teal-800'
                        }`}
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Clinic Information */}
            {dentist.clinic && (
              <Card className="p-4">
                <h3 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  <FaHospital className="w-4 h-4 text-teal-600" />
                  Clinic Information
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Clinic Name:</span>
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{dentist.clinic.clinicName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Location:</span>
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{dentist.clinic.city}</span>
                  </div>
                </div>
              </Card>
            )}

            {/* Working Hours */}
            {dentist.workingHours && dentist.workingHours.length > 0 && (
              <Card className="p-4">
                <h3 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  <FaClock className="w-4 h-4 text-teal-600" />
                  Working Hours
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {dentist.workingHours.map((schedule, index) => (
                    <div key={index} className="flex justify-between">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>{schedule.day}:</span>
                      <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                        {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Appointment Duration:</span>
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{dentist.appointmentDuration} minutes</span>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (loading && isFirstLoad) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Dentist Management
          </h1>
          <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Review and approve dentist registrations
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Dentists
              </p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.total}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center">
              <FaUsers className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Pending Approval
              </p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.pending}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-600 to-yellow-700 flex items-center justify-center">
              <MdPending className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Active Dentists
              </p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.active}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-600 to-green-700 flex items-center justify-center">
              <MdVerified className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Suspended
              </p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.suspended}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-600 to-red-700 flex items-center justify-center">
              <MdBlock className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              icon={FaSearch}
              placeholder="Search dentists by name, license number, or specialization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`px-4 py-2 rounded-lg border focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">All Statuses</option>
              {statusOptions.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            
            <select
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              className={`px-4 py-2 rounded-lg border focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">All Cities</option>
              {cities.map(city => (
                <option key={city.value} value={city.value}>
                  {city.label}
                </option>
              ))}
            </select>

            <select
              value={filterSpecialization}
              onChange={(e) => setFilterSpecialization(e.target.value)}
              className={`px-4 py-2 rounded-lg border focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">All Specializations</option>
              {specializations.map(spec => (
                <option key={spec.value} value={spec.value}>
                  {spec.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Dentists List */}
      <Card>
        {filtering && (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        )}
        
        {!filtering && dentists.length === 0 && (
          <div className="text-center py-12">
            <FaUserMd className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              No dentists found
            </h3>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {searchTerm || filterCity || filterStatus || filterSpecialization
                ? 'Try adjusting your search criteria'
                : 'No dentist registrations yet'
              }
            </p>
          </div>
        )}

        {!filtering && dentists.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Dentist
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    License & Specialization
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Clinic & Location
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Status
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Registration Date
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {dentists.map((dentist) => (
                  <tr key={dentist._id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-600 to-cyan-600 flex items-center justify-center">
                          <FaUserMd className="w-5 h-5 text-white" />
                        </div>
                        <div className="ml-3">
                          <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Dr. {dentist.fullName}
                          </div>
                          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {dentist.user?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {dentist.licenseNumber}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {dentist.specialization.slice(0, 2).map((spec, index) => (
                          <span
                            key={index}
                            className={`px-2 py-1 rounded text-xs ${
                              isDarkMode ? 'bg-teal-900/20 text-teal-400' : 'bg-teal-100 text-teal-800'
                            }`}
                          >
                            {spec}
                          </span>
                        ))}
                        {dentist.specialization.length > 2 && (
                          <span className={`px-2 py-1 rounded text-xs ${
                            isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'
                          }`}>
                            +{dentist.specialization.length - 2} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {dentist.clinic?.clinicName || 'N/A'}
                      </div>
                      <div className={`text-sm flex items-center gap-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <FaMapMarkerAlt className="w-3 h-3" />
                        {dentist.address.city}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(dentist.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {formatDate(dentist.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedDentist(dentist)
                            setShowDetailsModal(true)
                          }}
                          className={`p-2 rounded-lg transition-colors ${
                            isDarkMode ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                          }`}
                          title="View Details"
                        >
                          <FaEye className="w-4 h-4" />
                        </button>
                        
                        {dentist.status === 'pending' && (
                          <>
                            <button
                              onClick={() => approveDentist(dentist._id)}
                              className="p-2 rounded-lg text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors"
                              title="Approve"
                            >
                              <FaCheck className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => suspendDentist(dentist._id)}
                              className="p-2 rounded-lg text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                              title="Reject"
                            >
                              <FaTimes className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        
                        {dentist.status === 'active' && (
                          <button
                            onClick={() => suspendDentist(dentist._id)}
                            className="p-2 rounded-lg text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900/20 transition-colors"
                            title="Suspend"
                          >
                            <MdBlock className="w-4 h-4" />
                          </button>
                        )}
                        
                        {dentist.status === 'suspended' && (
                          <button
                            onClick={() => approveDentist(dentist._id)}
                            className="p-2 rounded-lg text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors"
                            title="Reactivate"
                          >
                            <FaCheck className="w-4 h-4" />
                          </button>
                        )}
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

      {/* Dentist Details Modal */}
      {showDetailsModal && (
        <DentistDetailsModal
          dentist={selectedDentist}
          onClose={() => {
            setShowDetailsModal(false)
            setSelectedDentist(null)
          }}
        />
      )}
    </div>
  )
}

export default DentistsManagement