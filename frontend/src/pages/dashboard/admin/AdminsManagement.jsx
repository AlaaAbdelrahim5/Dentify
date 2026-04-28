import { useMemo, useState, useEffect } from 'react'
import {
  FaUsers,
  FaUserShield,
  FaPlus,
  FaEye,
  FaEdit,
  FaTimes,
  FaEnvelope,
  FaPhone,
  FaCheck,
  FaSave,
  FaCheckCircle,
  FaTimesCircle
} from 'react-icons/fa'
import { formatDate as formatDateHelper, getImageUrl } from '../../../utils/helpers'
import { validateEmail } from '../../../utils/validation'
import { useManagementPage } from '../../../hooks'
import { STATUS_OPTIONS, GENDER_OPTIONS } from '../../../utils/constants'
import { 
  Button, 
  Input, 
  PageHeader,
  StatsOverview,
  FilterBar,
  DataTable,
  Pagination,
  StatusBadge,
  ActionButtons,
  ConfirmationModal,
  Toast,
  AddAdminModal,
  AdminEditModal,
  AdminDetailsModal,
  Card,
} from '../../../components'
import { useTheme } from '../../../contexts/ThemeContext'
import { adminAPI } from '../../../services/api'

const AdminsManagement = () => {
  const { isDarkMode } = useTheme()

  // Additional filters
  const [filterStatus, setFilterStatus] = useState('')
  const [filterGender, setFilterGender] = useState('')

  // Use unified management hook
  const {
    data: admins,
    loading,
    filtering,
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    currentPage,
    totalPages,
    goToPage,
    stats,
    showDetailsModal,
    showAddModal,
    showEditModal,
    selectedItem: selectedAdmin,
    selectedCrudItem,
    handleViewDetails,
    handleAdd,
    handleEdit,
    closeAllModals,
    handleSaveSuccess,
    showConfirmModal,
    confirmAction,
    isProcessing,
    executeOperation,
    cancelOperation,
    confirmToggleStatus,
    toast,
    refresh,
    showSuccess,
    showError,
    hideToast
  } = useManagementPage({
    fetchFn: async (params) => {
      const queryParams = {
        ...params,
        ...(filterStatus && { status: filterStatus }),
        ...(filterGender && { gender: filterGender })
      }
      const response = await adminAPI.getAllAdmins(queryParams)
      return {
        success: response.success,
        data: response.data || [],
        totalPages: response.totalPages || 1
      }
    },
    fetchStatsFn: async () => {
      const response = await adminAPI.getAdminStats()
      return response
    },
    api: {
      toggleStatus: adminAPI.toggleStatus
    },
    onSuccess: ({ action, item }) => {
      const actionText = action === 'activate' ? 'activated' : 'deactivated'
      showSuccess(`Admin ${actionText} successfully`)
    },
    onError: ({ action, error }) => {
      console.error('Toggle status error:', error)
      showError(error || `Failed to ${action} admin`)
    },
    initialStats: {
      total: '-',
      active: '-',
      inactive: '-'
    }
  })

  // Refresh when filters change
  useEffect(() => {
    refresh()
  }, [filterStatus, filterGender])

  // Debug: Log confirmToggleStatus function on mount
  console.log('AdminsManagement rendered')
  console.log('confirmToggleStatus function:', confirmToggleStatus)
  console.log('showConfirmModal state:', showConfirmModal)
  console.log('selectedAdmin (for details modal):', selectedAdmin)
  console.log('selectedCrudItem (for confirmation):', selectedCrudItem)
  console.log('confirmAction:', confirmAction)

  // Component configurations
  const statsConfig = useMemo(() => [
    {
      label: 'Total Admins',
      value: loading ? '-' : stats.total,
      icon: FaUserShield,
      gradient: 'from-teal-600 to-cyan-600'
    },
    {
      label: 'Active Admins',
      value: loading ? '-' : stats.active,
      icon: FaCheckCircle,
      gradient: 'from-green-600 to-green-700'
    },
    {
      label: 'Inactive Admins',
      value: loading ? '-' : stats.inactive,
      icon: FaTimesCircle,
      gradient: 'from-red-600 to-red-700'
    }
  ], [stats, loading])

  const filterProps = useMemo(() => ({
    searchTerm,
    onSearchChange: (e) => setSearchTerm(e.target.value),
    debouncedSearchTerm,
    filters: [
      {
        label: 'Status',
        value: filterStatus,
        onChange: (e) => setFilterStatus(e.target.value),
        options: STATUS_OPTIONS
      },
      {
        label: 'Gender',
        value: filterGender,
        onChange: (e) => setFilterGender(e.target.value),
        options: GENDER_OPTIONS
      }
    ],
    onClearFilters: () => {
      setSearchTerm('')
      setFilterStatus('')
      setFilterGender('')
    },
    filtering,
    searchPlaceholder: 'Search admins by name or email...'
  }), [searchTerm, debouncedSearchTerm, filterStatus, filterGender, filtering, setSearchTerm])

  const columns = [
    { key: 'admin', label: 'Admin' },
    { key: 'contact', label: 'Contact' },
    { key: 'status', label: 'Status' },
    { key: 'created', label: 'Created Date' },
    { key: 'actions', label: 'Actions' }
  ]

  const renderRow = (admin) => (
    <tr key={admin._id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="shrink-0 h-10 w-10">
            {admin.userId?.profileImage ? (
              <img
                className="h-10 w-10 rounded-full object-cover"
                src={getImageUrl(admin.userId.profileImage)}
                alt={admin.fullName}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.querySelector('.fallback-avatar').classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`w-10 h-10 rounded-full bg-linear-to-r from-teal-600 to-cyan-600 flex items-center justify-center fallback-avatar ${admin.userId?.profileImage ? 'hidden' : ''}`}>
              <FaUserShield className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="ml-3">
            <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {admin.fullName}
            </div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {admin.gender.charAt(0).toUpperCase() + admin.gender.slice(1)}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {admin.userId?.email}
        </div>
        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {admin.userId?.phone}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge 
          isActive={admin.userId?.status === 'active'}
          activeIcon={FaCheckCircle}
          inactiveIcon={FaTimesCircle}
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {formatDateHelper(admin.createdAt)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <ActionButtons
          actions={[
            {
              icon: FaEye,
              onClick: () => {
                console.log('View Details clicked for:', admin.fullName)
                handleViewDetails(admin)
              },
              title: 'View Details',
              variant: 'default'
            },
            {
              icon: FaEdit,
              onClick: () => handleEdit(admin),
              title: 'Edit',
              variant: 'default'
            },
            {
              icon: admin.userId?.status === 'active' ? FaTimesCircle : FaCheckCircle,
              onClick: () => {
                console.log('Toggle Status clicked for:', admin.fullName, 'Current status:', admin.userId?.status)
                confirmToggleStatus(admin)
              },
              title: admin.userId?.status === 'active' ? 'Deactivate' : 'Activate',
              variant: admin.userId?.status === 'active' ? 'warning' : 'success'
            }
          ]}
        />
      </td>
    </tr>
  )

  const tableProps = {
    columns,
    data: admins,
    renderRow,
    loading: loading || filtering,
    emptyMessage: searchTerm ? 'Try adjusting your search criteria' : 'No administrators yet',
    emptyIcon: FaUserShield,
    hasFilters: !!searchTerm
  }

  const confirmProps = {
    isOpen: showConfirmModal,
    onClose: cancelOperation,
    onConfirm: executeOperation,
    item: selectedCrudItem,
    action: confirmAction,
    itemName: selectedCrudItem?.fullName,
    itemType: 'Admin',
    isProcessing
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Admin Management"
        description="Manage system administrators"
        action={{
          label: 'Add Admin',
          onClick: handleAdd,
          icon: FaPlus,
          gradient: 'from-teal-600 to-cyan-600'
        }}
      />

      {/* Search and Filters */}
      <Card className="p-4">
        <FilterBar {...filterProps} />
      </Card>

      {/* Admins Table */}
      <DataTable {...tableProps} />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={goToPage}
      />

      {/* Admin Details Modal */}
      {showDetailsModal && (
        <AdminDetailsModal
          admin={selectedAdmin}
          onClose={closeAllModals}
        />
      )}

      {/* Add Admin Modal */}
      <AddAdminModal
        isOpen={showAddModal}
        onClose={closeAllModals}
        onSave={handleSaveSuccess}
      />

      {/* Edit Admin Modal */}
      {selectedAdmin && (
        <AdminEditModal
          isOpen={showEditModal}
          onClose={closeAllModals}
          admin={selectedAdmin}
          onSave={handleSaveSuccess}
        />
      )}

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

export default AdminsManagement