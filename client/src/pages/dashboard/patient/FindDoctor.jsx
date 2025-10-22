import { useState, useEffect } from 'react'
import { 
  FaSearch, 
  FaFilter, 
  FaMapMarkerAlt, 
  FaStethoscope,
  FaTh,
  FaList,
  FaSlidersH,
  FaUserMd
} from 'react-icons/fa'
import { 
  PageHeader, 
  Input, 
  Select, 
  Button, 
  LoadingSpinner,
  Card
} from '../../../components'
import DoctorCard from '../../../components/DoctorCard'
import DoctorProfileModal from '../../../components/DoctorProfileModal'
import BookAppointmentModal from '../../../components/patient/BookAppointmentModal'
import { useTheme } from '../../../contexts/ThemeContext'
import { dentistsAPI } from '../../../services/api'

const FindDoctor = () => {
  const { isDarkMode } = useTheme()
  const [doctors, setDoctors] = useState([])
  const [filteredDoctors, setFilteredDoctors] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [layout, setLayout] = useState('grid') // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('name') // 'name', 'rating', 'experience'
  
  // Modal states
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showBookingModal, setShowBookingModal] = useState(false)

  // Fetch doctors on component mount
  useEffect(() => {
    fetchDoctors()
  }, [])

  // Apply filters whenever search criteria change
  useEffect(() => {
    applyFilters()
  }, [searchQuery, selectedSpecialty, selectedLocation, sortBy, doctors])

  const fetchDoctors = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await dentistsAPI.getAll()
      console.log('Fetched doctors:', response)
      
      // Extract dentists array from response
      const dentistsData = response.dentists || response.data || response || []
      setDoctors(dentistsData)
      setFilteredDoctors(dentistsData)
    } catch (err) {
      console.error('Error fetching doctors:', err)
      setError('Failed to load doctors. Please try again later.')
      setDoctors([])
      setFilteredDoctors([])
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...doctors]

    // Search filter (name)
    if (searchQuery) {
      filtered = filtered.filter(doctor => {
        const fullName = `${doctor.firstName} ${doctor.lastName}`.toLowerCase()
        return fullName.includes(searchQuery.toLowerCase())
      })
    }

    // Specialty filter
    if (selectedSpecialty) {
      filtered = filtered.filter(doctor => 
        doctor.specialty === selectedSpecialty
      )
    }

    // Location filter
    if (selectedLocation) {
      filtered = filtered.filter(doctor => 
        doctor.clinic?.city === selectedLocation
      )
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
        case 'rating':
          return (b.rating || 0) - (a.rating || 0)
        case 'experience':
          return (b.yearsOfExperience || 0) - (a.yearsOfExperience || 0)
        default:
          return 0
      }
    })

    setFilteredDoctors(filtered)
  }

  // Get unique specialties from doctors
  const getSpecialties = () => {
    const specialties = [...new Set(doctors.map(d => d.specialty).filter(Boolean))]
    return specialties.sort()
  }

  // Get unique locations from doctors
  const getLocations = () => {
    const locations = [...new Set(doctors.map(d => d.clinic?.city).filter(Boolean))]
    return locations.sort()
  }

  const handleViewProfile = (doctor) => {
    setSelectedDoctor(doctor)
    setShowProfileModal(true)
  }

  const handleBookAppointment = (doctor) => {
    setSelectedDoctor(doctor)
    setShowBookingModal(true)
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setSelectedSpecialty('')
    setSelectedLocation('')
    setSortBy('name')
  }

  const handleBookingSuccess = () => {
    setShowBookingModal(false)
    // Optionally show success message or redirect
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Find a Doctor"
          description="Search and browse qualified dentists"
        />
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Find a Doctor"
          description="Search and browse qualified dentists"
        />
        <Card className="p-8 text-center">
          <FaUserMd className={`mx-auto text-5xl mb-4 ${
            isDarkMode ? 'text-red-400' : 'text-red-600'
          }`} />
          <h3 className={`text-xl font-bold mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Error Loading Doctors
          </h3>
          <p className={`mb-4 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {error}
          </p>
          <Button onClick={fetchDoctors}>
            Try Again
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Modern Header with Gradient Background */}
      <div className={`relative overflow-hidden rounded-2xl p-8 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-800 via-gray-800 to-teal-900/30' 
          : 'bg-gradient-to-br from-white via-teal-50/50 to-cyan-50'
      } shadow-xl border ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className={`p-3 rounded-xl ${
                  isDarkMode 
                    ? 'bg-gradient-to-br from-teal-600 to-cyan-600' 
                    : 'bg-gradient-to-br from-teal-500 to-cyan-500'
                } shadow-lg`}>
                  <FaUserMd className="w-6 h-6 text-white" />
                </div>
                <h1 className={`text-3xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Find Your Perfect Dentist
                </h1>
              </div>
              <p className={`text-lg ml-16 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Discover and connect with {doctors.length} qualified dental professionals
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              {/* Layout Toggle with modern design */}
              <div className={`flex rounded-xl p-1 ${
                isDarkMode 
                  ? 'bg-gray-700/50 backdrop-blur-sm' 
                  : 'bg-white/80 backdrop-blur-sm shadow-md'
              }`}>
                <button
                  onClick={() => setLayout('grid')}
                  className={`p-3 rounded-lg transition-all duration-300 ${
                    layout === 'grid'
                      ? isDarkMode
                        ? 'bg-gradient-to-br from-teal-600 to-cyan-600 text-white shadow-lg scale-105'
                        : 'bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-lg scale-105'
                      : isDarkMode
                        ? 'text-gray-300 hover:bg-gray-600'
                        : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  title="Grid View"
                >
                  <FaTh className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setLayout('list')}
                  className={`p-3 rounded-lg transition-all duration-300 ${
                    layout === 'list'
                      ? isDarkMode
                        ? 'bg-gradient-to-br from-teal-600 to-cyan-600 text-white shadow-lg scale-105'
                        : 'bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-lg scale-105'
                      : isDarkMode
                        ? 'text-gray-300 hover:bg-gray-600'
                        : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  title="List View"
                >
                  <FaList className="w-5 h-5" />
                </button>
              </div>

              {/* Filter Toggle with enhanced styling */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                  showFilters
                    ? isDarkMode
                      ? 'bg-gradient-to-br from-teal-600 to-cyan-600 text-white shadow-lg'
                      : 'bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-lg'
                    : isDarkMode
                      ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-600 backdrop-blur-sm'
                      : 'bg-white/80 text-gray-700 hover:bg-gray-50 shadow-md backdrop-blur-sm'
                }`}
              >
                <FaSlidersH className={`transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
                <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -z-0" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl -z-0" />
      </div>

      {/* Enhanced Search and Filters Card */}
      <Card className={`p-6 transition-all duration-300 ${
        isDarkMode ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm'
      } shadow-xl border ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="space-y-6">
          {/* Search Bar with modern design */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-grow">
              <div className="relative">
                <Input
                  placeholder="Search by doctor name..."
                  icon={FaSearch}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-12"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300' 
                        : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative min-w-[200px]">
                <Select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  icon={FaStethoscope}
                  className="w-full"
                >
                  <option value="">All Specialties</option>
                  {getSpecialties().map(specialty => (
                    <option key={specialty} value={specialty}>
                      {specialty}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="relative min-w-[200px]">
                <Select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  icon={FaMapMarkerAlt}
                  className="w-full"
                >
                  <option value="">All Locations</option>
                  {getLocations().map(location => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>

          {/* Advanced Filters (Collapsible with animation) */}
          {showFilters && (
            <div className={`pt-6 border-t animate-slideDown ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                  <label className={`text-sm font-semibold flex items-center ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <FaFilter className="mr-2" />
                    Sort by:
                  </label>
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full sm:w-56"
                  >
                    <option value="name">📝 Name (A-Z)</option>
                    <option value="rating">⭐ Highest Rated</option>
                    <option value="experience">🎓 Most Experienced</option>
                  </Select>
                </div>

                {(searchQuery || selectedSpecialty || selectedLocation) && (
                  <button
                    onClick={handleClearFilters}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 ${
                      isDarkMode
                        ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30'
                        : 'bg-red-50 text-red-600 hover:bg-red-100'
                    }`}
                  >
                    ✕ Clear All Filters
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Active Filters Summary with enhanced design */}
          {(searchQuery || selectedSpecialty || selectedLocation) && (
            <div className={`flex flex-wrap items-center gap-3 pt-3 p-4 rounded-xl ${
              isDarkMode ? 'bg-teal-600/10' : 'bg-teal-50'
            }`}>
              <span className={`text-sm font-semibold flex items-center ${
                isDarkMode ? 'text-teal-400' : 'text-teal-700'
              }`}>
                <FaFilter className="mr-2" />
                Active filters:
              </span>
              {searchQuery && (
                <span className={`group px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-teal-600/30 to-cyan-600/30 text-teal-300 border border-teal-600/50' 
                    : 'bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-800 border border-teal-200'
                } shadow-md`}>
                  🔍 "{searchQuery}"
                </span>
              )}
              {selectedSpecialty && (
                <span className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/30 text-purple-300 border border-purple-600/50' 
                    : 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-200'
                } shadow-md`}>
                  🩺 {selectedSpecialty}
                </span>
              )}
              {selectedLocation && (
                <span className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-blue-600/30 to-indigo-600/30 text-blue-300 border border-blue-600/50' 
                    : 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200'
                } shadow-md`}>
                  📍 {selectedLocation}
                </span>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Results Section */}
      {filteredDoctors.length === 0 ? (
        <Card className={`p-16 text-center transition-all duration-300 ${
          isDarkMode ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm'
        } shadow-xl`}>
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 ${
            isDarkMode 
              ? 'bg-gradient-to-br from-gray-700 to-gray-800' 
              : 'bg-gradient-to-br from-gray-100 to-gray-200'
          }`}>
            <FaUserMd className={`text-5xl ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`} />
          </div>
          <h3 className={`text-2xl font-bold mb-3 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            No Doctors Found
          </h3>
          <p className={`text-lg mb-6 max-w-md mx-auto ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            We couldn't find any doctors matching your criteria. Try adjusting your filters or search terms.
          </p>
          <button
            onClick={handleClearFilters}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
              isDarkMode
                ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg hover:shadow-xl'
                : 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            Clear All Filters
          </button>
        </Card>
      ) : (
        <>
          {/* Results Count with modern design */}
          <div className={`flex items-center justify-between p-4 rounded-xl ${
            isDarkMode ? 'bg-gray-800/30' : 'bg-gray-50/50'
          }`}>
            <p className={`text-sm font-medium flex items-center ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg mr-3 ${
                isDarkMode 
                  ? 'bg-gradient-to-br from-teal-600 to-cyan-600' 
                  : 'bg-gradient-to-br from-teal-500 to-cyan-500'
              }`}>
                <span className="text-white font-bold">{filteredDoctors.length}</span>
              </span>
              {filteredDoctors.length === doctors.length 
                ? `All ${doctors.length} doctors` 
                : `Showing ${filteredDoctors.length} of ${doctors.length} doctors`}
            </p>
            <div className={`text-xs px-3 py-1 rounded-full ${
              isDarkMode ? 'bg-teal-600/20 text-teal-400' : 'bg-teal-100 text-teal-700'
            }`}>
              {layout === 'grid' ? '📊 Grid View' : '📋 List View'}
            </div>
          </div>

          {/* Doctors Grid/List with staggered animation */}
          {layout === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map((doctor, index) => (
                <div 
                  key={doctor.id} 
                  className="animate-fadeIn"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <DoctorCard
                    doctor={doctor}
                    onViewProfile={handleViewProfile}
                    onBookAppointment={handleBookAppointment}
                    layout="grid"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDoctors.map((doctor, index) => (
                <div 
                  key={doctor.id} 
                  className="animate-fadeIn"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <DoctorCard
                    doctor={doctor}
                    onViewProfile={handleViewProfile}
                    onBookAppointment={handleBookAppointment}
                    layout="list"
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <DoctorProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        doctor={selectedDoctor}
        onBookAppointment={handleBookAppointment}
      />

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
