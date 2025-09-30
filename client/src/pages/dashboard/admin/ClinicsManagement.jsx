import { useState, useEffect } from 'react'
import { 
  FaHospital, 
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
  FaEye
} from 'react-icons/fa'
import { Card, Button, Input, LoadingSpinner } from '../../../components'
import ClinicModal from './ClinicModal'

const ClinicsManagement = () => {
  const [clinics, setClinics] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCity, setFilterCity] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedClinic, setSelectedClinic] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0
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

  // Fetch clinics
  const fetchClinics = async () => {
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

      const response = await fetch(`http://localhost:5000/api/clinics?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success) {
        setClinics(data.data)
        setTotalPages(data.pagination.pages)
      }
    } catch (error) {
      console.error('Error fetching clinics:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch clinic statistics
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('dentify_access_token') || sessionStorage.getItem('dentify_access_token')
      
      const response = await fetch('http://localhost:5000/api/clinics/stats/overview', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  useEffect(() => {
    fetchClinics()
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

  const getStatusColor = (isActive) => {
    return isActive ? 'text-green-600' : 'text-red-600'
  }

  const getStatusIcon = (isActive) => {
    return isActive ? FaCheckCircle : FaTimesCircle
  }

  const formatWorkingHours = (workingHours) => {
    if (!workingHours) return 'Not specified'
    
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    
    const openDays = days.filter(day => workingHours[day]?.isOpen)
    
    if (openDays.length === 0) return 'Closed'
    
    const firstDay = openDays[0]
    const firstDayHours = workingHours[firstDay]
    
    return `${firstDayHours.start} - ${firstDayHours.end}`
  }

  const getCityLabel = (cityValue) => {
    const city = cities.find(c => c.value === cityValue)
    return city ? city.label : cityValue
  }

  const handleClinicSave = (savedClinic, action) => {
    if (action === 'created') {
      // Refresh the list to show new clinic
      fetchClinics()
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
    if (!confirm(`Are you sure you want to ${clinic.isActive ? 'deactivate' : 'activate'} this clinic?`)) {
      return
    }

    try {
      const token = localStorage.getItem('dentify_access_token') || sessionStorage.getItem('dentify_access_token')
      
      const response = await fetch(`http://localhost:5000/api/clinics/${clinic._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isActive: !clinic.isActive
        })
      })

      const data = await response.json()

      if (data.success) {
        // Update the clinic in the current list
        setClinics(prev => prev.map(c => 
          c._id === clinic._id ? { ...c, isActive: !c.isActive } : c
        ))
        fetchStats()
      } else {
        alert('Failed to update clinic status: ' + data.message)
      }
    } catch (error) {
      console.error('Error updating clinic status:', error)
      alert('Network error. Please try again.')
    }
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Clinics Management</h2>
          <p className="text-gray-600">Manage and add registered clinics in the system</p>
        </div>
        <Button
          onClick={handleAddClinic}
          className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-600"
        >
          <FaPlus className="w-4 h-4" />
          Add New Clinic
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Clinics</p>
              <p className="text-3xl font-bold text-blue-800">{stats.total}</p>
            </div>
            <FaHospital className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Active Clinics</p>
              <p className="text-3xl font-bold text-green-800">{stats.active}</p>
            </div>
            <FaCheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-medium">Inactive Clinics</p>
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
              placeholder="Search for clinic..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10"
            />
          </div>

          <select
            value={filterCity}
            onChange={handleCityFilter}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="">All Cities</option>
            {cities.map(city => (
              <option key={city.value} value={city.value}>{city.label}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={handleStatusFilter}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>

          <Button
            onClick={() => {
              setSearchTerm('')
              setFilterCity('')
              setFilterStatus('')
              setCurrentPage(1)
            }}
            variant="outline"
            className="flex items-center gap-2"
          >
            <FaFilter className="w-4 h-4" />
            Clear Filters
          </Button>
        </div>
      </Card>

      {/* Clinics List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {clinics.map((clinic) => {
          const StatusIcon = getStatusIcon(clinic.isActive)
          return (
            <Card key={clinic._id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{clinic.name}</h3>
                    <StatusIcon className={`w-4 h-4 ${getStatusColor(clinic.isActive)}`} />
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{clinic.description || 'No description available'}</p>
                </div>
              </div>

              <div className="space-y-3">
                {/* Address */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FaMapMarkerAlt className="w-4 h-4 text-teal-600" />
                  <span>{clinic.address.fullAddress} - {getCityLabel(clinic.address.city)}</span>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FaPhone className="w-4 h-4 text-teal-600" />
                  <span>{clinic.phone.full}</span>
                </div>

                {/* Email */}
                {clinic.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaEnvelope className="w-4 h-4 text-teal-600" />
                    <span>{clinic.email}</span>
                  </div>
                )}

                {/* Working Hours */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FaClock className="w-4 h-4 text-teal-600" />
                  <span>Working Hours: {formatWorkingHours(clinic.workingHours)}</span>
                </div>

                {/* Doctors Count */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">Doctors: {clinic.doctors?.length || 0}</span>
                  <span className="font-medium">Secretaries: {clinic.secretaries?.length || 0}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                <Button
                  onClick={() => setSelectedClinic(clinic)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <FaEye className="w-3 h-3" />
                  View
                </Button>
                <Button
                  onClick={() => handleEditClinic(clinic)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <FaEdit className="w-3 h-3" />
                  Edit
                </Button>
                <Button
                  onClick={() => handleToggleClinicStatus(clinic)}
                  variant="outline"
                  size="sm"
                  className={`flex items-center gap-1 ${
                    clinic.isActive 
                      ? 'text-red-600 hover:bg-red-50' 
                      : 'text-green-600 hover:bg-green-50'
                  }`}
                >
                  <FaTrash className="w-3 h-3" />
                  {clinic.isActive ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </Card>
          )
        })}
      </div>

      {clinics.length === 0 && !loading && (
        <Card className="p-12 text-center">
          <FaHospital className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Clinics Found</h3>
          <p className="text-gray-500 mb-4">No clinics match your search criteria</p>
          <Button
            onClick={handleAddClinic}
            className="bg-gradient-to-r from-teal-600 to-cyan-600"
          >
            Add New Clinic
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

      {/* Loading overlay */}
      {loading && clinics.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-40">
          <LoadingSpinner />
        </div>
      )}

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
    </div>
  )
}

export default ClinicsManagement