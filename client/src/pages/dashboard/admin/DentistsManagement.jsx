import { useState, useEffect, useMemo } from 'react'
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
  ConfirmationModal,
  DentistDetailsModal,
  Toast
} from '../../../components'
import { useTheme } from '../../../contexts/ThemeContext'
import { dentistsAPI } from '../../../services/api'
import { CITY_OPTIONS_LOWERCASE, DENTAL_SPECIALIZATIONS_OPTIONS, STATUS_OPTIONS } from '../../../utils/constants'
import { useDebounce } from '../../../hooks'
import { formatDate as formatDateHelper, getImageUrl } from '../../../utils/helpers'

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
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const [toast, setToast] = useState(null)
  const [stats, setStats] = useState({
    total: '-',
    pending: '-',
    active: '-'
  })
  const [error, setError] = useState(null)

  // Fetch dentists with all statuses for admin
  const fetchDentists = async (isFiltering = false) => {
    try {
      if (isFiltering) {
        setFiltering(true)
      } else {
        setLoading(true)
      }
      
      setError(null)
      
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
        console.log('Dentists loaded:', response.data?.length || 0)
        setDentists(response.data)
        setTotalPages(response.pagination?.pages || 1)
        setCurrentPage(response.pagination?.page || 1)
      } else {
        setError('Failed to load dentists. Please try again.')
      }
    } catch (error) {
      console.error('❌ Error fetching dentists:', error)
      setError('Failed to load dentists. Please try again.')
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

  // Reject dentist - opens confirmation modal
  const handleRejectDentist = (dentist) => {
    setDentistToAction(dentist)
    setConfirmAction('reject')
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
        response = await dentistsAPI.approve(dentist.userId)
      } else if (action === 'reject') {
        response = await dentistsAPI.reject(dentist.userId, 'Rejected by admin')
      } else if (action === 'activate' || action === 'deactivate') {
        response = await dentistsAPI.toggleStatus(dentist.userId)
      }

      if (response && response.success) {
        // Refresh the list and stats
        await Promise.all([fetchDentists(true), fetchStats()])
        setShowConfirmModal(false)
        setDentistToAction(null)
        setConfirmAction(null)
        setToast({ message: `Dentist ${action}d successfully`, type: 'success' })
      } else {
        setToast({ message: response?.message || `Failed to ${action} dentist`, type: 'error' })
        setShowConfirmModal(false)
      }
    } catch (error) {
      console.error(`Error ${action}ing dentist:`, error)
      setToast({ message: `Failed to ${action} dentist`, type: 'error' })
      setShowConfirmModal(false)
    }
  }

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

  // Stats configuration - use useMemo for performance
  const statsConfig = useMemo(() => [
    {
      label: 'Total Dentists',
      value: loading ? '-' : stats.total,
      icon: FaUserMd,
      gradient: 'from-teal-600 to-cyan-600',
      cols: 1
    },
    {
      label: 'Pending Approval',
      value: loading ? '-' : stats.pending,
      icon: FaClock,
      gradient: 'from-orange-500 to-orange-600',
      cols: 1
    },
    {
      label: 'Active Dentists',
      value: loading ? '-' : stats.active,
      icon: FaCheckCircle,
      gradient: 'from-green-600 to-green-700',
      cols: 1
    }
  ], [stats, loading])

  // Filter configuration - use useMemo for performance
  const filterProps = useMemo(() => ({
    searchTerm,
    onSearchChange: (e) => setSearchTerm(e.target.value),
    debouncedSearchTerm,
    filters: [
      {
        placeholder: 'All Statuses',
        value: filterStatus,
        onChange: (e) => setFilterStatus(e.target.value),
        options: STATUS_OPTIONS
      },
      {
        placeholder: 'All Cities',
        value: filterCity,
        onChange: (e) => setFilterCity(e.target.value),
        options: CITY_OPTIONS_LOWERCASE
      },
      {
        placeholder: 'All Specializations',
        value: filterSpecialization,
        onChange: (e) => setFilterSpecialization(e.target.value),
        options: DENTAL_SPECIALIZATIONS_OPTIONS
      }
    ],
    onClearFilters: () => {
      setSearchTerm('')
      setFilterCity('')
      setFilterStatus('')
      setFilterSpecialization('')
      setCurrentPage(1)
    },
    filtering,
    searchPlaceholder: 'Search dentists by name, license, or email...'
  }), [searchTerm, debouncedSearchTerm, filterStatus, filterCity, filterSpecialization, filtering])

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
                src={getImageUrl(dentist.user.profileImage)}
                alt={`${dentist.firstName} ${dentist.lastName}`}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.querySelector('.fallback-avatar').style.display = 'flex';
                }}
              />
            ) : null}
            <div className={`h-10 w-10 rounded-full flex items-center justify-center fallback-avatar ${dentist.user?.profileImage ? 'hidden' : ''} ${
                isDarkMode 
                  ? 'bg-gradient-to-br from-teal-600 to-cyan-600' 
                  : 'bg-gradient-to-br from-teal-500 to-cyan-500'
              }`}>
              <FaUserMd className="text-white text-lg" />
            </div>
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
          status={
            dentist.user?.status === 'PENDING' ? 'pending' : 
            dentist.user?.status === 'ACTIVE' ? 'active' : 
            dentist.user?.status === 'REJECTED' ? 'rejected' :
            dentist.user?.status === 'DEACTIVATED' ? 'inactive' : 
            'inactive'
          } 
        />
      </td>

      {/* Registration Date */}
      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        {formatDateHelper(dentist.user?.createdAt)}
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
                onClick: () => handleApproveDentist(dentist),
                title: 'Approve',
                variant: 'success',
                key: 'approve'
              },
              {
                icon: FaTimes,
                onClick: () => handleRejectDentist(dentist),
                title: 'Reject',
                variant: 'danger',
                key: 'reject'
              }
            ] : []),
            // Show approve for REJECTED dentists
            ...(dentist.user?.status === 'REJECTED' ? [
              {
                icon: FaCheck,
                onClick: () => handleApproveDentist(dentist),
                title: 'Approve',
                variant: 'success',
                key: 'approve'
              }
            ] : []),
            // Show activate/deactivate for ACTIVE/DEACTIVATED dentists
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

  // Using the reusable DentistDetailsModal component from components folder

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
      <DentistDetailsModal
        isOpen={showDetailsModal}
        dentistData={selectedDentist}
        onClose={() => {
          setShowDetailsModal(false)
          setSelectedDentist(null)
        }}
      />

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

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}

export default DentistsManagement