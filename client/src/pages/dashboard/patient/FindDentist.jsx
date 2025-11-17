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
  FilterBar,
  DataTable
} from '../../../components'
import BookAppointmentModal from '../../../components/patient/BookAppointmentModal'
import { useTheme } from '../../../contexts/ThemeContext'
import { dentistsAPI, appointmentsAPI } from '../../../services/api'

const FindDoctor = () => {
  const { isDarkMode } = useTheme()
  const [doctors, setDoctors] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('all')
  const [selectedLocation, setSelectedLocation] = useState('all')
  
  // Modal states
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [showBookingModal, setShowBookingModal] = useState(false)

  // Fetch doctors on component mount
  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await dentistsAPI.getAll({ limit: 1000, includeAll: 'true' })
      console.log('Fetched doctors:', response)
      
      const dentistsData = response.dentists || response.data || response || []
      setDoctors(dentistsData)
    } catch (err) {
      console.error('Error fetching doctors:', err)
      setError('Failed to load doctors. Please try again later.')
      setDoctors([])
    } finally {
      setIsLoading(false)
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
    return doctors.filter(doctor => {
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
  }, [doctors, searchQuery, selectedSpecialty, selectedLocation])

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
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
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
      // Optionally show a success message
      alert('Appointment booked successfully!')
    } catch (err) {
      console.error('Error booking appointment:', err)
      throw err // Re-throw to let modal handle the error
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Find a Dentist"
          description="Search and browse qualified dentists"
        />
        <div className="flex justify-center items-center h-96">
          <LoadingSpinner />
        </div>
      </div>
    )
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
        filters={filters}
        onClearFilters={handleClearFilters}
      />

      {/* Dentists Table */}
      <DataTable
        columns={tableColumns}
        data={filteredDoctors}
        renderRow={renderTableRow}
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
    </div>
  )
}

export default FindDoctor
