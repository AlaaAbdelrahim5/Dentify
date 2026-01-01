import { useState, useEffect } from 'react'
import { 
  FaUserMd,
  FaCalendarAlt,
  FaPhone,
  FaEnvelope,
  FaIdCard,
  FaSearch,
  FaStethoscope,
  FaEye
} from 'react-icons/fa'
import { Card, Button, Input, LoadingState, ErrorState, EmptyState, DentistDetailsModal, DentistCard, StatusBadge, FilterBar } from '../../../components'
import { useTheme } from '../../../contexts/ThemeContext'
import { dentistsAPI } from '../../../services/api'
import { useDebounce } from '../../../hooks'

const SecretaryDentists = ({ userData, onTabChange }) => {
  const { isDarkMode } = useTheme()
  const [dentists, setDentists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const [filtering, setFiltering] = useState(false)
  const [selectedDentist, setSelectedDentist] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  useEffect(() => {
    fetchDentists()
  }, [])

  const fetchDentists = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await dentistsAPI.getForClinic()
      setDentists(response.data || [])
    } catch (err) {
      console.error('Error fetching dentists:', err)
      setError('Failed to load dentists. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (firstName, lastName) => {
    const first = firstName?.charAt(0) || ''
    const last = lastName?.charAt(0) || ''
    return (first + last).toUpperCase()
  }

  const filteredDentists = dentists.filter(dentist => {
    const fullName = `${dentist.firstName} ${dentist.lastName}`.toLowerCase()
    const email = dentist.user?.email?.toLowerCase() || ''
    const phone = dentist.user?.phone || ''
    
    return fullName.includes(debouncedSearchTerm.toLowerCase()) ||
           email.includes(debouncedSearchTerm.toLowerCase()) ||
           phone.includes(debouncedSearchTerm)
  })

  const handleClearFilters = () => {
    setSearchTerm('')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
            Dentists Directory
          </h2>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            View dentist information and schedules
          </p>
        </div>
        <div className={`px-4 py-2 rounded-lg ${
          isDarkMode ? 'bg-teal-900/30 text-teal-400' : 'bg-teal-100 text-teal-700'
        }`}>
          <span className="font-semibold">{filteredDentists.length}</span> Dentist{filteredDentists.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Search */}
      <Card className="p-4">
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={(e) => setSearchTerm(e.target.value)}
          debouncedSearchTerm={debouncedSearchTerm}
          searchPlaceholder="Search dentists by name, email, or phone..."
          filters={[]}
          onClearFilters={handleClearFilters}
          filtering={filtering}
        />
      </Card>

      {/* Dentists List */}
      {loading ? (
        <Card>
          <LoadingState message="Loading dentists..." />
        </Card>
      ) : error ? (
        <Card>
          <ErrorState
            icon={FaUserMd}
            title="Error Loading Dentists"
            message={error}
            onRetry={fetchDentists}
          />
        </Card>
      ) : filteredDentists.length === 0 ? (
        <Card>
          <EmptyState
            icon={FaUserMd}
            title="No dentists found"
            message={searchTerm ? 'No dentists match your search criteria' : 'No dentists in this clinic'}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDentists.map((dentist) => (
            <DentistCard
              key={dentist.userId}
              doctor={dentist}
              layout="grid"
              onViewProfile={() => {
                setSelectedDentist(dentist)
                setShowDetailsModal(true)
              }}
              onBookAppointment={() => onTabChange?.('appointments')}
            />
          ))}
        </div>
      )}

      {/* Dentist Details Modal */}
      <DentistDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false)
          setSelectedDentist(null)
        }}
        dentistData={selectedDentist}
      />
    </div>
  )
}

export default SecretaryDentists
