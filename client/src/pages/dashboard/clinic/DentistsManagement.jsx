import { useState, useEffect, useRef } from 'react'
import { 
  FaPlus, 
  FaSearch, 
  FaEdit, 
  FaTrash, 
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
  FaBan
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
  ConfirmationModal
} from '../../../components'
import DentistModal from '../../../components/clinic/DentistModal'
import DentistDetailsModal from '../../../components/clinic/DentistDetailsModal'
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
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [dentistToDelete, setDentistToDelete] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [dentistToView, setDentistToView] = useState(null)
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const searchTimeoutRef = useRef(null)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
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
        const inactive = dentistsData.filter(d => d.user?.status === 'DEACTIVATED').length
        
        setStats({ total, active, pending, inactive })
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

  const handleDeleteDentist = async (dentist) => {
    setDentistToDelete(dentist)
    setShowDeleteModal(true)
  }

  // Note: Only admin can approve dentists. Clinic can only toggle active/deactivated status.

  const handleToggleStatus = async (dentist) => {
    const currentStatus = dentist.userId?.status
    const newStatus = currentStatus === 'ACTIVE' ? 'DEACTIVATED' : 'ACTIVE'
    const action = newStatus === 'ACTIVE' ? 'activate' : 'deactivate'
    
    if (!confirm(`Are you sure you want to ${action} ${dentist.firstName} ${dentist.lastName}?`)) {
      return
    }

    try {
      setError(null)
      const response = await dentistsAPI.toggleStatus(dentist._id)
      if (response && response.success) {
        // Refresh the list to update status
        await loadDentists(true)
        alert(`Dentist ${action}d successfully!`)
      } else {
        setError(response?.message || `Failed to ${action} dentist`)
      }
    } catch (error) {
      console.error(`Error ${action}ing dentist:`, error)
      const errorMessage = error.response?.data?.message || error.message || `Failed to ${action} dentist. Please try again.`
      setError(errorMessage)
    }
  }

  const executeDelete = async () => {
    try {
      setError(null)
      const response = await dentistsAPI.delete(dentistToDelete._id)
      if (response && response.success) {
        setDentists(prev => prev.filter(d => d._id !== dentistToDelete._id))
        setShowDeleteModal(false)
        setDentistToDelete(null)
      } else {
        setError(response?.message || 'Failed to delete dentist')
        setShowDeleteModal(false)
      }
    } catch (error) {
      console.error('Error deleting dentist:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete dentist. Please try again.'
      setError(errorMessage)
      setShowDeleteModal(false)
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
            address: dentistData.address,
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
        const response = await dentistsAPI.create(dentistData)
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
          setError(response.message || 'Failed to create dentist request')
        }
      }
    } catch (error) {
      console.error('Error saving dentist:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save dentist. Please try again.'
      setError(errorMessage)
    }
  }

  // Component configurations
  const statsConfig = [
    {
      label: 'Total Dentists',
      value: stats.total,
      icon: FaUserMd,
      gradient: 'from-teal-600 to-cyan-600'
    },
    {
      label: 'Active',
      value: stats.active,
      icon: FaCheckCircle,
      gradient: 'from-green-600 to-green-700'
    },
    {
      label: 'Pending Approval',
      value: stats.pending,
      icon: FaClock,
      gradient: 'from-yellow-600 to-orange-600'
    },
    {
      label: 'Inactive',
      value: stats.inactive,
      icon: FaTimesCircle,
      gradient: 'from-red-600 to-red-700'
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
          isActive={dentist.userId?.status === 'ACTIVE'}
          activeIcon={FaCheckCircle}
          inactiveIcon={dentist.userId?.status === 'PENDING' ? FaClock : FaTimesCircle}
          activeLabel="Active"
          inactiveLabel={dentist.userId?.status === 'PENDING' ? 'Pending' : 'Inactive'}
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
            // Only show toggle for ACTIVE or DEACTIVATED (not PENDING - needs admin approval first)
            ...(dentist.userId?.status === 'ACTIVE' || dentist.userId?.status === 'DEACTIVATED' ? [{
              icon: dentist.userId?.status === 'ACTIVE' ? FaBan : FaCheckCircle,
              onClick: () => handleToggleStatus(dentist),
              title: dentist.userId?.status === 'ACTIVE' ? 'Deactivate' : 'Activate',
              variant: dentist.userId?.status === 'ACTIVE' ? 'warning' : 'success',
              key: 'toggle'
            }] : []),
            {
              icon: FaEdit,
              onClick: () => handleEditDentist(dentist),
              title: 'Edit',
              variant: 'default',
              key: 'edit'
            },
            {
              icon: FaTrash,
              onClick: () => handleDeleteDentist(dentist),
              title: 'Delete',
              variant: 'danger',
              key: 'delete'
            }
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
      <DentistDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false)
          setDentistToView(null)
        }}
        dentistData={dentistToView}
        onEdit={handleEditDentist}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setDentistToDelete(null)
        }}
        onConfirm={executeDelete}
        item={dentistToDelete}
        action="delete"
        itemName={dentistToDelete ? `Dr. ${dentistToDelete.firstName} ${dentistToDelete.lastName}` : ''}
        itemType="Dentist"
      />
    </div>
  )
}

export default DentistsManagement