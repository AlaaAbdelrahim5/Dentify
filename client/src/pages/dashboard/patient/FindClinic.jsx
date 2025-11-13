import { useState, useEffect, useMemo } from 'react'
import { 
  FaSearch, 
  FaMapMarkerAlt, 
  FaBuilding,
  FaPhone,
  FaEnvelope,
  FaEye,
  FaCalendarPlus
} from 'react-icons/fa'
import { 
  PageHeader, 
  Button, 
  LoadingSpinner,
  FilterBar,
  DataTable
} from '../../../components'
import ClinicDetailsModal from '../../../components/patient/ClinicDetailsModal'
import BookAppointmentModal from '../../../components/patient/BookAppointmentModal'
import { useTheme } from '../../../contexts/ThemeContext'
import { clinicsAPI, appointmentsAPI } from '../../../services/api'

const FindClinic = () => {
  const { isDarkMode } = useTheme()
  const [clinics, setClinics] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState('all')
  
  // Modal states
  const [selectedClinic, setSelectedClinic] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [selectedDentist, setSelectedDentist] = useState(null)

  // Fetch clinics on component mount
  useEffect(() => {
    fetchClinics()
  }, [])

  const fetchClinics = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await clinicsAPI.getAll()
      console.log('Fetched clinics:', response)
      
      const clinicsData = response.clinics || response.data || response || []
      setClinics(clinicsData)
    } catch (err) {
      console.error('Error fetching clinics:', err)
      setError('Failed to load clinics. Please try again later.')
      setClinics([])
    } finally {
      setIsLoading(false)
    }
  }

  // Get unique cities from clinics
  const cities = useMemo(() => {
    const cityList = [...new Set(clinics.map(c => c.city).filter(Boolean))]
    return cityList.sort()
  }, [clinics])

  // Filtered clinics
  const filteredClinics = useMemo(() => {
    return clinics.filter(clinic => {
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
  }, [clinics, searchQuery, selectedCity])

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
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
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
          title="Find a Clinic"
          description="Search and browse dental clinics"
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

      {/* Filters */}
      <FilterBar
        searchTerm={searchQuery}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
        searchPlaceholder="Search by clinic name, city, or address..."
        filters={filters}
        onClearFilters={handleClearFilters}
      />

      {/* Clinics Table */}
      <DataTable
        columns={tableColumns}
        data={filteredClinics}
        renderRow={renderTableRow}
        emptyMessage="No clinics found matching your criteria"
        emptyIcon={FaBuilding}
        emptyTitle="No Clinics Found"
        hasFilters={searchQuery !== '' || selectedCity !== 'all'}
      />

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
    </div>
  )
}

export default FindClinic
