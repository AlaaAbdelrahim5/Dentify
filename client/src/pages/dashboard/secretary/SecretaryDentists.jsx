import { useState, useEffect } from 'react'
import { 
  FaUserMd,
  FaCalendarAlt,
  FaPhone,
  FaEnvelope,
  FaClock,
  FaSearch
} from 'react-icons/fa'
import { Card, Button, Input, LoadingSpinner } from '../../../components'
import { useTheme } from '../../../contexts/ThemeContext'
import { authUtils } from '../../../utils/auth'

const SecretaryDentists = ({ userData, onTabChange }) => {
  const { isDarkMode } = useTheme()
  const [dentists, setDentists] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchDentists()
  }, [])

  const fetchDentists = async () => {
    try {
      setLoading(true)
      const token = authUtils.getAccessToken()
      
      const response = await fetch('http://localhost:5000/api/dentists/clinic', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setDentists(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching dentists:', error)
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
    return fullName.includes(searchTerm.toLowerCase())
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
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`} />
          <Input
            type="text"
            placeholder="Search dentists by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Dentists List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredDentists.length === 0 ? (
        <Card className="p-12 text-center">
          <FaUserMd className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
          <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            No dentists found
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDentists.map((dentist) => (
            <Card
              key={dentist._id || dentist.userId}
              className={`p-6 transition-all hover:shadow-xl border ${
                isDarkMode 
                  ? 'bg-gray-800/50 border-gray-700 hover:border-teal-500/50' 
                  : 'bg-white border-gray-200 hover:border-teal-300'
              }`}
            >
              <div className="flex flex-col items-center">
                {/* Avatar */}
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold mb-4">
                  {getInitials(dentist.firstName, dentist.lastName)}
                </div>

                {/* Name */}
                <h3 className={`text-lg font-semibold text-center mb-1 ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-800'
                }`}>
                  Dr. {dentist.firstName} {dentist.lastName}
                </h3>

                {/* Specialization */}
                {dentist.specialization && (
                  <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {dentist.specialization}
                  </p>
                )}

                {/* Contact Info */}
                <div className="w-full space-y-2 mb-4">
                  {dentist.userId?.email && (
                    <div className={`flex items-center gap-2 text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      <FaEnvelope className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{dentist.userId.email}</span>
                    </div>
                  )}
                  {dentist.userId?.phone && (
                    <div className={`flex items-center gap-2 text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      <FaPhone className="w-3 h-3 flex-shrink-0" />
                      <span>{dentist.userId.phone}</span>
                    </div>
                  )}
                  {dentist.licenseNumber && (
                    <div className={`flex items-center gap-2 text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      <span className="font-medium">License:</span>
                      <span>{dentist.licenseNumber}</span>
                    </div>
                  )}
                </div>

                {/* Status Badge */}
                <div className="w-full mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    dentist.userId?.status === 'active' || dentist.userId?.status === 'ACTIVE'
                      ? isDarkMode 
                        ? 'bg-green-900/30 text-green-400' 
                        : 'bg-green-100 text-green-800'
                      : isDarkMode 
                        ? 'bg-red-900/30 text-red-400' 
                        : 'bg-red-100 text-red-800'
                  }`}>
                    {dentist.userId?.status === 'active' || dentist.userId?.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Action Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={() => onTabChange?.('appointments')}
                >
                  <FaCalendarAlt className="w-4 h-4" />
                  View Schedule
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default SecretaryDentists
