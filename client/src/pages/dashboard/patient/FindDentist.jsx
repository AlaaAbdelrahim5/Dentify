import { useState, useEffect, useMemo } from 'react'
import { 
  FaSearch, 
  FaMapMarkerAlt, 
  FaStethoscope,
  FaUserMd,
  FaUser,
  FaCalendarPlus,
  FaEye,
  FaBuilding,
  FaEnvelope,
  FaPhone
} from 'react-icons/fa'
import { 
  PageHeader, 
  Button, 
  LoadingSpinner,
  ErrorState,
  FilterBar,
  DataTable,
  BookAppointmentModal,
  Toast,
  ClinicDetailsModal,
  DentistDetailsModal,
  DentistCard
} from '../../../components'
import { useTheme } from '../../../contexts/ThemeContext'
import { dentistsAPI, appointmentsAPI } from '../../../services/api'
import { sortByDistance, formatDistance } from '../../../utils/geoUtils'

const FindDoctor = () => {
  const { isDarkMode } = useTheme()
  const [doctors, setDoctors] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filtering, setFiltering] = useState(false)
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const [error, setError] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [viewMode, setViewMode] = useState('table') // 'table' or 'grid'
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('all')
  const [selectedLocation, setSelectedLocation] = useState('all')
  
  // Modal states
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [selectedClinic, setSelectedClinic] = useState(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showClinicDetailsModal, setShowClinicDetailsModal] = useState(false)
  const [toast, setToast] = useState(null)

  // Fetch data when filters change
  useEffect(() => {
    if (!isFirstLoad) {
      fetchDoctors(true)
    }
  }, [searchQuery, selectedSpecialty, selectedLocation])

  // Initial load
  useEffect(() => {
    fetchDoctors()
    
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude])
        },
        (error) => {
          
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000
        }
      )
    }
  }, [])

  const fetchDoctors = async (isFiltering = false) => {
    try {
      if (isFiltering) {
        setFiltering(true)
      } else {
        setIsLoading(true)
      }
      setError(null)
      
      const response = await dentistsAPI.getAll({ limit: 1000, status: 'active' })
      
      const dentistsData = response.dentists || response.data || response || []
      setDoctors(dentistsData)
    } catch (err) {
      console.error('Error fetching doctors:', err)
      setError('Failed to load doctors. Please try again later.')
      setDoctors([])
    } finally {
      if (isFiltering) {
        setFiltering(false)
      } else {
        setIsLoading(false)
        setIsFirstLoad(false)
      }
    }
  }

  // Get unique specialties from doctors
  const specialties = useMemo(() => {
    const specs = [...new Set(doctors.map(d => d.specialty).filter(Boolean))]
    return specs.sort()
  }, [doctors])

  // Get unique locations from doctors
  const locations = useMemo(() => {
    const locs = [...new Set(doctors.map(d => d.clinic?.city).filter(Boolean))]
    return locs.sort()
  }, [doctors])

  // Filtered dentists
  const filteredDoctors = useMemo(() => {
    const filtered = doctors.filter(doctor => {
      const fullName = `${doctor.firstName} ${doctor.lastName}`.toLowerCase()
      const clinicName = doctor.clinic?.clinicName?.toLowerCase() || ''
      const specialty = doctor.specialty || ''
      const location = doctor.clinic?.city || ''

      const matchesSearch = searchQuery === '' || 
        fullName.includes(searchQuery.toLowerCase()) ||
        clinicName.includes(searchQuery.toLowerCase()) ||
        specialty.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesSpecialty = selectedSpecialty === 'all' || doctor.specialty === selectedSpecialty

      const matchesLocation = selectedLocation === 'all' || doctor.clinic?.city === selectedLocation

      return matchesSearch && matchesSpecialty && matchesLocation
    })
    
    // Sort by clinic distance from user if location is available, then alphabetically
    if (userLocation) {
      // Map doctors to include clinic coordinates and full name for sorting
      const doctorsWithClinicLocations = filtered.map(doctor => ({
        ...doctor,
        coordinates: doctor.clinic?.coordinates,
        fullName: `${doctor.firstName} ${doctor.lastName}`
      }))
      
      const sorted = sortByDistance(doctorsWithClinicLocations, userLocation, 'fullName')
      
      return sorted
    }
    
    // If no user location, sort alphabetically by dentist name
    return filtered.sort((a, b) => {
      const nameA = `${a.firstName} ${a.lastName}`.toLowerCase()
      const nameB = `${b.firstName} ${b.lastName}`.toLowerCase()
      return nameA.localeCompare(nameB)
    })
  }, [doctors, searchQuery, selectedSpecialty, selectedLocation, userLocation])

  const handleClearFilters = () => {
    setSearchQuery('')
    setSelectedSpecialty('all')
    setSelectedLocation('all')
  }

  // Filter configuration
  const filters = [
    {
      value: selectedSpecialty,
      onChange: (e) => setSelectedSpecialty(e.target.value),
      options: [
        { value: 'all', label: 'All Specialties' },
        ...specialties.map(spec => ({ value: spec, label: spec }))
      ],
      placeholder: 'Filter by Specialty'
    },
    {
      value: selectedLocation,
      onChange: (e) => setSelectedLocation(e.target.value),
      options: [
        { value: 'all', label: 'All Locations' },
        ...locations.map(loc => ({ value: loc, label: loc }))
      ],
      placeholder: 'Filter by Location'
    }
  ]

  // Table columns
  const tableColumns = [
    { key: 'dentist', label: 'Dentist' },
    { key: 'clinic', label: 'Clinic' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone Number' },
    { key: 'actions', label: 'Actions', className: 'text-right' }
  ]

  // Table row renderer
  const renderTableRow = (doctor, index) => (
    <tr 
      key={doctor.id}
      className={`transition-colors ${
        isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
      }`}
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-linear-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
            <FaUser className="text-white text-sm" />
          </div>
          <div>
            <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Dr. {doctor.firstName} {doctor.lastName}
            </div>
            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {doctor.specialty || 'General Dentistry'}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div>
          <div className={`font-medium flex items-center gap-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <FaBuilding className="text-teal-500 text-sm" />
            {doctor.clinic?.clinicName || 'N/A'}
          </div>
          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {doctor.clinic?.city || 'N/A'}
          </div>
          {doctor.distance !== undefined && doctor.distance !== Infinity && (
            <div className="mt-1">
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                isDarkMode ? 'bg-teal-500/20 text-teal-300' : 'bg-teal-50 text-teal-700'
              }`}>
                📍 {formatDistance(doctor.distance)}
              </span>
            </div>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <FaEnvelope className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {doctor.user?.email || 'N/A'}
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <FaPhone className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {doctor.user?.phone || 'N/A'}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setSelectedDoctor(doctor)
              setShowDetailsModal(true)
            }}
            title="View Details"
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            <FaEye className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleBookAppointment(doctor)}
            title="Book Appointment"
            className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 dark:hover:bg-teal-900/20"
          >
            <FaCalendarPlus className="w-4 h-4" />
          </Button>
        </div>
      </td>
    </tr>
  )

  const handleBookAppointment = (doctor) => {
    setSelectedDoctor(doctor)
    setShowBookingModal(true)
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

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Find a Dentist"
          description="Search and browse qualified dentists"
        />
        <ErrorState
          message={error}
          onRetry={fetchDoctors}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Find a Dentist"
        description="Search and browse qualified dentists"
      />

      {/* Filters */}
      <FilterBar
        searchTerm={searchQuery}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
        searchPlaceholder="Search by dentist name, clinic, or specialty..."
        filtering={filtering}
        filters={filters}
        onClearFilters={handleClearFilters}
      />

      {/* View Toggle */}
      <div className="flex justify-end">
        <div className={`inline-flex rounded-lg border ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <button
            onClick={() => setViewMode('table')}
            className={`px-4 py-2 text-sm font-medium rounded-l-lg transition-colors ${
              viewMode === 'table'
                ? isDarkMode
                  ? 'bg-teal-600 text-white'
                  : 'bg-teal-50 text-teal-700'
                : isDarkMode
                ? 'text-gray-400 hover:text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Table View
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-4 py-2 text-sm font-medium rounded-r-lg transition-colors ${
              viewMode === 'grid'
                ? isDarkMode
                  ? 'bg-teal-600 text-white'
                  : 'bg-teal-50 text-teal-700'
                : isDarkMode
                ? 'text-gray-400 hover:text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Grid View
          </button>
        </div>
      </div>

      {/* Dentists Display */}
      {viewMode === 'grid' ? (
        isLoading || filtering ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className={`h-96 rounded-lg ${
                isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
              } animate-pulse`} />
            ))}
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className={`p-12 text-center rounded-lg ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <FaUserMd className={`mx-auto text-5xl mb-4 ${
              isDarkMode ? 'text-gray-600' : 'text-gray-400'
            }`} />
            <h3 className={`text-xl font-bold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              No Dentists Found
            </h3>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              {searchQuery !== '' || selectedSpecialty !== 'all' || selectedLocation !== 'all'
                ? 'Try adjusting your filters'
                : 'No dentists available at the moment'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => (
              <DentistCard
                key={doctor.id}
                doctor={doctor}
                layout="grid"
                onViewProfile={() => {
                  setSelectedDoctor(doctor)
                  setShowDetailsModal(true)
                }}
                onBookAppointment={() => handleBookAppointment(doctor)}
              />
            ))}
          </div>
        )
      ) : (
        <DataTable
          columns={tableColumns}
          data={filteredDoctors}
          renderRow={renderTableRow}
          loading={isLoading || filtering}
          emptyMessage="No dentists found matching your criteria"
          emptyIcon={FaUserMd}
          emptyTitle="No Dentists Found"
          hasFilters={searchQuery !== '' || selectedSpecialty !== 'all' || selectedLocation !== 'all'}
        />
      )}

      {/* Modals */}
      <BookAppointmentModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        onSave={handleBookingSuccess}
        preselectedDoctor={selectedDoctor}
      />

      {/* Dentist Details Modal */}
      <DentistDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false)
          setSelectedDoctor(null)
        }}
        dentistData={selectedDoctor}
      />

      {/* Clinic Details Modal */}
      {showClinicDetailsModal && selectedClinic && (
        <ClinicDetailsModal
          isOpen={showClinicDetailsModal}
          onClose={() => {
            setShowClinicDetailsModal(false)
            setSelectedClinic(null)
          }}
          clinic={selectedClinic}
        />
      )}

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

export default FindDoctor
