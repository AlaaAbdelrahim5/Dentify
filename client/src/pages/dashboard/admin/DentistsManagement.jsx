import { useState, useEffect, useRef } from 'react'
import { 
  FaUserMd, 
  FaPlus, 
  FaEdit, 
  FaSearch, 
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
  FaGraduationCap,
  FaBan
} from 'react-icons/fa'
import { 
  Card, 
  Button, 
  LoadingSpinner,
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
import { dentistsAPI } from '../../../services/api'

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
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null)
  const [dentistToAction, setDentistToAction] = useState(null)
  const searchTimeoutRef = useRef(null)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    active: 0
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
    { value: 'PENDING', label: 'Pending Approval' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'DEACTIVATED', label: 'Deactivated' }
  ]

  // Fetch dentists with all statuses for admin
  const fetchDentists = async (isFiltering = false) => {
    try {
      if (isFiltering) {
        setFiltering(true)
      } else {
        setLoading(true)
      }
      
      const params = {
        page: currentPage.toString(),
        limit: '10',
        includeAll: 'true', // Include all statuses for admin
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
        ...(filterCity && { city: filterCity }),
        ...(filterStatus && { status: filterStatus }),
        ...(filterSpecialization && { specialization: filterSpecialization })
      }

      const queryString = new URLSearchParams(params).toString()
      const response = await dentistsAPI.getAll(queryString)

      if (response.success && response.data) {
        setDentists(response.data)
        setTotalPages(response.pagination?.pages || 1)
        setCurrentPage(response.pagination?.page || 1)
      }
    } catch (error) {
      console.error('❌ Error fetching dentists:', error)
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
      const response = await dentistsAPI.getStats()

      if (response.success || response.data) {
        setStats({
          total: response.data.total || 0,
          pending: response.data.pending || 0,
          active: response.data.active || 0
        })
      }
    } catch (error) {
      console.error('Error fetching dentist stats:', error)
    }
  }

  // Approve dentist - opens confirmation modal
  const handleApproveDentist = (dentist) => {
    setDentistToAction(dentist)
    setConfirmAction('approve')
    setShowConfirmModal(true)
  }

  // Toggle dentist status (activate/deactivate) - opens confirmation modal
  const handleToggleStatus = (dentist) => {
    const action = dentist.user?.status === 'ACTIVE' ? 'deactivate' : 'activate'
    setDentistToAction(dentist)
    setConfirmAction(action)
    setShowConfirmModal(true)
  }

  // Execute the confirmation action
  const executeAction = async () => {
    const dentist = dentistToAction
    const action = confirmAction

    try {
      let response

      if (action === 'approve') {
        response = await dentistsAPI.approve(dentist._id)
      } else if (action === 'activate' || action === 'deactivate') {
        response = await dentistsAPI.toggleStatus(dentist._id)
      }

      if (response && response.success) {
        // Refresh the list and stats
        await Promise.all([fetchDentists(true), fetchStats()])
        setShowConfirmModal(false)
        setDentistToAction(null)
        setConfirmAction(null)
      } else {
        alert(response?.message || `Failed to ${action} dentist`)
        setShowConfirmModal(false)
      }
    } catch (error) {
      console.error(`Error ${action}ing dentist:`, error)
      alert(`Failed to ${action} dentist`)
      setShowConfirmModal(false)
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
    setCurrentPage(1)
    fetchDentists(true)
  }, [debouncedSearchTerm, filterCity, filterStatus, filterSpecialization])

  // Fetch data when page changes
  useEffect(() => {
    fetchDentists(false)
  }, [currentPage])

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchDentists(), fetchStats()])
    }
    loadData()
  }, [])

  // Format helpers
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Stats configuration
  const statsConfig = [
    {
      label: 'Total Dentists',
      value: stats.total,
      icon: FaUserMd,
      gradient: 'from-teal-600 to-cyan-600',
      cols: 1
    },
    {
      label: 'Pending Approval',
      value: stats.pending,
      icon: FaClock,
      gradient: 'from-orange-500 to-orange-600',
      cols: 1
    },
    {
      label: 'Active Dentists',
      value: stats.active,
      icon: FaCheckCircle,
      gradient: 'from-green-600 to-green-700',
      cols: 1
    }
  ]

  // Filter configuration
  const filterProps = {
    searchTerm,
    onSearchChange: (e) => setSearchTerm(e.target.value),
    debouncedSearchTerm,
    filters: [
      {
        placeholder: 'All Statuses',
        value: filterStatus,
        onChange: (e) => setFilterStatus(e.target.value),
        options: statusOptions
      },
      {
        placeholder: 'All Cities',
        value: filterCity,
        onChange: (e) => setFilterCity(e.target.value),
        options: cities
      },
      {
        placeholder: 'All Specializations',
        value: filterSpecialization,
        onChange: (e) => setFilterSpecialization(e.target.value),
        options: specializations
      }
    ],
    onClearFilters: () => {
      setSearchTerm('')
      setDebouncedSearchTerm('')
      setFilterCity('')
      setFilterStatus('')
      setFilterSpecialization('')
      setCurrentPage(1)
    },
    filtering,
    searchPlaceholder: 'Search dentists by name, license, or email...'
  }

  // Table columns
  const columns = [
    { key: 'dentist', label: 'Dentist' },
    { key: 'license', label: 'License & Specialization' },
    { key: 'clinic', label: 'Clinic & Location' },
    { key: 'status', label: 'Status' },
    { key: 'registration', label: 'Registration Date' },
    { key: 'actions', label: 'Actions' }
  ]

  // Render table row
  const renderRow = (dentist) => (
    <tr key={dentist.userId} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
      {/* Dentist Info */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            {dentist.user?.profileImage ? (
              <img
                className="h-10 w-10 rounded-full object-cover"
                src={dentist.user.profileImage}
                alt={`${dentist.firstName} ${dentist.lastName}`}
              />
            ) : (
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                isDarkMode 
                  ? 'bg-gradient-to-br from-teal-600 to-cyan-600' 
                  : 'bg-gradient-to-br from-teal-500 to-cyan-500'
              }`}>
                <FaUserMd className="text-white text-lg" />
              </div>
            )}
          </div>
          <div className="ml-4">
            <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
              Dr. {dentist.firstName} {dentist.lastName}
            </div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {dentist.user?.email || 'N/A'}
            </div>
          </div>
        </div>
      </td>

      {/* License & Specialization */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
          {dentist.licenseNumber}
        </div>
        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {Array.isArray(dentist.specialization) ? dentist.specialization.join(', ') : dentist.specialization}
        </div>
      </td>

      {/* Clinic & Location */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
          {dentist.clinic?.clinicName || 'N/A'}
        </div>
        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {dentist.city || 'N/A'}
        </div>
      </td>

      {/* Status */}
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge 
          status={dentist.user?.status === 'PENDING' ? 'pending' : dentist.user?.status === 'ACTIVE' ? 'active' : 'inactive'} 
        />
      </td>

      {/* Registration Date */}
      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        {formatDate(dentist.user?.createdAt)}
      </td>

      {/* Actions */}
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <ActionButtons
          actions={[
            {
              icon: FaEye,
              onClick: () => {
                setSelectedDentist(dentist)
                setShowDetailsModal(true)
              },
              title: 'View Details',
              variant: 'default',
              key: 'view'
            },
            // Show approve/reject for PENDING dentists
            ...(dentist.user?.status === 'PENDING' ? [
              {
                icon: FaCheck,
                onClick: () => handleApproveDentist(dentist, 'approve'),
                title: 'Approve',
                variant: 'success',
                key: 'approve'
              },
              {
                icon: FaTimes,
                onClick: () => handleApproveDentist(dentist, 'reject'),
                title: 'Reject',
                variant: 'danger',
                key: 'reject'
              }
            ] : []),
            // Show activate/deactivate for non-PENDING dentists
            ...(dentist.user?.status === 'ACTIVE' ? [
              {
                icon: FaBan,
                onClick: () => handleToggleStatus(dentist),
                title: 'Deactivate',
                variant: 'warning',
                key: 'deactivate'
              }
            ] : []),
            ...(dentist.user?.status === 'DEACTIVATED' ? [
              {
                icon: FaCheckCircle,
                onClick: () => handleToggleStatus(dentist),
                title: 'Activate',
                variant: 'success',
                key: 'activate'
              }
            ] : [])
          ]}
        />
      </td>
    </tr>
  )

  const DentistDetailsModal = ({ dentist, onClose }) => {
    if (!dentist) return null

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
            className={`relative rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col ${
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
                  <FaUserMd className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Dr. {dentist.firstName} {dentist.lastName}
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

          {/* Form Container with Scroll */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
            {/* Status and Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <StatusBadge 
                  status={dentist.status === 'PENDING' ? 'pending' : dentist.status === 'ACTIVE' ? 'active' : 'inactive'} 
                />
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Registered on {formatDate(dentist.createdAt)}
                </span>
              </div>
              <div className="flex gap-2">
                {dentist.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => {
                        onClose()
                        handleApproveDentist(dentist, 'approve')
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors"
                    >
                      <FaCheck className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        onClose()
                        handleApproveDentist(dentist, 'reject')
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                    >
                      <FaTimes className="w-4 h-4" />
                      Reject
                    </button>
                  </>
                )}
                {dentist.status === 'ACTIVE' && (
                  <button
                    onClick={() => {
                      onClose()
                      handleToggleStatus(dentist)
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                  >
                    <FaTimes className="w-4 h-4" />
                    Deactivate
                  </button>
                )}
                {dentist.status === 'DEACTIVATED' && (
                  <button
                    onClick={() => {
                      onClose()
                      handleToggleStatus(dentist)
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors"
                  >
                    <FaCheck className="w-4 h-4" />
                    Activate
                  </button>
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
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                      Dr. {dentist.firstName} {dentist.lastName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Email:</span>
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{dentist.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Phone:</span>
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{dentist.phoneNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Gender:</span>
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                      {dentist.gender?.charAt(0).toUpperCase() + dentist.gender?.slice(1) || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Birth Date:</span>
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                      {dentist.birthDate ? formatDate(dentist.birthDate) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>City:</span>
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{dentist.city || 'N/A'}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h3 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  <FaCertificate className="w-4 h-4 text-teal-600" />
                  Professional Information
                </h3>
                <div className="space-y-2">
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
                      Specialization
                    </span>
                    <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {dentist.specialization || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className={`block text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Years of Experience
                    </span>
                    <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {dentist.yearsOfExperience || 'N/A'} years
                    </span>
                  </div>
                </div>
              </Card>
            </div>

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
                  {dentist.clinic.city && (
                    <div className="flex justify-between">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Location:</span>
                      <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{dentist.clinic.city}</span>
                    </div>
                  )}
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Dentist Management"
        subtitle="Review and approve dentist registrations"
        icon={FaUserMd}
      />

      {/* Statistics */}
      <StatsOverview stats={statsConfig} />

      {/* Filters */}
      <FilterBar {...filterProps} />

      {/* Data Table */}
      <DataTable
        data={dentists}
        columns={columns}
        renderRow={renderRow}
        loading={filtering}
        emptyMessage="No dentists found"
        emptyIcon={FaUserMd}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

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

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false)
          setConfirmAction(null)
          setDentistToAction(null)
        }}
        onConfirm={executeAction}
        item={dentistToAction}
        action={confirmAction}
        itemName={dentistToAction ? `Dr. ${dentistToAction.firstName} ${dentistToAction.lastName}` : ''}
        itemType="dentist"
      />
    </div>
  )
}

export default DentistsManagement