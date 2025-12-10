import { useState, useEffect, useRef } from 'react'
import { 
  FaHospital, 
  FaPlus, 
  FaEdit, 
  FaSearch, 
  FaFilter,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaTimes,
  FaUserMd,
  FaCheck
} from 'react-icons/fa'
import { 
  Card, 
  Button, 
  LoadingSpinner, 
  ClinicModal,
  ClinicDetailsModal,
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
import { clinicsAPI } from '../../../services/api'
import { CITY_OPTIONS_LOWERCASE } from '../../../utils/constants'
import { useDebounce } from '../../../hooks'

const ClinicsManagement = () => {
  const { isDarkMode } = useTheme()
  const [clinics, setClinics] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtering, setFiltering] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCity, setFilterCity] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedClinic, setSelectedClinic] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null)
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0
  })

  // Fetch clinics
  const fetchClinics = async (isFiltering = false) => {
    try {
      if (isFiltering) {
        setFiltering(true)
      } else {
        setLoading(true)
      }
      
      const params = {
        page: currentPage,
        limit: 10,
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
        ...(filterCity && { city: filterCity }),
        ...(filterStatus && { isActive: filterStatus })
      }

      const queryString = new URLSearchParams(params).toString()
      const response = await fetch(`http://localhost:5000/api/clinics?${queryString}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('dentify_access_token') || sessionStorage.getItem('dentify_access_token')}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success) {
        // Transform backend data to match frontend expectations
        const transformedClinics = data.data.map(clinic => ({
          _id: clinic.userId,
          userId: clinic.userId,
          name: clinic.clinicName,
          clinicName: clinic.clinicName,
          description: clinic.description || '',
          address: {
            fullAddress: clinic.location || '',
            city: clinic.city
          },
          city: clinic.city,
          location: clinic.location,
          phone: {
            full: clinic.user?.phone || ''
          },
          email: clinic.user?.email || '',
          workingHours: clinic.workingHours || {},
          doctors: clinic.dentists || [],
          secretaries: clinic.secretaries || [],
          isActive: clinic.user?.status === 'ACTIVE',
          registrationNumber: clinic.registrationNumber,
          website: clinic.website,
          coordinates: clinic.coordinates,
          servicesAvailable: clinic.servicesAvailable || []
        }))
        
        setClinics(transformedClinics)
        setTotalPages(data.pagination.pages)
      }
    } catch (error) {
      console.error('Error fetching clinics:', error)
    } finally {
      if (isFiltering) {
        setFiltering(false)
      } else {
        setLoading(false)
      }
    }
  }

  // Fetch clinic statistics
  const fetchStats = async () => {
    try {
      const data = await clinicsAPI.getStats()
      
      if (data && data.success && data.data) {
        setStats({
          total: data.data.total || 0,
          active: data.data.active || 0,
          inactive: data.data.pending || 0
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  useEffect(() => {
    fetchClinics()
    fetchStats()
    setIsFirstLoad(false)
  }, [])

  // Separate effect for filtering that doesn't show full page loading
  useEffect(() => {
    if (!isFirstLoad) {
      fetchClinics(true) // Pass true to indicate this is filtering
    }
  }, [currentPage, debouncedSearchTerm, filterCity, filterStatus, isFirstLoad])

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const handleCityFilter = (e) => {
    setFilterCity(e.target.value)
    setCurrentPage(1)
  }

  const handleStatusFilter = (e) => {
    setFilterStatus(e.target.value)
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setDebouncedSearchTerm('')
    setFilterCity('')
    setFilterStatus('')
    setCurrentPage(1)
  }

  const formatWorkingHours = (workingHours) => {
    if (!workingHours || workingHours.length === 0) return 'Not specified'
    
    // Handle array format from backend
    if (Array.isArray(workingHours)) {
      if (workingHours.length === 0) return 'Closed'
      
      const firstDay = workingHours[0]
      return `${firstDay.startTime} - ${firstDay.endTime}`
    }
    
    // Handle object format (legacy)
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const openDays = days.filter(day => workingHours[day]?.isOpen)
    
    if (openDays.length === 0) return 'Closed'
    
    const firstDay = openDays[0]
    const firstDayHours = workingHours[firstDay]
    
    return `${firstDayHours.start} - ${firstDayHours.end}`
  }

  const getCityLabel = (cityValue) => {
    const city = CITY_OPTIONS_LOWERCASE.find(c => c.value === cityValue)
    return city ? city.label : cityValue
  }

  const handleClinicSave = (savedClinic, action) => {
    if (action === 'created') {
      // Refresh the list to show new clinic
      fetchClinics(true) // Use filtering state instead of full loading
      fetchStats()
    } else if (action === 'updated') {
      // Update the clinic in the current list
      setClinics(prev => prev.map(clinic => 
        clinic._id === savedClinic._id ? savedClinic : clinic
      ))
      fetchStats()
    }
  }

  const handleEditClinic = (clinic) => {
    setSelectedClinic(clinic)
    setShowEditModal(true)
  }

  const handleAddClinic = () => {
    setSelectedClinic(null)
    setShowAddModal(true)
  }

  const handleToggleClinicStatus = async (clinic) => {
    const action = clinic.isActive ? 'deactivate' : 'activate'
    
    setSelectedClinic(clinic)
    setConfirmAction(action)
    setShowConfirmModal(true)
  }

  const executeToggleStatus = async () => {
    const clinic = selectedClinic
    const action = confirmAction

    try {
      console.log('Toggling clinic status for clinic ID:', clinic._id)
      const response = await clinicsAPI.toggleStatus(clinic._id)
      console.log('Toggle status response:', response)

      if (response.success) {
        setShowConfirmModal(false)
        setSelectedClinic(null)
        setConfirmAction(null)
        fetchClinics(true)
        fetchStats()
        // You can add a success toast notification here instead of alert
      } else {
        alert(`Failed to ${action} clinic: ` + (response.error || response.message || 'Unknown error'))
      }
    } catch (error) {
      console.error(`Error ${action}ing clinic:`, error)
      alert(`Network error. Please try again. Details: ${error.message}`)
    }
  }

  // Stats configuration for StatsOverview component
  const statsConfig = [
    {
      label: 'Total Clinics',
      value: stats.total,
      icon: FaHospital,
      gradient: 'from-teal-600 to-cyan-600'
    },
    {
      label: 'Active Clinics',
      value: stats.active,
      icon: FaCheckCircle,
      gradient: 'from-green-600 to-green-700'
    },
    {
      label: 'Inactive Clinics',
      value: stats.inactive,
      icon: FaTimesCircle,
      gradient: 'from-red-600 to-red-700'
    }
  ]

  // Filter configuration for FilterBar component
  const filters = [
    {
      value: filterCity,
      onChange: handleCityFilter,
      options: CITY_OPTIONS_LOWERCASE,
      placeholder: 'All Cities'
    },
    {
      value: filterStatus,
      onChange: handleStatusFilter,
      options: [
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' }
      ],
      placeholder: 'All Status'
    }
  ]

  // Table columns configuration
  const columns = [
    { key: 'clinic', label: 'Clinic' },
    { key: 'location', label: 'Location' },
    { key: 'contact', label: 'Contact' },
    { key: 'staff', label: 'Staff' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' }
  ]

  // Render table row
  const renderRow = (clinic, index) => {
    const actions = [
      {
        icon: FaEye,
        onClick: () => {
          setSelectedClinic(clinic)
          setShowDetailsModal(true)
        },
        title: 'View Details',
        variant: 'default'
      },
      {
        icon: FaEdit,
        onClick: () => handleEditClinic(clinic),
        title: 'Edit',
        variant: 'default'
      },
      {
        icon: clinic.isActive ? FaTimesCircle : FaCheckCircle,
        onClick: () => handleToggleClinicStatus(clinic),
        title: clinic.isActive ? 'Deactivate' : 'Activate',
        variant: clinic.isActive ? 'warning' : 'success'
      }
    ]

    return (
      <tr key={clinic._id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-600 to-cyan-600 flex items-center justify-center">
              <FaHospital className="w-5 h-5 text-white" />
            </div>
            <div className="ml-3">
              <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {clinic.name}
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {clinic.registrationNumber || 'N/A'}
              </div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {getCityLabel(clinic.address.city)}
          </div>
          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {clinic.address.fullAddress}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {clinic.email}
          </div>
          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {clinic.phone.full}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <div>Doctors: {clinic.doctors?.length || 0}</div>
            <div>Secretaries: {clinic.secretaries?.length || 0}</div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <StatusBadge isActive={clinic.isActive} />
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm">
          <ActionButtons actions={actions} />
        </td>
      </tr>
    )
  }

  if (loading && clinics.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Clinics Management"
        description="Manage and add registered clinics in the system"
        action={{
          label: 'Add New Clinic',
          onClick: handleAddClinic,
          icon: FaPlus,
          gradient: 'from-teal-600 to-cyan-600'
        }}
      />

      {/* Statistics Overview */}
      <StatsOverview stats={statsConfig} />

      {/* Search and Filters */}
      <Card className="p-6">
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={handleSearch}
          debouncedSearchTerm={debouncedSearchTerm}
          filters={filters}
          onClearFilters={clearFilters}
          filtering={filtering}
          searchPlaceholder="Search for clinic..."
        />
      </Card>

      {/* Clinics Table */}
      <DataTable
        columns={columns}
        data={clinics}
        renderRow={renderRow}
        loading={filtering}
        emptyMessage="No clinics yet"
        emptyIcon={FaHospital}
        emptyTitle="No clinics found"
        hasFilters={!!(searchTerm || filterCity || filterStatus)}
      />

      {/* Pagination */}
      <Card>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </Card>

      {/* Add Clinic Modal */}
      <ClinicModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        clinic={null}
        onSave={handleClinicSave}
      />

      {/* Edit Clinic Modal */}
      <ClinicModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedClinic(null)
        }}
        clinic={selectedClinic}
        onSave={handleClinicSave}
      />

      {/* Clinic Details Modal */}
      <ClinicDetailsModal
        isOpen={showDetailsModal}
        clinic={selectedClinic}
        onClose={() => {
          setShowDetailsModal(false)
          setSelectedClinic(null)
        }}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false)
          setSelectedClinic(null)
          setConfirmAction(null)
        }}
        onConfirm={executeToggleStatus}
        item={selectedClinic}
        action={confirmAction}
        itemName={selectedClinic?.name}
        itemType="Clinic"
      />
    </div>
  )
}

export default ClinicsManagement