import { useState, useEffect } from 'react'
import { 
  FaUserMd,
  FaCalendarAlt,
  FaPhone,
  FaEnvelope,
  FaIdCard,
  FaSearch,
  FaStethoscope,
  FaEye,
  FaTimes
} from 'react-icons/fa'
import { Card, Button, Input, LoadingSpinner } from '../../../components'
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
        <Card className={`p-8 text-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
              Loading dentists...
            </p>
          </div>
        </Card>
      ) : error ? (
        <Card className={`p-8 text-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <FaUserMd className={`w-12 h-12 mx-auto mb-4 text-red-500`} />
          <h3 className={`text-lg font-semibold mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Error Loading Dentists
          </h3>
          <p className={`mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {error}
          </p>
          <Button onClick={fetchDentists}>
            Try Again
          </Button>
        </Card>
      ) : filteredDentists.length === 0 ? (
        <Card className={`p-12 text-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <FaUserMd className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
          <h3 className={`text-lg font-semibold mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            No dentists found
          </h3>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
            {searchTerm ? 'No dentists match your search criteria' : 'No dentists in this clinic'}
          </p>
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
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        dentist.user?.status === 'ACTIVE'
                          ? isDarkMode 
                            ? 'bg-green-900/30 text-green-400' 
                            : 'bg-green-100 text-green-800'
                          : isDarkMode 
                            ? 'bg-red-900/30 text-red-400' 
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {dentist.user?.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                      </span>
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
      {showDetailsModal && selectedDentist && (
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
                  }`}
                >
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
                        Dr. {selectedDentist.firstName} {selectedDentist.lastName}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">License Number</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedDentist.licenseNumber || 'N/A'}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Email</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedDentist.user?.email || 'N/A'}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Phone</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedDentist.user?.phone || 'N/A'}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        selectedDentist.user?.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {selectedDentist.user?.status || 'N/A'}
                      </span>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">City</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedDentist.city || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Specialization */}
                {selectedDentist.specialization && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <FaStethoscope className="text-teal-600" />
                      Specialization
                    </h4>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(selectedDentist.specialization) ? (
                          selectedDentist.specialization.map((spec, idx) => (
                            <span key={idx} className="px-3 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-full text-sm font-medium">
                              {spec}
                            </span>
                          ))
                        ) : (
                          <span className="px-3 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-full text-sm font-medium">
                            {selectedDentist.specialization}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Clinic Information */}
                {selectedDentist.clinic && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <FaIdCard className="text-teal-600" />
                      Clinic Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Clinic Name</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {selectedDentist.clinic.clinicName || 'N/A'}
                        </p>
                      </div>
                      {selectedDentist.clinic.address && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Address</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {selectedDentist.clinic.address}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Bio */}
                {selectedDentist.bio && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Biography</h4>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {selectedDentist.bio}
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
                    onTabChange?.('appointments')
                  }}
                  className="flex items-center gap-2"
                >
                  <FaCalendarAlt className="w-4 h-4" />
                  View Schedule
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SecretaryDentists
