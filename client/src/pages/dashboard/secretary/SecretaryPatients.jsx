import { useState, useEffect } from 'react'
import { 
  FaUser,
  FaPlus,
  FaSearch,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaBirthdayCake,
  FaCalendarAlt,
  FaHistory,
  FaEdit,
  FaEye
} from 'react-icons/fa'
import { Card, Button, Input, LoadingSpinner, Pagination } from '../../../components'
import { useTheme } from '../../../contexts/ThemeContext'
import { authUtils } from '../../../utils/auth'

const SecretaryPatients = ({ userData, onTabChange }) => {
  const { isDarkMode } = useTheme()
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [showPatientDetails, setShowPatientDetails] = useState(false)
  const itemsPerPage = 12

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      setLoading(true)
      const token = authUtils.getAccessToken()
      
      const response = await fetch('http://localhost:5000/api/patients', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setPatients(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching patients:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const calculateAge = (birthDate) => {
    if (!birthDate) return 'N/A'
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const getInitials = (firstName, lastName) => {
    const first = firstName?.charAt(0) || ''
    const last = lastName?.charAt(0) || ''
    return (first + last).toUpperCase()
  }

  const getRandomColor = (name) => {
    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500'
    ]
    const index = (name?.charCodeAt(0) || 0) % colors.length
    return colors[index]
  }

  // Filter patients
  const filteredPatients = patients.filter(patient => {
    const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase()
    const email = patient.userId?.email?.toLowerCase() || ''
    const phone = patient.userId?.phone || ''
    
    return fullName.includes(searchTerm.toLowerCase()) ||
           email.includes(searchTerm.toLowerCase()) ||
           phone.includes(searchTerm)
  })

  // Pagination
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage)
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient)
    setShowPatientDetails(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
            Patients Management
          </h2>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            View and manage patient records
          </p>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-2 p-4">
          <div className="relative">
            <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <Input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

        <Card className={`p-4 border ${isDarkMode 
          ? 'bg-gradient-to-br from-teal-900/20 to-teal-800/20 border-teal-700/30' 
          : 'bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-full ${isDarkMode ? 'bg-teal-900/30' : 'bg-teal-100'}`}>
              <FaUser className={`w-5 h-5 ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`} />
            </div>
            <div>
              <p className={`text-xs ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`}>Total Patients</p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-teal-300' : 'text-teal-800'}`}>
                {filteredPatients.length}
              </p>
            </div>
          </div>
        </Card>

        <Card className={`p-4 border ${isDarkMode 
          ? 'bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-700/30' 
          : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-full ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
              <FaCalendarAlt className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <div>
              <p className={`text-xs ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>Active</p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                {patients.filter(p => p.userId?.status === 'active' || p.userId?.status === 'ACTIVE').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Patients Grid */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : paginatedPatients.length === 0 ? (
          <div className="text-center py-12">
            <FaUser className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              No patients found
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
              {paginatedPatients.map((patient) => (
                <Card
                  key={patient._id || patient.userId}
                  className={`p-6 transition-all hover:shadow-xl cursor-pointer border ${
                    isDarkMode 
                      ? 'hover:border-teal-500/50 bg-gray-800/50 border-gray-700' 
                      : 'hover:border-teal-300 bg-white border-gray-200'
                  }`}
                  onClick={() => handleViewPatient(patient)}
                >
                  <div className="flex flex-col items-center">
                    {/* Avatar */}
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4 ${
                      getRandomColor(patient.firstName)
                    }`}>
                      {getInitials(patient.firstName, patient.lastName)}
                    </div>

                    {/* Name */}
                    <h3 className={`text-lg font-semibold text-center mb-2 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-800'
                    }`}>
                      {patient.firstName} {patient.lastName}
                    </h3>

                    {/* Info */}
                    <div className="w-full space-y-2 mb-4">
                      {patient.userId?.email && (
                        <div className={`flex items-center gap-2 text-xs ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          <FaEnvelope className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{patient.userId.email}</span>
                        </div>
                      )}
                      {patient.userId?.phone && (
                        <div className={`flex items-center gap-2 text-xs ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          <FaPhone className="w-3 h-3 flex-shrink-0" />
                          <span>{patient.userId.phone}</span>
                        </div>
                      )}
                      {patient.city && (
                        <div className={`flex items-center gap-2 text-xs ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          <FaMapMarkerAlt className="w-3 h-3 flex-shrink-0" />
                          <span>{patient.city}</span>
                        </div>
                      )}
                      {patient.birthDate && (
                        <div className={`flex items-center gap-2 text-xs ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          <FaBirthdayCake className="w-3 h-3 flex-shrink-0" />
                          <span>{calculateAge(patient.birthDate)} years old</span>
                        </div>
                      )}
                    </div>

                    {/* Gender Badge */}
                    {patient.gender && (
                      <div className={`w-full mb-3`}>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          patient.gender === 'Male' || patient.gender === 'male'
                            ? isDarkMode 
                              ? 'bg-blue-900/30 text-blue-400' 
                              : 'bg-blue-100 text-blue-800'
                            : isDarkMode 
                              ? 'bg-pink-900/30 text-pink-400' 
                              : 'bg-pink-100 text-pink-800'
                        }`}>
                          {patient.gender}
                        </span>
                      </div>
                    )}

                    {/* Action Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full flex items-center justify-center gap-2"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleViewPatient(patient)
                      }}
                    >
                      <FaEye className="w-4 h-4" />
                      View Details
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </Card>

      {/* Patient Details Modal - Coming Soon */}
      {showPatientDetails && selectedPatient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className={`max-w-2xl w-full max-h-[90vh] overflow-y-auto ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className={`text-xl font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  Patient Details
                </h3>
                <button
                  onClick={() => setShowPatientDetails(false)}
                  className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold ${
                    getRandomColor(selectedPatient.firstName)
                  }`}>
                    {getInitials(selectedPatient.firstName, selectedPatient.lastName)}
                  </div>
                  <div>
                    <h4 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      {selectedPatient.firstName} {selectedPatient.lastName}
                    </h4>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Patient ID: {selectedPatient._id || selectedPatient.userId}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Email</p>
                    <p className={`${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      {selectedPatient.userId?.email || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Phone</p>
                    <p className={`${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      {selectedPatient.userId?.phone || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Gender</p>
                    <p className={`${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      {selectedPatient.gender || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Age</p>
                    <p className={`${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      {calculateAge(selectedPatient.birthDate)} years
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Birth Date</p>
                    <p className={`${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      {formatDate(selectedPatient.birthDate)}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>City</p>
                    <p className={`${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      {selectedPatient.city || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setShowPatientDetails(false)}>
                    Close
                  </Button>
                  <Button variant="primary" className="flex-1 flex items-center justify-center gap-2">
                    <FaHistory className="w-4 h-4" />
                    View History
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export default SecretaryPatients
