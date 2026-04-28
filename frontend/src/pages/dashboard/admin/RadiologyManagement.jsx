import { useState, useEffect, useMemo } from 'react'
import { 
  FaXRay, 
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
  FaCog,
  FaCheck,
  FaMap,
  FaList
} from 'react-icons/fa'
import { 
  Card, 
  Button, 
  LoadingSpinner, 
  RadiologyModal,
  RadiologyDetailsModal,
  PageHeader,
  StatsOverview,
  FilterBar,
  DataTable,
  Pagination,
  StatusBadge,
  ActionButtons,
  ConfirmationModal,
  Toast,
  LocationMap,
  MultiLocationMap
} from '../../../components'
import { useTheme } from '../../../contexts/ThemeContext'
import { radiologyAPI } from '../../../services/api'
import { CITY_OPTIONS, STATUS_OPTIONS } from '../../../utils/constants'
import { useDebounce } from '../../../hooks'
import { getImageUrl } from '../../../utils/helpers'

const RadiologyManagement = () => {
  const { isDarkMode } = useTheme()
  const [centers, setCenters] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtering, setFiltering] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCity, setFilterCity] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedCenter, setSelectedCenter] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null)
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const [toast, setToast] = useState(null)
  const [viewMode, setViewMode] = useState('list') // 'list' or 'map'
  const [stats, setStats] = useState({
    total: '-',
    active: '-',
    inactive: '-'
  })
  const [error, setError] = useState(null)

  // Fetch centers
  const fetchCenters = async (isFiltering = false) => {
    try {
      if (isFiltering) {
        setFiltering(true)
      } else {
        setLoading(true)
      }
      
      setError(null)
      
      const token = localStorage.getItem('dentify_access_token') || sessionStorage.getItem('dentify_access_token')
      
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
        ...(filterCity && { city: filterCity }),
        ...(filterStatus && { isActive: filterStatus })
      })

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/radiology-centers?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setCenters(data.data)
        setTotalPages(data.pagination?.pages || 1)
      } else {
        setError('Failed to load radiology centers. Please try again.')
        setCenters([])
      }
    } catch (error) {
      console.error('Error fetching centers:', error)
      setError('Failed to load radiology centers. Please try again.')
      setCenters([])
    } finally {
      if (isFiltering) {
        setFiltering(false)
      } else {
        setLoading(false)
      }
    }
  }

  // Fetch center statistics
  const fetchStats = async () => {
    try {
      const data = await radiologyAPI.getStats()
      
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
    fetchCenters()
    fetchStats()
    setIsFirstLoad(false)
  }, [])

  // Separate effect for filtering that doesn't show full page loading
  useEffect(() => {
    if (!isFirstLoad) {
      fetchCenters(true) // Pass true to indicate this is filtering
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
    setFilterCity('')
    setFilterStatus('')
    setCurrentPage(1)
  }

  const handleCenterSave = (savedCenter, action) => {
    if (action === 'created') {
      // Refresh the list to show new center
      fetchCenters(true) // Use filtering state instead of full loading
      fetchStats()
      setToast({ message: 'Radiology center created successfully', type: 'success' })
    } else if (action === 'updated') {
      // Update the center in the current list
      setCenters(prev => prev.map(center => 
        center.userId === savedCenter.userId ? savedCenter : center
      ))
      fetchStats()
      setToast({ message: 'Radiology center updated successfully', type: 'success' })
    }
  }

  const handleEditCenter = (center) => {
    setSelectedCenter(center)
    setShowEditModal(true)
  }

  const handleAddCenter = () => {
    setSelectedCenter(null)
    setShowAddModal(true)
  }

  const handleToggleCenterStatus = async (center) => {
    const status = center.user?.status
    const isActive = status === 'ACTIVE' || status === 'active'
    const action = isActive ? 'deactivate' : 'activate'
    
    setSelectedCenter(center)
    setConfirmAction(action)
    setShowConfirmModal(true)
  }

  const executeToggleStatus = async () => {
    const center = selectedCenter
    const action = confirmAction

    try {
      const response = await radiologyAPI.toggleStatus(center.userId)

      if (response.success) {
        setShowConfirmModal(false)
        setSelectedCenter(null)
        setConfirmAction(null)
        fetchCenters(true)
        fetchStats()
        setToast({ message: `Radiology center ${action}d successfully`, type: 'success' })
      } else {
        setToast({ message: `Failed to ${action} center: ` + (response.error || response.message || 'Unknown error'), type: 'error' })
      }
    } catch (error) {
      console.error(`Error ${action}ing center:`, error)
      setToast({ message: `Network error. Please try again.`, type: 'error' })
    }
  }

  // Stats configuration for StatsOverview component - use useMemo for performance
  const statsConfig = useMemo(() => [
    {
      label: 'Total Centers',
      value: loading ? '-' : stats.total,
      icon: FaXRay,
      gradient: 'from-teal-600 to-cyan-600'
    },
    {
      label: 'Active Centers',
      value: loading ? '-' : stats.active,
      icon: FaCheckCircle,
      gradient: 'from-green-600 to-green-700'
    },
    {
      label: 'Inactive Centers',
      value: loading ? '-' : stats.inactive,
      icon: FaTimesCircle,
      gradient: 'from-red-600 to-red-700'
    }
  ], [stats, loading])

  // Filter configuration for FilterBar component - use useMemo for performance
  const filters = useMemo(() => [
    {
      value: filterCity,
      onChange: handleCityFilter,
      options: CITY_OPTIONS,
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
  ], [filterCity, filterStatus])

  // Table columns configuration - use useMemo for performance
  const columns = useMemo(() => [
    { key: 'center', label: 'Center' },
    { key: 'location', label: 'Location' },
    { key: 'contact', label: 'Contact' },
    { key: 'services', label: 'Services' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' }
  ], [])

  // Render table row - use useMemo to prevent recreation on every render
  const renderRow = useMemo(() => (center, index) => {
    const isActive = center.user?.status === 'ACTIVE'
    const cityLabel = center.city
    
    const actions = [
      {
        icon: FaEye,
        onClick: () => {
          setSelectedCenter(center)
          setShowDetailsModal(true)
        },
        title: 'View Details',
        variant: 'default'
      },
      {
        icon: FaEdit,
        onClick: () => handleEditCenter(center),
        title: 'Edit',
        variant: 'default'
      },
      {
        icon: isActive ? FaTimesCircle : FaCheckCircle,
        onClick: () => handleToggleCenterStatus(center),
        title: isActive ? 'Deactivate' : 'Activate',
        variant: isActive ? 'warning' : 'success'
      }
    ]

    return (
      <tr key={center.userId} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div className="shrink-0 h-10 w-10">
              {center.user?.profileImage ? (
                <img
                  className="h-10 w-10 rounded-full object-cover"
                  src={getImageUrl(center.user.profileImage)}
                  alt={center.centerName}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.querySelector('.fallback-avatar').classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-10 h-10 rounded-full bg-linear-to-r from-teal-600 to-cyan-600 flex items-center justify-center fallback-avatar ${center.user?.profileImage ? 'hidden' : ''}`}>
                <FaXRay className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="ml-3">
              <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {center.centerName || center.registrationNumber}
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {center.registrationNumber || 'N/A'}
              </div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {cityLabel}
          </div>
          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {center.location || 'N/A'}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {center.user?.email || 'N/A'}
          </div>
          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {center.user?.phone || 'N/A'}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {center.supportedTypes?.length || 0} services
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <StatusBadge isActive={isActive} />
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm">
          <ActionButtons actions={actions} />
        </td>
      </tr>
    )
  }, [isDarkMode, handleEditCenter, handleToggleCenterStatus])

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] overflow-x-hidden">
      {/* Fixed Header Section */}
      <div className="flex-none space-y-4">
        {/* Page Header */}
        <PageHeader
          title="Radiology Centers Management"
          description="Manage and add registered radiology centers in the system"
          action={{
            label: 'Add New Center',
            onClick: handleAddCenter,
            icon: FaPlus,
            gradient: 'from-teal-600 to-cyan-600'
          }}
        />

        {/* Search and Filters with View Toggle */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex-1 w-full md:w-auto">
              <FilterBar
                searchTerm={searchTerm}
                onSearchChange={handleSearch}
                debouncedSearchTerm={debouncedSearchTerm}
                filters={filters}
                onClearFilters={clearFilters}
                filtering={filtering}
                searchPlaceholder="Search for center..."
              />
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'list' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                title="List View"
              >
                <FaList className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'map' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('map')}
                title="Map View"
              >
                <FaMap className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Scrollable Content Section */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden my-4">
        {/* List View */}
        {viewMode === 'list' && (
          <DataTable
            columns={columns}
            data={centers}
            renderRow={renderRow}
            loading={filtering}
            emptyMessage="No radiology centers yet"
            emptyIcon={FaXRay}
            emptyTitle="No radiology centers found"
            hasFilters={!!(searchTerm || filterCity || filterStatus)}
          />
        )}

        {/* Map View */}
        {viewMode === 'map' && (
          <div>
            {filtering ? (
              <div className="flex justify-center items-center py-12">
                <LoadingSpinner />
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <h3 className={`text-lg font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Radiology Center Locations
                  </h3>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {centers.length} {centers.length === 1 ? 'center' : 'centers'} found
                  </p>
                </div>
                <MultiLocationMap
                  locations={centers.map(center => ({
                    id: center.userId,
                    name: center.centerName,
                    coordinates: center.coordinates,
                    address: center.location || center.city,
                    data: center
                  }))}
                  onMarkerClick={(location) => {
                    setSelectedCenter(location.data)
                    setShowDetailsModal(true)
                  }}
                  height={500}
                  isDarkMode={isDarkMode}
                />
              </>
            )}
          </div>
        )}
      </div>

      {/* Fixed Pagination Section */}
      <div className="flex-none pb-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Add Center Modal */}
      <RadiologyModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleCenterSave}
      />

      {/* Edit Center Modal */}
      <RadiologyModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedCenter(null)
        }}
        center={selectedCenter}
        onSave={handleCenterSave}
      />

      {/* Center Details Modal */}
      <RadiologyDetailsModal
        isOpen={showDetailsModal}
        center={selectedCenter}
        onClose={() => {
          setShowDetailsModal(false)
          setSelectedCenter(null)
        }}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false)
          setSelectedCenter(null)
          setConfirmAction(null)
        }}
        onConfirm={executeToggleStatus}
        item={selectedCenter}
        action={confirmAction}
        itemName={selectedCenter?.name}
        itemType="Radiology Center"
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

export default RadiologyManagement