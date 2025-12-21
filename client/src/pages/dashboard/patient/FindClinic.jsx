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
  FaList
} from 'react-icons/fa'
import { 
  PageHeader, 
  Button, 
  LoadingSpinner,
  FilterBar,
  DataTable,
  ClinicDetailsModal,
  BookAppointmentModal,
  Toast,
  Card,
  MultiLocationMap
} from '../../../components'
import { useTheme } from '../../../contexts/ThemeContext'
import { clinicsAPI, appointmentsAPI } from '../../../services/api'
import { sortByDistance, formatDistance } from '../../../utils/geoUtils'

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

  // Get user location on mount with shorter timeout
  useEffect(() => {
    let mounted = true

    const getLocation = async () => {
      if ('geolocation' in navigator) {
        // Create a timeout promise
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Location timeout')), 3000) // 3 second timeout
        })

        // Create the geolocation promise
        const geoPromise = new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (position) => resolve([position.coords.latitude, position.coords.longitude]),
            (error) => reject(error),
            {
              enableHighAccuracy: true,
              timeout: 3000,
              maximumAge: 0
            }
          )
        })

        try {
          const location = await Promise.race([geoPromise, timeoutPromise])
          if (mounted) {
            setUserLocation(location)
            setLocationChecked(true)
          }
        } catch (error) {
          if (mounted) {
            setUserLocation('failed')
            setLocationChecked(true)
          }
        }
      } else {
        if (mounted) {
          setUserLocation('failed')
          setLocationChecked(true)
        }
      }
    }

    getLocation()

    return () => {
      mounted = false
    }
  }, [])

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
      const address = clinic.address?.toLowerCase() || ''

      const matchesSearch = searchQuery === '' || 
        clinicName.includes(searchQuery.toLowerCase()) ||
        city.includes(searchQuery.toLowerCase()) ||
        address.includes(searchQuery.toLowerCase())

      const matchesCity = selectedCity === 'all' || clinic.city === selectedCity

      return matchesSearch && matchesCity
    })

    // Sort by distance if user location is available (and not failed)
    if (userLocation && Array.isArray(userLocation)) {
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
          <div className="w-10 h-10 rounded-full bg-linear-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
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
            {clinic.address || 'N/A'}
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
      throw err // Re-throw to let modal handle the error
    }
  }

  // Show loading while getting location
  if (!locationChecked) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Find a Clinic"
          description="Search and browse dental clinics"
        />
        <div className={`p-12 text-center rounded-lg ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <LoadingSpinner />
          <p className={`mt-4 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Getting your location...
          </p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Find a Clinic"
          description="Search and browse dental clinics"
        />
        <div className={`p-12 text-center rounded-lg ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <FaBuilding className={`mx-auto text-5xl mb-4 ${
            isDarkMode ? 'text-red-400' : 'text-red-600'
          }`} />
          <h3 className={`text-xl font-bold mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Error Loading Clinics
          </h3>
          <p className={`mb-4 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {error}
          </p>
          <Button onClick={fetchClinics}>
            Try Again
          </Button>
        </div>
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

      {/* Filters and View Toggle */}
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
