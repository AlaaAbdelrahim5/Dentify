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
import { Card, Button, Input, LoadingState, ErrorState, EmptyState, DentistDetailsModal, StatusBadge } from '../../../components'
import { useTheme } from '../../../contexts/ThemeContext'
import { dentistsAPI } from '../../../services/api'

const SecretaryDentists = ({ userData, onTabChange }) => {
  const { isDarkMode } = useTheme()
  const [dentists, setDentists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
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
    
    return fullName.includes(searchTerm.toLowerCase()) ||
           email.includes(searchTerm.toLowerCase()) ||
           phone.includes(searchTerm)
  })

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
        <div className="relative">
          <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`} />
          <Input
            type="text"
            placeholder="Search dentists by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
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
            <Card
              key={dentist.userId}
              className={`p-6 transition-all hover:shadow-xl border ${
                isDarkMode 
                  ? 'bg-gray-800/50 border-gray-700 hover:border-teal-500/50' 
                  : 'bg-white border-gray-200 hover:border-teal-300'
              }`}
            >
              <div className="flex flex-col">
                {/* Header with Avatar and Name */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-14 h-14 rounded-full bg-linear-to-br from-teal-500 to-blue-500 flex items-center justify-center text-white text-xl font-bold shrink-0">
                    {getInitials(dentist.firstName, dentist.lastName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-lg font-semibold truncate ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-800'
                    }`}>
                      Dr. {dentist.firstName} {dentist.lastName}
                    </h3>
                    <div className="mt-1">
                      <StatusBadge 
                        isActive={dentist.user?.status === 'ACTIVE'}
                        activeLabel="Active"
                        inactiveLabel="Inactive"
                      />
                    </div>
                  </div>
                </div>

                {/* Specialization */}
                {dentist.specialization && Array.isArray(dentist.specialization) && dentist.specialization.length > 0 && (
                  <div className={`mb-4 p-3 rounded-lg ${
                    isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-start gap-2">
                      <FaStethoscope className={`w-4 h-4 mt-0.5 shrink-0 ${
                        isDarkMode ? 'text-teal-400' : 'text-teal-600'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium mb-1 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          Specialization
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {dentist.specialization.map((spec, idx) => (
                            <span key={idx} className={`text-xs px-2 py-0.5 rounded ${
                              isDarkMode 
                                ? 'bg-teal-900/30 text-teal-400' 
                                : 'bg-teal-100 text-teal-700'
                            }`}>
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Contact Info */}
                <div className={`space-y-2 mb-4 p-3 rounded-lg ${
                  isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                }`}>
                  {dentist.user?.email && (
                    <div className={`flex items-start gap-2 text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <FaEnvelope className={`w-4 h-4 mt-0.5 shrink-0 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`} />
                      <span className="truncate">{dentist.user.email}</span>
                    </div>
                  )}
                  {dentist.user?.phone && (
                    <div className={`flex items-center gap-2 text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <FaPhone className={`w-4 h-4 shrink-0 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`} />
                      <span>{dentist.user.phone}</span>
                    </div>
                  )}
                  {dentist.licenseNumber && (
                    <div className={`flex items-center gap-2 text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <FaIdCard className={`w-4 h-4 shrink-0 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`} />
                      <span className="truncate">License: {dentist.licenseNumber}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center justify-center gap-2"
                    onClick={() => {
                      setSelectedDentist(dentist)
                      setShowDetailsModal(true)
                    }}
                  >
                    <FaEye className="w-4 h-4" />
                    Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center justify-center gap-2"
                    onClick={() => onTabChange?.('appointments')}
                  >
                    <FaCalendarAlt className="w-4 h-4" />
                    Schedule
                  </Button>
                </div>
              </div>
            </Card>
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
