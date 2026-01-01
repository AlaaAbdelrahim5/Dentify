import { useMemo, useState } from 'react'
import { 
  FaUserMd, 
  FaPlus, 
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
  FaBan
} from 'react-icons/fa'
import { 
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
import { CITY_OPTIONS, DENTAL_SPECIALIZATIONS_OPTIONS, STATUS_OPTIONS } from '../../../utils/constants'
import { useManagementPage } from '../../../hooks'
import { formatDate as formatDateHelper, getImageUrl } from '../../../utils/helpers'

const DentistsManagement = () => {
  const { isDarkMode } = useTheme()
  
  // Additional filters not handled by base hook
  const [filterCity, setFilterCity] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterSpecialization, setFilterSpecialization] = useState('')

  // Use unified management hook
  const {
    data: dentists,
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
    selectedItem: selectedDentist,
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
    updateFilters
  } = useManagementPage({
    fetchFn: async (params) => {
      const extraParams = {
        ...params,
        includeAll: 'true',
        ...(filterCity && { city: filterCity }),
        ...(filterStatus && { status: filterStatus }),
        ...(filterSpecialization && { specialization: filterSpecialization })
      }
      const queryString = new URLSearchParams(extraParams).toString()
      const response = await dentistsAPI.getAll(queryString)
      return {
        success: response.success,
        data: response.data || [],
        totalPages: response.pagination?.pages || 1
      }
    },
    fetchStatsFn: async () => await dentistsAPI.getStats(),
    api: {
      approve: dentistsAPI.approve,
      reject: (dentist) => dentistsAPI.reject(dentist.userId, 'Rejected by admin'),
      toggleStatus: (dentist) => dentistsAPI.toggleStatus(dentist.userId)
    },
    initialStats: { total: '-', pending: '-', active: '-' },
    initialFilters: {}
  })

  // Custom action handler for toggle status
  const handleToggleStatus = (dentist) => {
    const action = dentist.user?.status === 'ACTIVE' ? 'deactivate' : 'activate'
    executeOperation(
      async () => await dentistsAPI.toggleStatus(dentist.userId),
      { action, item: dentist }
    )
  }

  // Stats configuration
  const statsConfig = useMemo(() => [
    {
      label: 'Total Dentists',
      value: loading ? '-' : stats.total,
      icon: FaUserMd,
      gradient: 'from-teal-600 to-cyan-600'
    },
    {
      label: 'Pending Approval',
      value: loading ? '-' : stats.pending,
      icon: FaClock,
      gradient: 'from-yellow-600 to-orange-600'
    },
    {
      label: 'Active Dentists',
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
        label: 'Status',
        value: filterStatus,
        onChange: (e) => {
          setFilterStatus(e.target.value)
          refresh()
        },
        options: STATUS_OPTIONS
      },
      {
        label: 'Specialization',
        value: filterSpecialization,
        onChange: (e) => {
          setFilterSpecialization(e.target.value)
          refresh()
        },
        options: DENTAL_SPECIALIZATIONS_OPTIONS
      }
    ],
    onClearFilters: () => {
      setSearchTerm('')
      setFilterCity('')
      setFilterStatus('')
      setFilterSpecialization('')
      refresh()
    },
    filtering,
    searchPlaceholder: 'Search dentists by name, email, or license...'
  }), [searchTerm, debouncedSearchTerm, filterCity, filterStatus, filterSpecialization, filtering, setSearchTerm, refresh])

  // Columns configuration
  const columns = [
    { key: 'dentist', label: 'Dentist' },
    { key: 'license', label: 'License' },
    { key: 'clinic', label: 'Clinic & Location' },
    { key: 'status', label: 'Status' },
    { key: 'date', label: 'Registration Date' },
    { key: 'actions', label: 'Actions' }
  ]

  // Render table row - use useMemo to prevent recreation on every render
  const renderRow = useMemo(() => (dentist) => (
    <tr key={dentist.userId} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
      {/* Dentist Info */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="shrink-0 h-10 w-10">
            {dentist.user?.profileImage ? (
              <img
                className="h-10 w-10 rounded-full object-cover"
                src={getImageUrl(dentist.user.profileImage)}
                alt={`${dentist.firstName} ${dentist.lastName}`}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.querySelector('.fallback-avatar').classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`w-10 h-10 rounded-full bg-linear-to-r from-teal-600 to-cyan-600 flex items-center justify-center fallback-avatar ${dentist.user?.profileImage ? 'hidden' : ''}`}>
              <FaUserMd className="w-5 h-5 text-white" />
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

      {/* License */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
          {dentist.licenseNumber}
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
              onClick: () => handleViewDetails(dentist),
              title: 'View Details',
              variant: 'default',
              key: 'view'
            },
            // Show approve/reject for PENDING dentists
            ...(dentist.user?.status === 'PENDING' ? [
              {
                icon: FaCheck,
                onClick: () => confirmApprove(dentist),
                title: 'Approve',
                variant: 'success',
                key: 'approve'
              },
              {
                icon: FaTimes,
                onClick: () => confirmReject(dentist),
                title: 'Reject',
                variant: 'danger',
                key: 'reject'
              }
            ] : []),
            // Show approve for REJECTED dentists
            ...(dentist.user?.status === 'REJECTED' ? [
              {
                icon: FaCheck,
                onClick: () => confirmApprove(dentist),
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
  ), [isDarkMode, handleViewDetails, confirmApprove, confirmReject, handleToggleStatus])

  const tableProps = {
    columns,
    data: dentists,
    renderRow,
    loading: loading || filtering,
    emptyMessage: searchTerm ? 'Try adjusting your search criteria' : 'No dentists yet',
    emptyIcon: FaUserMd,
    hasFilters: !!searchTerm || !!filterCity || !!filterStatus || !!filterSpecialization
  }

  const confirmProps = {
    isOpen: showConfirmModal,
    onClose: cancelOperation,
    onConfirm: executeOperation,
    item: selectedDentist,
    action: confirmAction,
    itemName: selectedDentist ? `Dr. ${selectedDentist.firstName} ${selectedDentist.lastName}` : '',
    itemType: 'dentist',
    isProcessing
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Dentist Management"
        description="Review and approve dentist registrations"
      />

      {/* Statistics */}
      <StatsOverview stats={statsConfig} />

      {/* Filters */}
      <FilterBar {...filterProps} />

      {/* Data Table */}
      <DataTable {...tableProps} />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={goToPage}
      />

      {/* Dentist Details Modal */}
      <DentistDetailsModal
        isOpen={showDetailsModal}
        dentistData={selectedDentist}
        onClose={closeAllModals}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal {...confirmProps} />

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => {}}
        />
      )}
    </div>
  )
}

export default DentistsManagement