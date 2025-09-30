import { useState, useEffect } from 'react'
import { 
  FaXRay, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch, 
  FaFilter,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaCog
} from 'react-icons/fa'
import { Card, Button, Input, LoadingSpinner } from '../../../components'
import RadiologyModal from './RadiologyModal'

const RadiologyManagement = () => {
  const [centers, setCenters] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCity, setFilterCity] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedCenter, setSelectedCenter] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0
  })

  const cities = [
    { value: 'acre', label: 'Acre' },
    { value: 'al_bireh', label: 'Al-Bireh' },
    { value: 'beersheba', label: 'Beersheba' },
    { value: 'beit_hanoun', label: 'Beit Hanoun' },
    { value: 'beit_jala', label: 'Beit Jala' },
    { value: 'beit_lahia', label: 'Beit Lahia' },
    { value: 'beit_sahour', label: 'Beit Sahour' },
    { value: 'bethlehem', label: 'Bethlehem' },
    { value: 'deir_al_balah', label: 'Deir al-Balah' },
    { value: 'gaza', label: 'Gaza' },
    { value: 'haifa', label: 'Haifa' },
    { value: 'hebron', label: 'Hebron' },
    { value: 'jabalya', label: 'Jabalya' },
    { value: 'jaffa', label: 'Jaffa' },
    { value: 'jenin', label: 'Jenin' },
    { value: 'jericho', label: 'Jericho' },
    { value: 'jerusalem', label: 'Jerusalem' },
    { value: 'khan_yunis', label: 'Khan Yunis' },
    { value: 'lydd', label: 'Lydd' },
    { value: 'nablus', label: 'Nablus' },
    { value: 'nazareth', label: 'Nazareth' },
    { value: 'qalqilya', label: 'Qalqilya' },
    { value: 'rafah', label: 'Rafah' },
    { value: 'ramallah', label: 'Ramallah' },
    { value: 'ramla', label: 'Ramla' },
    { value: 'safad', label: 'Safad' },
    { value: 'salfit', label: 'Salfit' },
    { value: 'tiberias', label: 'Tiberias' },
    { value: 'tubas', label: 'Tubas' },
    { value: 'tulkarm', label: 'Tulkarm' }
  ]

  // Fetch centers
  const fetchCenters = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('dentify_access_token') || sessionStorage.getItem('dentify_access_token')
      
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(filterCity && { city: filterCity }),
        ...(filterStatus && { isActive: filterStatus })
      })

      const response = await fetch(`http://localhost:5000/api/radiology-centers?${params}`, {
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
        setCenters(data.data || [])
        setTotalPages(data.pagination?.pages || 1)
      } else {
        console.error('Failed to fetch centers:', data.message)
        setCenters([])
      }
    } catch (error) {
      console.error('Error fetching centers:', error)
      setCenters([])
    } finally {
      setLoading(false)
    }
  }

  // Fetch center statistics
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('dentify_access_token') || sessionStorage.getItem('dentify_access_token')
      
      const response = await fetch('http://localhost:5000/api/radiology-centers/stats/overview', {
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
        setStats(data.data || { total: 0, active: 0, inactive: 0 })
      } else {
        console.error('Failed to fetch stats:', data.message)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
      // Keep default stats in case of error
    }
  }

  useEffect(() => {
    fetchCenters()
    fetchStats()
  }, [currentPage, searchTerm, filterCity, filterStatus])

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

  const getCityLabel = (cityValue) => {
    const city = cities.find(c => c.value === cityValue)
    return city ? city.label : cityValue
  }

  const handleCenterSave = (savedCenter, action) => {
    if (action === 'created') {
      // Refresh the list to show new center
      fetchCenters()
      fetchStats()
    } else if (action === 'updated') {
      // Update the center in the current list
      setCenters(prev => prev.map(center => 
        center._id === savedCenter._id ? savedCenter : center
      ))
      fetchStats()
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
    if (!confirm(`Are you sure you want to ${center.isActive ? 'deactivate' : 'activate'} this radiology center?`)) {
      return
    }

    try {
      const token = localStorage.getItem('dentify_access_token') || sessionStorage.getItem('dentify_access_token')
      
      const response = await fetch(`http://localhost:5000/api/radiology-centers/${center._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isActive: !center.isActive
        })
      })

      const data = await response.json()

      if (data.success) {
        // Update the center in the current list
        setCenters(prev => prev.map(c => 
          c._id === center._id ? { ...c, isActive: !c.isActive } : c
        ))
        fetchStats()
      } else {
        alert('Failed to update center status: ' + data.message)
      }
    } catch (error) {
      console.error('Error updating center status:', error)
      alert('Network error. Please try again.')
    }
  }

  if (loading && centers.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Radiology Centers Management</h2>
          <p className="text-gray-600">Manage and add registered radiology centers in the system</p>
        </div>
        <Button
          onClick={handleAddCenter}
          className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-600"
        >
          <FaPlus className="w-4 h-4" />
          Add New Center
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Centers</p>
              <p className="text-3xl font-bold text-blue-800">{stats.total}</p>
            </div>
            <FaXRay className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Active Centers</p>
              <p className="text-3xl font-bold text-green-800">{stats.active}</p>
            </div>
            <FaCheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-medium">Inactive Centers</p>
              <p className="text-3xl font-bold text-red-800">{stats.inactive}</p>
            </div>
            <FaTimesCircle className="w-8 h-8 text-red-600" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search for center..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10"
            />
          </div>

          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={filterCity}
              onChange={handleCityFilter}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="">All Cities</option>
              {cities.map((city) => (
                <option key={city.value} value={city.value}>
                  {city.label}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <FaCog className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={filterStatus}
              onChange={handleStatusFilter}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          <Button
            onClick={clearFilters}
            variant="outline"
            className="flex items-center gap-2"
          >
            <FaFilter className="w-4 h-4" />
            Clear Filters
          </Button>
        </div>
      </Card>

      {/* Centers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {centers.map((center) => (
          <Card key={center._id} className="p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-100 rounded-lg">
                    <FaXRay className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{center.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        center.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {center.isActive ? (
                          <>
                            <FaCheckCircle className="w-3 h-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <FaTimesCircle className="w-3 h-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2">
                {/* Address */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FaMapMarkerAlt className="w-4 h-4" />
                  <span>{center.address?.street}, {getCityLabel(center.address?.city)}</span>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FaPhone className="w-4 h-4" />
                  <span>{center.phone?.full || `${center.phone?.countryCode}${center.phone?.number}`}</span>
                </div>

                {/* Email */}
                {center.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaEnvelope className="w-4 h-4" />
                    <span>{center.email}</span>
                  </div>
                )}

                {/* Working Hours */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FaClock className="w-4 h-4" />
                  <span>Working Hours: 09:00 - 17:00</span>
                </div>

                {/* Services Count */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">Services: {center.services?.length || 0}</span>
                  <span className="font-medium">Equipment: {center.equipment?.length || 0}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                <Button
                  onClick={() => setSelectedCenter(center)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <FaEye className="w-3 h-3" />
                  View
                </Button>
                <Button
                  onClick={() => handleEditCenter(center)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <FaEdit className="w-3 h-3" />
                  Edit
                </Button>
                <Button
                  onClick={() => handleToggleCenterStatus(center)}
                  variant="outline"
                  size="sm"
                  className={`flex items-center gap-1 ${
                    center.isActive 
                      ? 'text-red-600 hover:bg-red-50' 
                      : 'text-green-600 hover:bg-green-50'
                  }`}
                >
                  <FaTrash className="w-3 h-3" />
                  {center.isActive ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {centers.length === 0 && !loading && (
        <Card className="p-12 text-center">
          <FaXRay className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Radiology Centers Found</h3>
          <p className="text-gray-500 mb-4">No radiology centers match your search criteria</p>
          <Button
            onClick={handleAddCenter}
            className="bg-gradient-to-r from-teal-600 to-cyan-600"
          >
            Add New Center
          </Button>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            variant="outline"
            size="sm"
          >
            Previous
          </Button>
          
          <span className="flex items-center px-4 py-2 text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          
          <Button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            variant="outline"
            size="sm"
          >
            Next
          </Button>
        </div>
      )}

      {/* Modals */}
      <RadiologyModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleCenterSave}
      />

      <RadiologyModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        center={selectedCenter}
        onSave={handleCenterSave}
      />
    </div>
  )
}

export default RadiologyManagement