import { useMemo, useState } from 'react'
import { 
  FaUser,
  FaPlus,
  FaEdit,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaBirthdayCake,
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaBan,
  FaUsers
} from 'react-icons/fa'
import { 
  Button, 
  PageHeader,
  StatsOverview,
  FilterBar,
  DataTable,
  Pagination,
  StatusBadge,
  ActionButtons,
  ConfirmationModal,
  PatientModal,
  PatientDetailsModal,
  Toast
} from '../../../components'
import { useTheme } from '../../../contexts/ThemeContext'
import { patientsAPI } from '../../../services/api'
import { CITY_OPTIONS_LOWERCASE, GENDER_OPTIONS, STATUS_OPTIONS } from '../../../utils/constants'
import { calculateAge, capitalizeFirstLetter, formatDate as formatDateHelper, getImageUrl } from '../../../utils/helpers'
import { useManagementPage, usePatientData } from '../../../hooks'

const PatientsManagement = () => {
  const { isDarkMode } = useTheme()

  // Additional filters
  const [filterCity, setFilterCity] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterGender, setFilterGender] = useState('')

  // Use unified management hook
  const {
    data: patients,
    loading,
    filtering,
    error,
    searchTerm,
    updateSearch,
    currentPage,
    totalPages,
    goToPage,
    stats,
    showDetailsModal,
    showAddModal,
    showEditModal,
    selectedItem,
    setSelectedItem,
    setShowDetailsModal,
    setShowEditModal,
    handleViewDetails,
    handleAdd,
    handleEdit,
    closeAllModals,
    confirmProps,
    confirmToggleStatus,
    toast,
    showToast,
    refresh,
    clearFilters
  } = useManagementPage({
    fetchFn: async () => {
      const response = await patientsAPI.getAll()
      return {
        success: true,
        data: response.patients || [],
        totalPages: 1
      }
    },
    fetchStatsFn: async () => await patientsAPI.getStats(),
    api: {
      toggleStatus: (patient) => patientsAPI.toggleStatus(patient.userId)
    },
    initialStats: { total: '-', active: '-', inactive: '-' }
  })

  // Use patient data transformer and filter hook
  const { filteredPatients } = usePatientData(patients, searchTerm, {
    city: filterCity,
    status: filterStatus,
    gender: filterGender
  })

  // Manual pagination for filtered data
  const itemsPerPage = 10
  const paginatedData = useMemo(() => {
    if (!filteredPatients || filteredPatients.length === 0) return []
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredPatients.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredPatients, currentPage])

  // Recalculate total pages when filtered data changes
  const totalPagesCalculated = useMemo(() => {
    if (!filteredPatients || filteredPatients.length === 0) return 1
    return Math.ceil(filteredPatients.length / itemsPerPage)
  }, [filteredPatients])

  // Stats configuration
  const statsConfig = [
    {
      label: 'Total Patients',
      value: stats?.totalPatients || 0,
      icon: FaUsers,
      gradient: 'from-teal-600 to-cyan-600'
    },
    {
      label: 'Active Patients',
      value: stats?.activePatients || 0,
      icon: FaCheckCircle,
      gradient: 'from-green-600 to-green-700'
    },
    {
      label: 'Inactive Patients',
      value: stats?.inactivePatients || 0,
      icon: FaTimesCircle,
      gradient: 'from-red-600 to-red-700'
    }
  ]

  // Filter props configuration
  const filterProps = {
    searchValue: searchTerm,
    onSearchChange: updateSearch,
    placeholder: 'Search patients...',
    filters: [
      {
        label: 'City',
        value: filterCity,
        onChange: (e) => setFilterCity(e.target.value),
        options: CITY_OPTIONS_LOWERCASE
      },
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
    onClearAll: () => {
      clearFilters()
      setFilterCity('')
      setFilterStatus('')
      setFilterGender('')
    }
  }

  // Table columns
  const columns = [
    { key: 'patient', label: 'Patient' },
    { key: 'contact', label: 'Contact Information' },
    { key: 'demographics', label: 'Demographics' },
    { key: 'status', label: 'Status' },
    { key: 'registration', label: 'Registration Date' },
    { key: 'actions', label: 'Actions' }
  ]

  // Render table row
  const renderRow = (patient) => (
    <tr key={patient.userId} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
      {/* Patient Info */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="shrink-0 h-10 w-10">
            {patient.user?.profileImage ? (
              <img
                className="h-10 w-10 rounded-full object-cover"
                src={getImageUrl(patient.user.profileImage)}
                alt={`${patient.firstName} ${patient.lastName}`}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.querySelector('.fallback-avatar').classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`w-10 h-10 rounded-full bg-linear-to-r from-teal-600 to-cyan-600 flex items-center justify-center fallback-avatar ${patient.user?.profileImage ? 'hidden' : ''}`}>
              <FaUser className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="ml-4">
            <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
              {patient.firstName} {patient.lastName}
            </div>
          </div>
        </div>
      </td>

      {/* Contact Information */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
          <div className="flex items-center gap-2 mb-1">
            <FaEnvelope className="w-3 h-3 text-gray-400" />
            {patient.user?.email || 'N/A'}
          </div>
          <div className="flex items-center gap-2">
            <FaPhone className="w-3 h-3 text-gray-400" />
            {patient.user?.phone || 'N/A'}
          </div>
        </div>
      </td>

      {/* Demographics */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
          {capitalizeFirstLetter(patient.gender) || 'N/A'} • {calculateAge(patient.birthDate)} years
        </div>
        <div className={`text-sm flex items-center gap-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <FaMapMarkerAlt className="w-3 h-3" />
          {capitalizeFirstLetter(patient.city) || 'N/A'}
        </div>
      </td>

      {/* Status */}
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge 
          status={
            patient.user?.status === 'ACTIVE' ? 'active' : 
            patient.user?.status === 'DEACTIVATED' ? 'inactive' : 
            'inactive'
          } 
        />
      </td>

      {/* Registration Date */}
      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        {formatDateHelper(patient.user?.createdAt)}
      </td>

      {/* Actions */}
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <ActionButtons
          actions={[
            {
              icon: FaEye,
              onClick: () => handleViewDetails(patient),
              title: 'View Details',
              variant: 'default',
              key: 'view'
            },
            {
              icon: FaEdit,
              onClick: () => handleEdit(patient),
              title: 'Edit Patient',
              variant: 'default',
              key: 'edit'
            },
            // Show deactivate for ACTIVE patients
            ...(patient.user?.status === 'ACTIVE' ? [
              {
                icon: FaBan,
                onClick: () => confirmToggleStatus(patient, 'deactivate'),
                title: 'Deactivate',
                variant: 'warning',
                key: 'deactivate'
              }
            ] : []),
            // Show activate for DEACTIVATED patients
            ...(patient.user?.status === 'DEACTIVATED' ? [
              {
                icon: FaCheckCircle,
                onClick: () => confirmToggleStatus(patient, 'activate'),
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Patient Management"
        description="View and manage patient records"
        action={{
          label: 'Add Patient',
          onClick: handleAdd,
          icon: FaPlus,
          variant: 'primary'
        }}
      />

      {/* Filters */}
      <FilterBar {...filterProps} />

      {/* Data Table */}
      <DataTable
        data={paginatedData}
        columns={columns}
        renderRow={renderRow}
        loading={loading}
        emptyMessage="No patients found"
        emptyIcon={FaUsers}
      />

      {/* Pagination */}
      {totalPagesCalculated > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPagesCalculated}
          onPageChange={goToPage}
        />
      )}

      {/* Patient Modal */}
      <PatientModal
        isOpen={showAddModal}
        onClose={closeAllModals}
        patientData={null}
        onSave={async (patientData) => {
          try {
            // Transform data to match API expectations
            const apiData = {
              email: patientData.email,
              password: patientData.password || 'DefaultPassword123!',
              phone: patientData.phone,
              firstName: patientData.firstName,
              lastName: patientData.lastName,
              gender: patientData.gender || 'Male',
              birthDate: patientData.dateOfBirth,
              city: patientData.address || patientData.city || 'Unknown'
            }
            await patientsAPI.create(apiData)
            closeAllModals()
            refresh()
            showToast('Patient created successfully', 'success')
          } catch (error) {
            console.error('Error creating patient:', error)
            const errorMessage = error.response?.data?.error || error.message || 'Failed to create patient'
            showToast(errorMessage, 'error')
          }
        }}
      />

      {/* Edit Patient Modal */}
      {selectedItem && (
        <PatientModal
          isOpen={showEditModal}
          onClose={closeAllModals}
          patientData={{
            ...selectedItem,
            phone: selectedItem.user?.phone,
            email: selectedItem.user?.email,
            dateOfBirth: selectedItem.birthDate,
            address: selectedItem.city
          }}
          onSave={async (updatedData) => {
            try {
              // Only send fields that exist in the Patient schema
              const apiData = {
                firstName: updatedData.firstName,
                lastName: updatedData.lastName,
                gender: updatedData.gender,
                birthDate: updatedData.dateOfBirth,
                city: updatedData.city
              }
              await patientsAPI.update(selectedItem.userId, apiData)
              closeAllModals()
              refresh()
              showToast('Patient updated successfully', 'success')
            } catch (error) {
              console.error('Error updating patient:', error)
              const errorMessage = error.response?.data?.error || error.message || 'Failed to update patient'
              showToast(errorMessage, 'error')
            }
          }}
        />
      )}

      {/* Patient Details Modal */}
      {selectedItem && (
        <PatientDetailsModal
          isOpen={showDetailsModal}
          onClose={closeAllModals}
          patientData={{
            ...selectedItem,
            name: `${selectedItem.firstName} ${selectedItem.lastName}`,
            phone: selectedItem.user?.phone,
            email: selectedItem.user?.email,
            dateOfBirth: selectedItem.birthDate,
            address: selectedItem.city,
            status: selectedItem.user?.status === 'ACTIVE' ? 'active' : 'inactive'
          }}
          onEdit={(patient) => {
            setSelectedItem(patient)
            setShowEditModal(true)
            setShowDetailsModal(false)
          }}
          treatments={[]}
          appointments={[]}
          payments={[]}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal {...confirmProps} />

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => showToast(null)}
        />
      )}
    </div>
  )
}

export default PatientsManagement
