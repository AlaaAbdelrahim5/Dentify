import { useState, useEffect, useRef } from 'react'
import { 
  FaPlus, 
  FaSearch, 
  FaEdit,
  FaUserMd,
  FaClock,
  FaMapMarkerAlt,
  FaGraduationCap,
  FaFilter,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaCertificate,
  FaPhone,
  FaEnvelope,
  FaTimes,
  FaGlobe,
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaTwitter
} from 'react-icons/fa'
import { useTheme } from '../../../contexts/ThemeContext'
import { 
  Button, 
  Card,
  LoadingSpinner,
  PageHeader,
  StatsOverview,
  FilterBar,
  DataTable,
  StatusBadge,
  ActionButtons,
  ConfirmationModal,
  DentistModal
} from '../../../components'
import { dentistsAPI } from '../../../services/api'

const DentistsManagement = () => {
  const { isDarkMode } = useTheme()
  const [dentists, setDentists] = useState([])
  const [filteredDentists, setFilteredDentists] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtering, setFiltering] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [filterSpecialization, setFilterSpecialization] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDentist, setSelectedDentist] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [dentistToView, setDentistToView] = useState(null)
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null)
  const [dentistToToggle, setDentistToToggle] = useState(null)
  const searchTimeoutRef = useRef(null)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    rejected: 0,
    inactive: 0
  })

  // Specializations list
  const specializations = [
    'General Dentistry',
    'Orthodontics',
    'Endodontics',
    'Periodontics',
    'Oral Surgery',
    'Prosthodontics',
    'Pediatric Dentistry',
    'Oral Pathology',
    'Cosmetic Dentistry',
    'Implantology'
  ]

  // Load dentists from backend
  const loadDentists = async (isFiltering = false) => {
    try {
      if (isFiltering) {
        setFiltering(true)
      } else {
        setLoading(true)
      }
      setError(null)
      
      const response = await dentistsAPI.getForClinic()
      if (response && response.success) {
        // Map the data to normalize the structure - backend returns 'user', not 'userId'
        const dentistsData = (response.data || []).map(dentist => ({
          ...dentist,
          _id: dentist.userId, // Use userId as _id for consistency
          userId: dentist.user // Map user object to userId for component compatibility
        }))
        setDentists(dentistsData)
        
        // Calculate stats
        const total = dentistsData.length
        const active = dentistsData.filter(d => d.user?.status === 'ACTIVE').length
        const pending = dentistsData.filter(d => d.user?.status === 'PENDING').length
        const rejected = dentistsData.filter(d => d.user?.status === 'REJECTED').length
        const inactive = dentistsData.filter(d => d.user?.status === 'DEACTIVATED').length
        
        setStats({ total, active, pending, rejected, inactive })
      } else {
        setError(response?.message || 'Failed to load dentists')
      }
    } catch (error) {
      console.error('Error loading dentists:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load dentists. Please try again.'
      setError(errorMessage)
    } finally {
      if (isFiltering) {
        setFiltering(false)
      } else {
        setLoading(false)
        setIsFirstLoad(false)
      }
    }
  }

  // Initial load
  useEffect(() => {
    loadDentists()
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

  // Filter dentists based on search and filters
  useEffect(() => {
    if (!isFirstLoad) {
      setFiltering(true)
    }
    
    let filtered = dentists

    // Search filter
    if (debouncedSearchTerm) {
      filtered = filtered.filter(dentist => {
        const fullName = `${dentist.firstName} ${dentist.lastName}`.toLowerCase()
        const licenseNumber = dentist.licenseNumber?.toLowerCase() || ''
        const email = dentist.userId?.email?.toLowerCase() || ''
        const searchLower = debouncedSearchTerm.toLowerCase()
        
        // Check specializations safely
        const specializationMatch = dentist.specialization && Array.isArray(dentist.specialization) 
          ? dentist.specialization.some(spec => spec.toLowerCase().includes(searchLower))
          : false
        
        return fullName.includes(searchLower) ||
               licenseNumber.includes(searchLower) ||
               specializationMatch ||
               email.includes(searchLower)
      })
    }

    // Specialization filter
    if (filterSpecialization) {
      filtered = filtered.filter(dentist => 
        dentist.specialization && Array.isArray(dentist.specialization) &&
        dentist.specialization.includes(filterSpecialization)
      )
    }

    // Status filter (based on user status)
    if (filterStatus) {
      filtered = filtered.filter(dentist => 
        dentist.userId?.status === filterStatus
      )
    }

    setFilteredDentists(filtered)
    if (!isFirstLoad) {
      setFiltering(false)
    }
  }, [dentists, debouncedSearchTerm, filterSpecialization, filterStatus, isFirstLoad])

  const handleAddDentist = () => {
    setSelectedDentist(null)
    setIsModalOpen(true)
  }

  const handleEditDentist = (dentist) => {
    setSelectedDentist(dentist)
    setIsModalOpen(true)
  }

  const handleViewDentist = (dentist) => {
    setDentistToView(dentist)
    setShowDetailsModal(true)
  }

  // Note: Only admin can approve dentists. Clinic can only toggle active/deactivated status.

  const handleToggleStatus = (dentist) => {
    const currentStatus = dentist.userId?.status
    const action = currentStatus === 'ACTIVE' ? 'deactivate' : 'activate'
    
    setDentistToToggle(dentist)
    setConfirmAction(action)
    setShowConfirmModal(true)
  }

  const executeToggleStatus = async () => {
    const dentist = dentistToToggle
    const action = confirmAction

    try {
      setError(null)
      const response = await dentistsAPI.toggleStatus(dentist._id)
      if (response && response.success) {
        // Refresh the list to update status
        await loadDentists(true)
        setShowConfirmModal(false)
        setDentistToToggle(null)
        setConfirmAction(null)
      } else {
        setError(response?.message || `Failed to ${action} dentist`)
        setShowConfirmModal(false)
      }
    } catch (error) {
      console.error(`Error ${action}ing dentist:`, error)
      const errorMessage = error.response?.data?.message || error.message || `Failed to ${action} dentist. Please try again.`
      setError(errorMessage)
      setShowConfirmModal(false)
    }
  }

  const handleModalSave = async (dentistData) => {
    try {
      setError(null)
      
      if (selectedDentist) {
        // Edit existing dentist
        const updateData = {
          userData: {
            email: dentistData.email,
            phone: dentistData.phone,
            ...(dentistData.password && { password: dentistData.password })
          },
          dentistData: {
            firstName: dentistData.firstName,
            lastName: dentistData.lastName,
            licenseNumber: dentistData.licenseNumber,
            specialization: dentistData.specialization,
            birthDate: dentistData.birthDate,
            gender: dentistData.gender,
            city: dentistData.city,
            appointmentDuration: dentistData.appointmentDuration,
            workingHours: dentistData.workingHours,
            socialLinks: dentistData.socialLinks
          }
        }
        
        const response = await dentistsAPI.update(selectedDentist._id, updateData)
        if (response.success) {
          setDentists(prev => prev.map(d => 
            d._id === selectedDentist._id ? response.data : d
          ))
          setIsModalOpen(false)
          setSelectedDentist(null)
          // Refresh to update stats
          loadDentists(true)
        } else {
          setError(response.message || 'Failed to update dentist')
        }
      } else {
        // Add new dentist
        console.log('📤 Sending dentist creation request:', dentistData)
        const response = await dentistsAPI.create(dentistData)
        console.log('📥 Response from server:', response)
        if (response.success) {
          // Map the new dentist data to match the structure
          const newDentist = {
            ...response.data,
            _id: response.data.userId,
            userId: response.data.user
          }
          setDentists(prev => [newDentist, ...prev])
          setIsModalOpen(false)
          alert('Dentist request sent successfully. Status: PENDING - Awaiting admin approval.')
          // Refresh to update stats
          loadDentists(true)
        } else {
          console.error('❌ Server returned error:', response.message)
          setError(response.message || 'Failed to create dentist request')
        }
      }
    } catch (error) {
      console.error('❌ Error saving dentist:', error)
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to save dentist. Please try again.'
      setError(errorMessage)
    }
  }

  // Component configurations
  const statsConfig = [
    {
      label: 'Total Dentists',
      value: stats.total,
      icon: FaUserMd,
      gradient: 'from-teal-600 to-cyan-600',
      cols: 1
    },
    {
      label: 'Active',
      value: stats.active,
      icon: FaCheckCircle,
      gradient: 'from-green-600 to-green-700',
      cols: 1
    },
    {
      label: 'Pending',
      value: stats.pending,
      icon: FaClock,
      gradient: 'from-orange-500 to-orange-600',
      cols: 1
    },
    {
      label: 'Rejected',
      value: stats.rejected,
      icon: FaTimesCircle,
      gradient: 'from-red-600 to-red-700',
      cols: 1
    }
  ]

  const filterProps = {
    searchTerm,
    onSearchChange: (e) => setSearchTerm(e.target.value),
    debouncedSearchTerm,
    filters: [
      {
        placeholder: 'All Specializations',
        value: filterSpecialization,
        onChange: (e) => setFilterSpecialization(e.target.value),
        options: specializations.map(spec => ({ value: spec, label: spec }))
      },
      {
        placeholder: 'All Status',
        value: filterStatus,
        onChange: (e) => setFilterStatus(e.target.value),
        options: [
          { value: 'ACTIVE', label: 'Active' },
          { value: 'PENDING', label: 'Pending Approval' },
          { value: 'REJECTED', label: 'Rejected' },
          { value: 'DEACTIVATED', label: 'Inactive' }
        ]
      }
    ],
    onClearFilters: () => {
      setSearchTerm('')
      setDebouncedSearchTerm('')
      setFilterSpecialization('')
      setFilterStatus('')
    },
    filtering,
    searchPlaceholder: 'Search dentists...'
  }

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Table columns configuration
  const columns = [
    { key: 'dentist', label: 'Dentist' },
    { key: 'license', label: 'License & Specialization' },
    { key: 'contact', label: 'Contact' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' }
  ]

  // Render table row
  const renderRow = (dentist) => (
    <tr key={dentist._id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-600 to-cyan-600 flex items-center justify-center">
            <FaUserMd className="w-5 h-5 text-white" />
          </div>
          <div className="ml-3">
            <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Dr. {dentist.firstName} {dentist.lastName}
            </div>
            <div className={`text-xs flex items-center gap-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <FaMapMarkerAlt className="w-3 h-3" />
              {dentist.city}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className={`text-sm font-medium flex items-center gap-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <FaCertificate className="w-3 h-3 text-teal-500" />
          {dentist.licenseNumber}
        </div>
        <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <div className="flex items-center gap-1">
            <FaGraduationCap className="w-3 h-3" />
            {dentist.specialization && dentist.specialization.length > 0 ? (
              <>
                {dentist.specialization.slice(0, 2).join(', ')}
                {dentist.specialization.length > 2 && (
                  <span className="text-xs">+{dentist.specialization.length - 2}</span>
                )}
              </>
            ) : (
              'No specialization'
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className={`text-sm flex items-center gap-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          <FaEnvelope className="w-3 h-3 text-gray-400" />
          {dentist.userId?.email || 'N/A'}
        </div>
        <div className={`text-xs mt-1 flex items-center gap-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <FaPhone className="w-3 h-3 text-gray-400" />
          {dentist.userId?.phone || 'N/A'}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge 
          status={
            dentist.userId?.status === 'ACTIVE' ? 'active' : 
            dentist.userId?.status === 'PENDING' ? 'pending' : 
            dentist.userId?.status === 'REJECTED' ? 'rejected' :
            dentist.userId?.status === 'DEACTIVATED' ? 'inactive' : 
            'inactive'
          }
          activeIcon={FaCheckCircle}
          inactiveIcon={dentist.userId?.status === 'PENDING' ? FaClock : FaTimesCircle}
          activeLabel="Active"
          inactiveLabel={
            dentist.userId?.status === 'PENDING' ? 'Pending' : 
            dentist.userId?.status === 'REJECTED' ? 'Rejected' :
            'Inactive'
          }
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <ActionButtons
          actions={[
            {
              icon: FaEye,
              onClick: () => handleViewDentist(dentist),
              title: 'View Details',
              variant: 'default',
              key: 'view'
            },
            // Only show edit and toggle for ACTIVE and DEACTIVATED dentists (not PENDING or REJECTED)
            ...(dentist.userId?.status === 'ACTIVE' || dentist.userId?.status === 'DEACTIVATED' ? [
              {
                icon: FaEdit,
                onClick: () => handleEditDentist(dentist),
                title: 'Edit',
                variant: 'default',
                key: 'edit'
              },
              {
                icon: dentist.userId?.status === 'ACTIVE' ? FaTimesCircle : FaCheckCircle,
                onClick: () => handleToggleStatus(dentist),
                title: dentist.userId?.status === 'ACTIVE' ? 'Deactivate' : 'Activate',
                variant: dentist.userId?.status === 'ACTIVE' ? 'warning' : 'success',
                key: 'toggle'
              }
            ] : [])
          ]}
        />
      </td>
    </tr>
  )

  const tableProps = {
    columns,
    data: filteredDentists,
    renderRow,
    loading: filtering,
    emptyMessage: searchTerm || filterSpecialization || filterStatus
      ? 'No dentists found matching your filters. Try adjusting your search criteria.'
      : 'No dentists added yet. Click "Request New Dentist" to get started.',
    emptyIcon: FaUserMd
  }

  // Dentist Details Modal Component
  const DentistDetailsModal = ({ dentist, onClose }) => {
    if (!dentist) return null

    const calculateAge = (dateOfBirth) => {
      if (!dateOfBirth) return 'N/A'
      const today = new Date()
      const birthDate = new Date(dateOfBirth)
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      return age
    }

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
                    <FaUserMd className="w-12 h-12 text-teal-600" />
                  </div>
                  {/* Status indicator on avatar */}
                  <div className={`absolute bottom-1 right-1 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center ${
                    dentist.userId?.status === 'ACTIVE' ? 'bg-green-500' : 
                    dentist.userId?.status === 'PENDING' ? 'bg-yellow-500' : 
                    dentist.userId?.status === 'REJECTED' ? 'bg-red-500' :
                    'bg-gray-500'
                  }`}>
                    {dentist.userId?.status === 'ACTIVE' ? (
                      <FaCheckCircle className="w-3 h-3 text-white" />
                    ) : dentist.userId?.status === 'PENDING' ? (
                      <FaClock className="w-3 h-3 text-white" />
                    ) : (
                      <FaTimesCircle className="w-3 h-3 text-white" />
                    )}
                  </div>
                </div>
                
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-1">
                    Dr. {dentist.firstName} {dentist.lastName}
                  </h2>
                  <p className="text-teal-100 text-sm mb-2">
                    {dentist.specialization && dentist.specialization.length > 0 
                      ? dentist.specialization[0] 
                      : 'General Dentistry'}
                  </p>
                  <StatusBadge 
                    status={
                      dentist.userId?.status === 'ACTIVE' ? 'active' : 
                      dentist.userId?.status === 'PENDING' ? 'pending' : 
                      dentist.userId?.status === 'REJECTED' ? 'rejected' :
                      'inactive'
                    }
                    activeIcon={FaCheckCircle}
                    inactiveIcon={dentist.userId?.status === 'PENDING' ? FaClock : FaTimesCircle}
                    activeLabel="Active"
                    inactiveLabel={
                      dentist.userId?.status === 'PENDING' ? 'Pending' : 
                      dentist.userId?.status === 'REJECTED' ? 'Rejected' :
                      'Inactive'
                    }
                  />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    <FaUserMd className="w-5 h-5 text-teal-600" />
                    Personal Information
                  </h3>
                  <div className={`grid grid-cols-2 gap-4 p-4 rounded-lg ${
                    isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}>
                    <div>
                      <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        First Name
                      </p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {dentist.firstName}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Last Name
                      </p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {dentist.lastName}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Gender
                      </p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {dentist.gender ? dentist.gender.charAt(0).toUpperCase() + dentist.gender.slice(1) : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Birth Date & Age
                      </p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {dentist.birthDate ? `${formatDate(dentist.birthDate)} (${calculateAge(dentist.birthDate)} years)` : 'N/A'}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        City
                      </p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {dentist.city || 'N/A'}
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
                          {dentist.userId?.email || 'N/A'}
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
                          {dentist.userId?.phone || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div>
                  <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    <FaCertificate className="w-5 h-5 text-teal-600" />
                    Professional Information
                  </h3>
                  <div className={`grid grid-cols-1 gap-4 p-4 rounded-lg ${
                    isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}>
                    <div>
                      <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        License Number
                      </p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {dentist.licenseNumber || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Specializations
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {dentist.specialization && dentist.specialization.length > 0 ? (
                          dentist.specialization.map((spec, index) => (
                            <span
                              key={index}
                              className={`px-3 py-1 rounded-full text-sm font-medium ${
                                isDarkMode ? 'bg-teal-900/20 text-teal-400 border border-teal-800' : 'bg-teal-100 text-teal-700 border border-teal-200'
                              }`}
                            >
                              {spec}
                            </span>
                          ))
                        ) : (
                          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            General Dentistry
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Appointment Duration
                      </p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {dentist.appointmentDuration || 30} minutes
                      </p>
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                {dentist.address && (
                  <div>
                    <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      <FaMapMarkerAlt className="w-5 h-5 text-teal-600" />
                      Address
                    </h3>
                    <div className={`p-4 rounded-lg ${
                      isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                    }`}>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {dentist.address}
                      </p>
                    </div>
                  </div>
                )}

                {/* Working Hours */}
                {dentist.workingHours && dentist.workingHours.length > 0 && (
                  <div>
                    <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      <FaClock className="w-5 h-5 text-teal-600" />
                      Working Hours
                    </h3>
                    <div className={`space-y-2 p-4 rounded-lg ${
                      isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                    }`}>
                      {dentist.workingHours.map((schedule, index) => (
                        <div key={index} className={`flex justify-between items-center p-3 rounded-lg ${
                          isDarkMode ? 'bg-gray-600' : 'bg-white'
                        }`}>
                          <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {schedule.day}
                          </span>
                          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {schedule.startTime} - {schedule.endTime}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Social Links */}
                {dentist.socialLinks && Object.keys(dentist.socialLinks).some(key => dentist.socialLinks[key]) && (
                  <div>
                    <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      <FaGlobe className="w-5 h-5 text-teal-600" />
                      Social Media & Links
                    </h3>
                    <div className={`space-y-3 p-4 rounded-lg ${
                      isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                    }`}>
                      {dentist.socialLinks.facebook && (
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            isDarkMode ? 'bg-gray-600' : 'bg-white'
                          }`}>
                            <FaFacebook className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Facebook
                            </p>
                            <a
                              href={dentist.socialLinks.facebook}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`text-sm hover:underline ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}
                            >
                              {dentist.socialLinks.facebook}
                            </a>
                          </div>
                        </div>
                      )}
                      {dentist.socialLinks.instagram && (
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            isDarkMode ? 'bg-gray-600' : 'bg-white'
                          }`}>
                            <FaInstagram className="w-4 h-4 text-pink-600" />
                          </div>
                          <div className="flex-1">
                            <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Instagram
                            </p>
                            <a
                              href={dentist.socialLinks.instagram}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`text-sm hover:underline ${isDarkMode ? 'text-pink-400' : 'text-pink-600'}`}
                            >
                              {dentist.socialLinks.instagram}
                            </a>
                          </div>
                        </div>
                      )}
                      {dentist.socialLinks.linkedin && (
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            isDarkMode ? 'bg-gray-600' : 'bg-white'
                          }`}>
                            <FaLinkedin className="w-4 h-4 text-blue-700" />
                          </div>
                          <div className="flex-1">
                            <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              LinkedIn
                            </p>
                            <a
                              href={dentist.socialLinks.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`text-sm hover:underline ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}
                            >
                              {dentist.socialLinks.linkedin}
                            </a>
                          </div>
                        </div>
                      )}
                      {dentist.socialLinks.twitter && (
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            isDarkMode ? 'bg-gray-600' : 'bg-white'
                          }`}>
                            <FaTwitter className="w-4 h-4 text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Twitter
                            </p>
                            <a
                              href={dentist.socialLinks.twitter}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`text-sm hover:underline ${isDarkMode ? 'text-blue-300' : 'text-blue-400'}`}
                            >
                              {dentist.socialLinks.twitter}
                            </a>
                          </div>
                        </div>
                      )}
                      {dentist.socialLinks.website && (
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            isDarkMode ? 'bg-gray-600' : 'bg-white'
                          }`}>
                            <FaGlobe className="w-4 h-4 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Website
                            </p>
                            <a
                              href={dentist.socialLinks.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`text-sm hover:underline ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}
                            >
                              {dentist.socialLinks.website}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Account Information */}
                <div>
                  <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    <FaCheckCircle className="w-5 h-5 text-teal-600" />
                    Account Information
                  </h3>
                  <div className={`grid grid-cols-2 gap-4 p-4 rounded-lg ${
                    isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}>
                    <div>
                      <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Account Status
                      </p>
                      <StatusBadge 
                        status={
                          dentist.userId?.status === 'ACTIVE' ? 'active' : 
                          dentist.userId?.status === 'PENDING' ? 'pending' : 
                          dentist.userId?.status === 'REJECTED' ? 'rejected' :
                          'inactive'
                        }
                        activeIcon={FaCheckCircle}
                        inactiveIcon={dentist.userId?.status === 'PENDING' ? FaClock : FaTimesCircle}
                        activeLabel="Active"
                        inactiveLabel={
                          dentist.userId?.status === 'PENDING' ? 'Pending' : 
                          dentist.userId?.status === 'REJECTED' ? 'Rejected' :
                          'Inactive'
                        }
                      />
                    </div>
                    <div>
                      <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Joined Date
                      </p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {dentist.userId?.createdAt ? formatDate(dentist.userId.createdAt) : 'N/A'}
                      </p>
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
      <PageHeader
        title="Dentists Management"
        description="Manage dentist requests and profiles for your clinic"
        action={{
          label: 'Request New Dentist',
          onClick: handleAddDentist,
          icon: FaPlus,
          gradient: 'from-teal-600 to-cyan-600'
        }}
      />

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-400">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
            <div className="ml-auto">
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      <StatsOverview stats={statsConfig} />

      {/* Search and Filters */}
      <FilterBar {...filterProps} />

      {/* Dentists Table */}
      <DataTable {...tableProps} />

      {/* Dentist Modal */}
      <DentistModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedDentist(null)
        }}
        onSave={handleModalSave}
        dentist={selectedDentist}
      />

      {/* Dentist Details Modal */}
      {showDetailsModal && (
        <DentistDetailsModal
          dentist={dentistToView}
          onClose={() => {
            setShowDetailsModal(false)
            setDentistToView(null)
          }}
        />
      )}

      {/* Confirmation Modal for Toggle Status */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false)
          setDentistToToggle(null)
          setConfirmAction(null)
        }}
        onConfirm={executeToggleStatus}
        item={dentistToToggle}
        action={confirmAction}
        itemName={dentistToToggle ? `Dr. ${dentistToToggle.firstName} ${dentistToToggle.lastName}` : ''}
        itemType="Dentist"
      />
    </div>
  )
}

export default DentistsManagement