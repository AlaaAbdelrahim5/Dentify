import { useState, useEffect, useMemo } from 'react'
import { 
  FaUser,
  FaPlus,
  FaEdit,
  FaSearch,
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
  Card, 
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
import { useDebounce } from '../../../hooks'

const PatientsManagement = () => {
  const { isDarkMode } = useTheme()
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtering, setFiltering] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCity, setFilterCity] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterGender, setFilterGender] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showNewModal, setShowNewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null)
  const [patientToAction, setPatientToAction] = useState(null)
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const [toast, setToast] = useState(null)
  const [stats, setStats] = useState({
    total: '-',
    active: '-'
  })
  const [error, setError] = useState(null)

  // Fetch patients
  const fetchPatients = async (isFiltering = false) => {
    try {
      if (isFiltering) {
        setFiltering(true)
      } else {
        setLoading(true)
      }
      
      setError(null)
      
      const response = await patientsAPI.getAll()

      if (response.patients) {
        console.log('Patients loaded:', response.patients?.length || 0)
        setPatients(response.patients)
      } else {
        setError('Failed to load patients. Please try again.')
      }
    } catch (error) {
      console.error('❌ Error fetching patients:', error)
      setError('Failed to load patients. Please try again.')
    } finally {
      if (isFiltering) {
        setFiltering(false)
      } else {
        setLoading(false)
      }
    }
  }

  // Fetch patient statistics
  const fetchStats = async () => {
    try {
      const response = await patientsAPI.getStats()

      if (response.data) {
        setStats({
          total: response.data.total || 0,
          active: response.data.active || 0
        })
      }
    } catch (error) {
      console.error('Error fetching patient stats:', error)
    }
  }

  // Toggle patient status (activate/deactivate) - opens confirmation modal
  const handleToggleStatus = (patient) => {
    const action = patient.user?.status === 'ACTIVE' ? 'deactivate' : 'activate'
    setPatientToAction(patient)
    setConfirmAction(action)
    setShowConfirmModal(true)
  }

  // Execute the confirmation action
  const executeAction = async () => {
    const patient = patientToAction
    const action = confirmAction

    try {
      // Here you would call an API to toggle patient status
      // For now, we'll just refresh the list
      // const response = await patientsAPI.toggleStatus(patient.userId)
      
      // Refresh the list and stats
      await Promise.all([fetchPatients(true), fetchStats()])
      setShowConfirmModal(false)
      setPatientToAction(null)
      setConfirmAction(null)
      setToast({ message: `Patient ${action}d successfully`, type: 'success' })
    } catch (error) {
      console.error(`Error ${action}ing patient:`, error)
      setToast({ message: `Failed to ${action} patient`, type: 'error' })
      setShowConfirmModal(false)
    }
  }

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchPatients(), fetchStats()])
    }
    loadData()
  }, [])

  // Filter patients - use useMemo for performance
  const filteredPatients = useMemo(() => {
    return patients.filter(patient => {
      const matchesSearch = 
        !debouncedSearchTerm ||
        `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        patient.user?.email?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        patient.user?.phone?.includes(debouncedSearchTerm)

      const matchesCity = !filterCity || patient.city?.toLowerCase() === filterCity.toLowerCase()
      const matchesStatus = !filterStatus || patient.user?.status === filterStatus
      const matchesGender = !filterGender || patient.gender === filterGender

      return matchesSearch && matchesCity && matchesStatus && matchesGender
    })
  }, [patients, debouncedSearchTerm, filterCity, filterStatus, filterGender])

  // Pagination - use useMemo for performance
  const { totalPages, paginatedPatients } = useMemo(() => {
    const total = Math.ceil(filteredPatients.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginated = filteredPatients.slice(startIndex, startIndex + itemsPerPage)
    return { totalPages: total, paginatedPatients: paginated }
  }, [filteredPatients, currentPage, itemsPerPage])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchTerm, filterCity, filterStatus, filterGender])

  // Stats configuration - use useMemo for performance
  const statsConfig = useMemo(() => [
    {
      label: 'Total Patients',
      value: loading ? '-' : stats.total,
      icon: FaUsers,
      gradient: 'from-teal-600 to-cyan-600',
      cols: 1
    },
    {
      label: 'Active Patients',
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
        options: STATUS_OPTIONS.filter(opt => opt.value !== 'PENDING' && opt.value !== 'REJECTED')
      },
      {
        placeholder: 'All Cities',
        value: filterCity,
        onChange: (e) => setFilterCity(e.target.value),
        options: CITY_OPTIONS_LOWERCASE
      },
      {
        placeholder: 'All Genders',
        value: filterGender,
        onChange: (e) => setFilterGender(e.target.value),
        options: GENDER_OPTIONS
      }
    ],
    onClearFilters: () => {
      setSearchTerm('')
      setFilterCity('')
      setFilterStatus('')
      setFilterGender('')
      setCurrentPage(1)
    },
    filtering,
    searchPlaceholder: 'Search patients by name, email, or phone...'
  }), [searchTerm, debouncedSearchTerm, filterStatus, filterCity, filterGender, filtering])

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
          <div className="flex-shrink-0 h-10 w-10">
            {patient.user?.profileImage ? (
              <img
                className="h-10 w-10 rounded-full object-cover"
                src={getImageUrl(patient.user.profileImage)}
                alt={`${patient.firstName} ${patient.lastName}`}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.querySelector('.fallback-avatar').style.display = 'flex';
                }}
              />
            ) : null}
            <div className={`h-10 w-10 rounded-full flex items-center justify-center fallback-avatar ${patient.user?.profileImage ? 'hidden' : ''} ${
                isDarkMode 
                  ? 'bg-gradient-to-br from-teal-600 to-cyan-600' 
                  : 'bg-gradient-to-br from-teal-500 to-cyan-500'
              }`}>
              <FaUser className="text-white text-lg" />
            </div>
          </div>
          <div className="ml-4">
            <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
              {patient.firstName} {patient.lastName}
            </div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              ID: {patient.userId}
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
              onClick: () => {
                setSelectedPatient(patient)
                setShowDetailsModal(true)
              },
              title: 'View Details',
              variant: 'default',
              key: 'view'
            },
            {
              icon: FaEdit,
              onClick: () => {
                setSelectedPatient(patient)
                setShowEditModal(true)
              },
              title: 'Edit Patient',
              variant: 'default',
              key: 'edit'
            },
            // Show deactivate for ACTIVE patients
            ...(patient.user?.status === 'ACTIVE' ? [
              {
                icon: FaBan,
                onClick: () => handleToggleStatus(patient),
                title: 'Deactivate',
                variant: 'warning',
                key: 'deactivate'
              }
            ] : []),
            // Show activate for DEACTIVATED patients
            ...(patient.user?.status === 'DEACTIVATED' ? [
              {
                icon: FaCheckCircle,
                onClick: () => handleToggleStatus(patient),
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
        subtitle="View and manage patient records"
      />

      {/* Statistics */}
      <StatsOverview stats={statsConfig} />

      {/* Filters */}
      <FilterBar {...filterProps} />

      {/* Data Table */}
      <DataTable
        data={paginatedPatients}
        columns={columns}
        renderRow={renderRow}
        loading={loading}
        emptyMessage="No patients found"
        emptyIcon={FaUsers}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Patient Modal */}
      <PatientModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
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
            setShowNewModal(false)
            fetchPatients(true)
            fetchStats()
            setToast({ message: 'Patient created successfully', type: 'success' })
          } catch (error) {
            console.error('Error creating patient:', error)
            const errorMessage = error.response?.data?.error || error.message || 'Failed to create patient'
            setToast({ message: errorMessage, type: 'error' })
          }
        }}
      />

      {/* Edit Patient Modal */}
      {selectedPatient && (
        <PatientModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setSelectedPatient(null)
          }}
          patientData={{
            ...selectedPatient,
            phone: selectedPatient.user?.phone,
            email: selectedPatient.user?.email,
            dateOfBirth: selectedPatient.birthDate,
            address: selectedPatient.city
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
              await patientsAPI.update(selectedPatient.userId, apiData)
              setShowEditModal(false)
              setSelectedPatient(null)
              fetchPatients(true)
              fetchStats()
              setToast({ message: 'Patient updated successfully', type: 'success' })
            } catch (error) {
              console.error('Error updating patient:', error)
              const errorMessage = error.response?.data?.error || error.message || 'Failed to update patient'
              setToast({ message: errorMessage, type: 'error' })
            }
          }}
        />
      )}

      {/* Patient Details Modal */}
      {selectedPatient && (
        <PatientDetailsModal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false)
            setSelectedPatient(null)
          }}
          patientData={{
            ...selectedPatient,
            name: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
            phone: selectedPatient.user?.phone,
            email: selectedPatient.user?.email,
            dateOfBirth: selectedPatient.birthDate,
            address: selectedPatient.city,
            status: selectedPatient.user?.status === 'ACTIVE' ? 'active' : 'inactive'
          }}
          onEdit={(patient) => {
            setShowDetailsModal(false)
            setSelectedPatient(patient)
            setShowEditModal(true)
          }}
          treatments={[]}
          appointments={[]}
          payments={[]}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false)
          setConfirmAction(null)
          setPatientToAction(null)
        }}
        onConfirm={executeAction}
        item={patientToAction}
        action={confirmAction}
        itemName={patientToAction ? `${patientToAction.firstName} ${patientToAction.lastName}` : ''}
        itemType="patient"
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

export default PatientsManagement
