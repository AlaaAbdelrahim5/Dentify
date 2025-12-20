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
  FaPhone,
  FaTimes,
  FaIdCard
} from 'react-icons/fa'
import { 
  PageHeader, 
  Button, 
  LoadingSpinner,
  FilterBar,
  DataTable,
  BookAppointmentModal,
  Toast,
  ClinicDetailsModal
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
          console.log('Location access denied:', error)
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
      console.log('Fetched doctors:', response)
      
      const dentistsData = response.dentists || response.data || response || []
      console.log('Dentists data:', dentistsData)
      console.log('Sample clinic coordinates:', dentistsData[0]?.clinic?.coordinates)
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
      console.log('User location for sorting:', userLocation)
      // Map doctors to include clinic coordinates and full name for sorting
      const doctorsWithClinicLocations = filtered.map(doctor => ({
        ...doctor,
        coordinates: doctor.clinic?.coordinates,
        fullName: `${doctor.firstName} ${doctor.lastName}`
      }))
      
      console.log('Doctors with clinic coordinates:', doctorsWithClinicLocations.map(d => ({ 
        name: d.fullName, 
        coordinates: d.coordinates 
      })))
      
      const sorted = sortByDistance(doctorsWithClinicLocations, userLocation, 'fullName')
      console.log('Sorted doctors with distances:', sorted.map(d => ({ 
        name: d.fullName, 
        distance: d.distance 
      })))
      
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
        <div className={`p-12 text-center rounded-lg ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <FaUserMd className={`mx-auto text-5xl mb-4 ${
            isDarkMode ? 'text-red-400' : 'text-red-600'
          }`} />
          <h3 className={`text-xl font-bold mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Error Loading Dentists
          </h3>
          <p className={`mb-4 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {error}
          </p>
          <Button onClick={fetchDoctors}>
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

      {/* Dentists Table */}
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

      {/* Modals */}
      <BookAppointmentModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        onSave={handleBookingSuccess}
        preselectedDoctor={selectedDoctor}
      />

      {/* Dentist Details Modal */}
      {showDetailsModal && selectedDoctor && (
        <div className="fixed inset-0 z-9999 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
              onClick={() => setShowDetailsModal(false)}
            />

            {/* Modal Panel */}
            <div className={`relative inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full z-50 ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              {/* Header */}
              <div className={`px-6 py-4 border-b flex items-center justify-between ${
                isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
              }`}>
                <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Dentist Details
                </h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                  }`}>
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 py-4 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Personal Information */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <FaUserMd className="text-teal-600" />
                    Personal Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Full Name</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">License Number</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedDoctor.licenseNumber || 'N/A'}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Email</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedDoctor.user?.email || 'N/A'}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Phone</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedDoctor.user?.phone || 'N/A'}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        selectedDoctor.user?.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {selectedDoctor.user?.status || 'N/A'}
                      </span>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">City</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedDoctor.city || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Specialization */}
                {selectedDoctor.specialization && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <FaStethoscope className="text-teal-600" />
                      Specialization
                    </h4>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(selectedDoctor.specialization) ? (
                          selectedDoctor.specialization.map((spec, idx) => (
                            <span key={idx} className="px-3 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-full text-sm font-medium">
                              {spec}
                            </span>
                          ))
                        ) : (
                          <span className="px-3 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-full text-sm font-medium">
                            {selectedDoctor.specialization}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Clinic Information */}
                {selectedDoctor.clinic && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <FaIdCard className="text-teal-600" />
                      Clinic Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Clinic Name</p>
                        <button
                          onClick={() => {
                            setSelectedClinic(selectedDoctor.clinic)
                            setShowDetailsModal(false)
                            setShowClinicDetailsModal(true)
                          }}
                          className="font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 hover:underline transition-colors text-left"
                        >
                          {selectedDoctor.clinic.clinicName || 'N/A'}
                        </button>
                      </div>
                      {selectedDoctor.clinic.address && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Address</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {selectedDoctor.clinic.address}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Bio */}
                {selectedDoctor.bio && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Biography</h4>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {selectedDoctor.bio}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className={`px-6 py-4 border-t flex justify-end gap-3 ${
                isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
              }`}>
                <Button
                  variant="outline"
                  onClick={() => setShowDetailsModal(false)}
                >
                  Close
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setShowDetailsModal(false)
                    handleBookAppointment(selectedDoctor)
                  }}
                  className="flex items-center gap-2"
                >
                  <FaCalendarPlus className="w-4 h-4" />
                  Book Appointment
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

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
