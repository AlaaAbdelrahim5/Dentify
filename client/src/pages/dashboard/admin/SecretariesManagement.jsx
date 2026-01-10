import { useMemo, useState } from 'react'
import { 
  FaUserTie, 
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaBan,
  FaCheck,
  FaTimes,
  FaClock
} from 'react-icons/fa'
import { 
  Card,
  PageHeader,
  FilterBar,
  DataTable,
  Pagination,
  StatusBadge,
  ActionButtons,
  ConfirmationModal,
  SecretaryDetailsModal,
  Toast
} from '../../../components'
import { useTheme } from '../../../contexts/ThemeContext'
import { secretariesAPI } from '../../../services/api'
import { CITY_OPTIONS, STATUS_OPTIONS } from '../../../utils/constants'
import { formatDate as formatDateHelper, calculateAge, getImageUrl } from '../../../utils/helpers'
import { useManagementPage } from '../../../hooks'

const SecretariesManagement = () => {
  const { isDarkMode } = useTheme()
  
  // Additional filters not handled by base hook
  const [filterCity, setFilterCity] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterGender, setFilterGender] = useState('')

  // Use unified management hook
  const {
    data: secretaries,
    loading,
    filtering,
    error,
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    currentPage,
    totalPages,
    goToPage,
    stats,
    showDetailsModal,
    selectedItem: selectedSecretary,
    handleViewDetails,
    closeAllModals,
    showConfirmModal,
    confirmAction,
    isProcessing,
    executeOperation,
    cancelOperation,
    confirmApprove,
    confirmReject,
    toast,
    refresh,
    hideToast
  } = useManagementPage({
    fetchFn: async (params) => {
      const extraParams = {
        ...params,
        includeAll: 'true',
        ...(filterCity && { city: filterCity }),
        ...(filterStatus && { status: filterStatus }),
        ...(filterGender && { gender: filterGender })
      }
      const queryString = new URLSearchParams(extraParams).toString()
      const response = await secretariesAPI.getAll(queryString)
      return {
        success: response.success,
        data: response.data || [],
        totalPages: response.pagination?.pages || 1
      }
    },
    fetchStatsFn: async () => await secretariesAPI.getStats(),
    api: {
      approve: (secretary) => secretariesAPI.approve(secretary.userId),
      reject: (secretary) => secretariesAPI.reject(secretary.userId, 'Rejected by admin'),
      toggleStatus: (secretary) => secretariesAPI.toggleStatus(secretary.userId)
    },
    initialStats: { total: '-', pending: '-', active: '-' },
    initialFilters: {}
  })

  // Custom action handler for toggle status
  const handleToggleStatus = (secretary) => {
    const action = secretary.userId?.status === 'ACTIVE' ? 'deactivate' : 'activate'
    executeOperation(
      async () => await secretariesAPI.toggleStatus(secretary.userId),
      { action, item: secretary }
    )
  }

  // Stats configuration
  const statsConfig = useMemo(() => [
    {
      label: 'Total Secretaries',
      value: loading ? '-' : stats.total,
      icon: FaUserTie,
      gradient: 'from-teal-600 to-cyan-600'
    },
    {
      label: 'Pending Approval',
      value: loading ? '-' : stats.pending,
      icon: FaClock,
      gradient: 'from-yellow-600 to-orange-600'
    },
    {
      label: 'Active Secretaries',
      value: loading ? '-' : stats.active,
      icon: FaCheckCircle,
      gradient: 'from-green-600 to-green-700'
    }
  ], [stats, loading])

  // Filter configuration
  const filterProps = useMemo(() => ({
    searchTerm,
    onSearchChange: (e) => setSearchTerm(e.target.value),
    debouncedSearchTerm,
    filters: [
      {
        label: 'City',
        value: filterCity,
        onChange: (e) => {
          setFilterCity(e.target.value)
          refresh()
        },
        options: CITY_OPTIONS
      },
      {
        label: 'Gender',
        value: filterGender,
        onChange: (e) => {
          setFilterGender(e.target.value)
          refresh()
        },
        options: [
          { value: 'male', label: 'Male' },
          { value: 'female', label: 'Female' }
        ]
      },
      {
        label: 'Status',
        value: filterStatus,
        onChange: (e) => {
          setFilterStatus(e.target.value)
          refresh()
        },
        options: STATUS_OPTIONS
      }
    ],
    onClearFilters: () => {
      setSearchTerm('')
      setFilterCity('')
      setFilterGender('')
      setFilterStatus('')
      refresh()
    },
    filtering,
    searchPlaceholder: 'Search secretaries by name, email, or clinic...'
  }), [searchTerm, debouncedSearchTerm, filterCity, filterGender, filterStatus, filtering, setSearchTerm, refresh])

  // Columns configuration
  const columns = [
    { key: 'secretary', label: 'Secretary' },
    { key: 'contact', label: 'Contact' },
    { key: 'clinic', label: 'Clinic & Location' },
    { key: 'gender', label: 'Gender' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' }
  ]

  // Render table row - use useMemo to prevent recreation on every render
  const renderRow = useMemo(() => (secretary) => {
    const status = secretary.userId?.status?.toUpperCase()
    const isPending = status === 'PENDING'
    const isActive = status === 'ACTIVE'
    const isRejected = status === 'REJECTED'
    const isDeactivated = status === 'DEACTIVATED'
    
    return (
      <tr key={secretary._id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
        {/* Secretary Info */}
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div className="shrink-0 h-10 w-10">
              {secretary.userId?.profileImage ? (
                <img
                  className="h-10 w-10 rounded-full object-cover"
                  src={getImageUrl(secretary.userId.profileImage)}
                  alt={`${secretary.firstName} ${secretary.lastName}`}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.querySelector('.fallback-avatar').classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-10 h-10 rounded-full bg-linear-to-r from-teal-600 to-cyan-600 flex items-center justify-center fallback-avatar ${secretary.userId?.profileImage ? 'hidden' : ''}`}>
                <FaUserTie className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                {secretary.firstName} {secretary.lastName}
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Age: {calculateAge(secretary.birthDate)}
              </div>
            </div>
          </div>
        </td>

        {/* Contact */}
        <td className="px-6 py-4 whitespace-nowrap">
          <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
            {secretary.userId?.email || 'N/A'}
          </div>
          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {secretary.userId?.phone || 'N/A'}
          </div>
        </td>

        {/* Clinic & Location */}
        <td className="px-6 py-4 whitespace-nowrap">
          <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
            {secretary.clinic?.clinicName || 'N/A'}
          </div>
          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {secretary.address?.city || secretary.city || 'N/A'}
          </div>
        </td>

        {/* Gender */}
        <td className="px-6 py-4 whitespace-nowrap">
          <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
            {secretary.gender?.charAt(0).toUpperCase() + secretary.gender?.slice(1)}
          </div>
        </td>

        {/* Status */}
        <td className="px-6 py-4 whitespace-nowrap">
          <StatusBadge 
            status={
              isPending ? 'pending' :
              isActive ? 'active' :
              isRejected ? 'rejected' :
              isDeactivated ? 'inactive' : 
              'inactive'
            } 
          />
        </td>

        {/* Actions */}
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <ActionButtons
            actions={[
              {
                icon: FaEye,
                onClick: () => handleViewDetails(secretary),
                title: 'View Details',
                variant: 'default',
                key: 'view'
              },
              // Show approve/reject for PENDING secretaries
              ...(isPending ? [
                {
                  icon: FaCheck,
                  onClick: () => confirmApprove(secretary),
                  title: 'Approve',
                  variant: 'success',
                  key: 'approve'
                },
                {
                  icon: FaTimes,
                  onClick: () => confirmReject(secretary),
                  title: 'Reject',
                  variant: 'danger',
                  key: 'reject'
                }
              ] : []),
              // Show approve for REJECTED secretaries
              ...(isRejected ? [
                {
                  icon: FaCheck,
                  onClick: () => confirmApprove(secretary),
                  title: 'Approve',
                  variant: 'success',
                  key: 'approve'
                }
              ] : []),
              // Show activate/deactivate for ACTIVE/DEACTIVATED secretaries
              ...(isActive ? [
                {
                  icon: FaBan,
                  onClick: () => handleToggleStatus(secretary),
                  title: 'Deactivate',
                  variant: 'warning',
                  key: 'deactivate'
                }
              ] : []),
              ...(isDeactivated ? [
                {
                  icon: FaCheckCircle,
                  onClick: () => handleToggleStatus(secretary),
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
  }, [isDarkMode, handleViewDetails, confirmApprove, confirmReject, handleToggleStatus])

  const tableProps = {
    columns,
    data: secretaries,
    renderRow,
    loading: loading || filtering,
    emptyMessage: searchTerm ? 'Try adjusting your search criteria' : 'No secretaries yet',
    emptyIcon: FaUserTie,
    hasFilters: !!searchTerm || !!filterCity || !!filterStatus || !!filterGender
  }

  const confirmProps = {
    isOpen: showConfirmModal,
    onClose: cancelOperation,
    onConfirm: executeOperation,
    item: selectedSecretary,
    action: confirmAction,
    itemName: selectedSecretary ? `${selectedSecretary.firstName} ${selectedSecretary.lastName}` : '',
    itemType: 'secretary',
    isProcessing
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Secretaries Management"
        description="Review and manage secretary registrations"
      />

      {/* Filters */}
      <Card className="p-4">
        <FilterBar {...filterProps} />
      </Card>

      {/* Data Table */}
      <DataTable {...tableProps} />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={goToPage}
      />

      {/* Secretary Details Modal */}
      <SecretaryDetailsModal
        isOpen={showDetailsModal}
        secretary={selectedSecretary}
        onClose={closeAllModals}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal {...confirmProps} />

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
          duration={3000}
        />
      )}
    </div>
  )
}

export default SecretariesManagement
