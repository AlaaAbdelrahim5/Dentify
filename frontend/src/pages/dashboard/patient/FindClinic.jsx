import { useState, useEffect, useMemo } from 'react'
import { 
  FaSearch, 
  FaMapMarkerAlt, 
  FaBuilding,
  FaPhone,
  FaEnvelope,
  FaEye,
  FaCalendarPlus,
  FaMap,
  FaList,
  FaTh,
  FaExclamationCircle,
  FaRedo,
  FaCheckCircle,
  FaInfoCircle
} from 'react-icons/fa'
import { 
  PageHeader, 
  Button, 
  LoadingSpinner,
  ErrorState,
  FilterBar,
  DataTable,
  ClinicDetailsModal,
  BookAppointmentModal,
  Toast,
  Card,
  MultiLocationMap,
  ClinicCard
} from '../../../components'
import { useTheme } from '../../../contexts/ThemeContext'
import { clinicsAPI, appointmentsAPI } from '../../../services/api'
import { sortByDistance, formatDistance } from '../../../utils/geoUtils'
import { getImageUrl } from '../../../utils/helpers'

const FindClinic = () => {
  const { isDarkMode } = useTheme()
  const [clinics, setClinics] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filtering, setFiltering] = useState(false)
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const [error, setError] = useState(null)
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState('all')
  
  // Modal states
  const [selectedClinic, setSelectedClinic] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [selectedDentist, setSelectedDentist] = useState(null)
  const [toast, setToast] = useState(null)
  const [viewMode, setViewMode] = useState('list') // 'list' or 'map'
  const [userLocation, setUserLocation] = useState(null)
  const [locationChecked, setLocationChecked] = useState(false)
  const [locationError, setLocationError] = useState(null)
  const [isRetryingLocation, setIsRetryingLocation] = useState(false)

  // Get user location on mount
  useEffect(() => {
    getLocationWithRetry()
  }, [])

  // Function to get user location with better error handling
  const getLocationWithRetry = async (isRetry = false) => {
    if (isRetry) {
      setIsRetryingLocation(true)
    }

    try {
      if (!('geolocation' in navigator)) {
        setLocationError('Geolocation is not supported by your browser')
        setUserLocation(null)
        setLocationChecked(true)
        if (isRetry) setIsRetryingLocation(false)
        return
      }

      // Create a timeout promise (increased to 10 seconds for better reliability)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Location request timed out')), 10000)
      })

      // Create the geolocation promise
      const geoPromise = new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => resolve([position.coords.latitude, position.coords.longitude]),
          (error) => reject(error),
          {
            enableHighAccuracy: false, // Changed to false for faster response
            timeout: 10000,
            maximumAge: 60000 // Allow cached position up to 1 minute
          }
        )
      })

      const location = await Promise.race([geoPromise, timeoutPromise])
      setUserLocation(location)
      setLocationError(null)
      setLocationChecked(true)
      
      if (isRetry) {
        setToast({
          type: 'success',
          message: 'Location detected successfully! Distances are now shown.'
        })
      }
    } catch (error) {
      console.error('Geolocation error:', error)
      
      let errorMessage = 'Unable to get your location'
      
      if (error.code === 1) {
        errorMessage = 'Location permission denied. Please enable location access to see distances.'
      } else if (error.code === 2) {
        errorMessage = 'Location unavailable. Please check your device settings.'
      } else if (error.code === 3 || error.message.includes('timeout')) {
        errorMessage = 'Location request timed out. Click retry to try again.'
      }
      
      setLocationError(errorMessage)
      setUserLocation(null)
      setLocationChecked(true)
      
      if (!isRetry) {
        // Only show toast on initial load if it fails
        setToast({
          type: 'warning',
          message: errorMessage
        })
      }
    } finally {
      if (isRetry) {
        setIsRetryingLocation(false)
      }
    }
  }

  // Fetch clinics after location is determined
  useEffect(() => {
    if (locationChecked && isFirstLoad) {
      fetchClinics()
    }
  }, [locationChecked])

  // Fetch data when filters change (after first load)
  useEffect(() => {
    if (!isFirstLoad) {
      fetchClinics(true)
    }
  }, [searchQuery, selectedCity])

  const fetchClinics = async (isFiltering = false) => {
    try {
      if (isFiltering) {
        setFiltering(true)
      } else {
        setIsLoading(true)
      }
      setError(null)
      
      const response = await clinicsAPI.getAll()
      
      const clinicsData = response.clinics || response.data || response || []
      setClinics(clinicsData)
    } catch (err) {
      console.error('Error fetching clinics:', err)
      setError('Failed to load clinics. Please try again later.')
      setClinics([])
    } finally {
      if (isFiltering) {
        setFiltering(false)
      } else {
        setIsLoading(false)
        setIsFirstLoad(false)
      }
    }
  }

  // Get unique cities from clinics
  const cities = useMemo(() => {
    const cityList = [...new Set(clinics.map(c => c.city).filter(Boolean))]
    return cityList.sort()
  }, [clinics])

  // Filtered and sorted clinics
  const filteredClinics = useMemo(() => {
    const filtered = clinics.filter(clinic => {
      const clinicName = clinic.clinicName?.toLowerCase() || ''
      const city = clinic.city?.toLowerCase() || ''
      const location = (clinic.location || clinic.address)?.toLowerCase() || ''

      const matchesSearch = searchQuery === '' || 
        clinicName.includes(searchQuery.toLowerCase()) ||
        city.includes(searchQuery.toLowerCase()) ||
        location.includes(searchQuery.toLowerCase())

      const matchesCity = selectedCity === 'all' || clinic.city === selectedCity
      
      // Only show active clinics
      const isActive = clinic.status?.toLowerCase() === 'active' || clinic.user?.status?.toLowerCase() === 'active'

      return matchesSearch && matchesCity && isActive
    })

    // Sort by distance if user location is available
    if (userLocation && Array.isArray(userLocation) && userLocation.length === 2) {
      const sorted = sortByDistance(filtered, userLocation, 'clinicName')
      return sorted
    }

    // If no user location, sort alphabetically by clinic name
    return filtered.sort((a, b) => {
      const nameA = (a.clinicName || '').toLowerCase()
      const nameB = (b.clinicName || '').toLowerCase()
      return nameA.localeCompare(nameB)
    })
  }, [clinics, searchQuery, selectedCity, userLocation])

  const handleClearFilters = () => {
    setSearchQuery('')
    setSelectedCity('all')
  }

  // Filter configuration
  const filters = [
    {
      value: selectedCity,
      onChange: (e) => setSelectedCity(e.target.value),
      options: [
        { value: 'all', label: 'All Locations' },
        ...cities.map(city => ({ value: city, label: city }))
      ],
      placeholder: 'Filter by Location'
    }
  ]

  // Table columns
  const tableColumns = [
    { key: 'clinic', label: 'Clinic' },
    { key: 'location', label: 'Location' },
    { key: 'contact', label: 'Contact' },
    { key: 'actions', label: 'Actions', className: 'text-right' }
  ]

  // Table row renderer
  const renderTableRow = (clinic, index) => (
    <tr 
      key={clinic.id}
      className={`transition-colors ${
        isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
      }`}
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          {clinic.user?.profileImage ? (
            <img
              src={getImageUrl(clinic.user.profileImage)}
              alt={clinic.clinicName}
              className="w-10 h-10 rounded-full object-cover"
              onError={(e) => {
                e.target.onerror = null
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'flex'
              }}
            />
          ) : null}
          <div 
            className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center"
            style={{ display: clinic.user?.profileImage ? 'none' : 'flex' }}
          >
            <FaBuilding className="text-white text-sm" />
          </div>
          <div>
            <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {clinic.clinicName}
            </div>
            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {clinic.registrationNumber || 'N/A'}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div>
          <div className={`font-medium flex items-center gap-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <FaMapMarkerAlt className="text-teal-500 text-sm" />
            {clinic.city || 'N/A'}
          </div>
          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {clinic.location || clinic.address || 'N/A'}
          </div>
          {clinic.distance !== undefined && clinic.distance !== Infinity && (
            <div className="mt-1">
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                isDarkMode ? 'bg-teal-500/20 text-teal-300' : 'bg-teal-50 text-teal-700'
              }`}>
                📍 {formatDistance(clinic.distance)}
              </span>
            </div>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FaEnvelope className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <span className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {clinic.user?.email || 'N/A'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FaPhone className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <span className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {clinic.user?.phone || 'N/A'}
            </span>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleViewDetails(clinic)}
            title="View Details"
          >
            <FaEye className="w-4 h-4" />
          </Button>
        </div>
      </td>
    </tr>
  )

  const handleViewDetails = (clinic) => {
    setSelectedClinic(clinic)
    setShowDetailsModal(true)
  }

  const handleBookAppointment = (dentist) => {
    setSelectedDentist(dentist)
    setShowBookingModal(true)
    setShowDetailsModal(false) // Close clinic details modal
  }

  const handleBookingSuccess = async (appointmentData) => {
    try {
      await appointmentsAPI.create(appointmentData)
      setShowBookingModal(false)
      setToast({ message: 'Appointment booked successfully!', type: 'success' })
    } catch (err) {
      console.error('Error booking appointment:', err)
      setToast({ message: 'Failed to book appointment. Please try again.', type: 'error' })
      throw err // Re-throw to let modal handle the error
    }
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Find a Clinic"
          description="Search and browse dental clinics"
        />
        <ErrorState
          message={error}
          onRetry={fetchClinics}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Find a Clinic"
        description="Search and browse dental clinics"
      />

      {/* Location Status Banner */}
      {locationChecked && locationError && (
        <Card className={`p-4 border-l-4 ${
          isDarkMode 
            ? 'bg-yellow-900/20 border-yellow-500' 
            : 'bg-yellow-50 border-yellow-500'
        }`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <FaExclamationCircle className={`mt-0.5 ${
                isDarkMode ? 'text-yellow-400' : 'text-yellow-600'
              }`} />
              <div>
                <h4 className={`font-semibold mb-1 ${
                  isDarkMode ? 'text-yellow-300' : 'text-yellow-800'
                }`}>
                  Location Access Unavailable
                </h4>
                <p className={`text-sm ${
                  isDarkMode ? 'text-yellow-200' : 'text-yellow-700'
                }`}>
                  {locationError}
                </p>
                <p className={`text-xs mt-1 ${
                  isDarkMode ? 'text-yellow-300/70' : 'text-yellow-600'
                }`}>
                  Distances to clinics cannot be shown without your location.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => getLocationWithRetry(true)}
              disabled={isRetryingLocation}
              className={isDarkMode ? 'border-yellow-500 text-yellow-400 hover:bg-yellow-500/10' : 'border-yellow-600 text-yellow-700 hover:bg-yellow-100'}
            >
              {isRetryingLocation ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Retrying...
                </>
              ) : (
                <>
                  <FaRedo className="mr-2" />
                  Retry
                </>
              )}
            </Button>
          </div>
        </Card>
      )}


      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex-1 w-full md:w-auto">
            <FilterBar
              searchTerm={searchQuery}
              onSearchChange={(e) => setSearchQuery(e.target.value)}
              searchPlaceholder="Search by clinic name, city, or address..."
              filtering={filtering}
              filters={filters}
              onClearFilters={handleClearFilters}
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
              variant={viewMode === 'grid' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <FaTh className="w-4 h-4" />
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

      {/* List View */}
      {viewMode === 'list' && (
        <DataTable
          columns={tableColumns}
          data={filteredClinics}
          renderRow={renderTableRow}
          loading={isLoading || filtering}
          emptyMessage="No clinics found matching your criteria"
          emptyIcon={FaBuilding}
          emptyTitle="No Clinics Found"
          hasFilters={searchQuery !== '' || selectedCity !== 'all'}
        />
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        isLoading || filtering ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className={`h-96 rounded-lg ${
                isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
              } animate-pulse`} />
            ))}
          </div>
        ) : filteredClinics.length === 0 ? (
          <div className={`p-12 text-center rounded-lg ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <FaBuilding className={`mx-auto text-5xl mb-4 ${
              isDarkMode ? 'text-gray-600' : 'text-gray-400'
            }`} />
            <h3 className={`text-xl font-bold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              No Clinics Found
            </h3>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              {searchQuery !== '' || selectedCity !== 'all'
                ? 'Try adjusting your filters'
                : 'No clinics available at the moment'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClinics.map((clinic) => (
              <ClinicCard
                key={clinic.id}
                clinic={clinic}
                layout="grid"
                onViewDetails={() => handleViewDetails(clinic)}
                onBookAppointment={() => {
                  setSelectedClinic(clinic)
                  setShowDetailsModal(true)
                }}
              />
            ))}
          </div>
        )
      )}

      {/* Map View */}
      {viewMode === 'map' && (
        <Card className="p-4">
          {isLoading || filtering ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              <div className="mb-4">
                <h3 className={`text-lg font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Clinic Locations
                </h3>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {filteredClinics.length} {filteredClinics.length === 1 ? 'clinic' : 'clinics'} found
                </p>
              </div>
              <MultiLocationMap
                locations={filteredClinics.map(clinic => ({
                  id: clinic.userId || clinic.id,
                  name: clinic.clinicName,
                  coordinates: clinic.coordinates,
                  address: clinic.location || clinic.city,
                  data: clinic
                }))}
                onMarkerClick={(location) => handleViewDetails(location.data)}
                height={500}
                isDarkMode={isDarkMode}
                userLocationProp={Array.isArray(userLocation) ? userLocation : null}
              />
            </>
          )}
        </Card>
      )}

      {/* Modals */}
      <ClinicDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        clinic={selectedClinic}
        onBookAppointment={handleBookAppointment}
      />

      <BookAppointmentModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        onSave={handleBookingSuccess}
        preselectedDoctor={selectedDentist}
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

export default FindClinic
