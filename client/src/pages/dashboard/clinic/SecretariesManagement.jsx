import { useState, useEffect } from 'react'
import { 
  FaPlus, 
  FaSearch, 
  FaEdit, 
  FaTrash, 
  FaUserTie,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaVenus,
  FaMars
} from 'react-icons/fa'
import { Card, Button, Input, Select } from '../../../components'
import { useTheme } from '../../../contexts/ThemeContext'
import { secretariesAPI } from '../../../services/api'
import SecretaryModal from '../../../components/clinic/SecretaryModal'

const SecretariesManagement = () => {
  const { isDarkMode } = useTheme()
  const [secretaries, setSecretaries] = useState([])
  const [filteredSecretaries, setFilteredSecretaries] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterGender, setFilterGender] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSecretary, setSelectedSecretary] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch secretaries from API
  useEffect(() => {
    const fetchSecretaries = async () => {
      try {
        setIsLoading(true)
        setError(null)
        // Use clinic-specific API to get only secretaries belonging to this clinic
        const response = await secretariesAPI.getForClinic()
        
        if (response && response.success) {
          const secretariesData = response.data || []
          setSecretaries(secretariesData)
          setFilteredSecretaries(secretariesData)
        } else {
          setError(response?.message || 'Failed to fetch secretaries')
        }
      } catch (error) {
        console.error('Error fetching secretaries:', error)
        const errorMessage = error.response?.data?.message || error.message || 'Failed to load secretaries. Please try again.'
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSecretaries()
  }, [])

  // Filter secretaries based on search and filters
  useEffect(() => {
    let filtered = secretaries

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(secretary => {
        const fullName = `${secretary.firstName} ${secretary.lastName}`.toLowerCase()
        const email = secretary.userId?.email?.toLowerCase() || ''
        const city = secretary.address?.city?.toLowerCase() || ''
        const searchLower = searchTerm.toLowerCase()
        
        return fullName.includes(searchLower) ||
               email.includes(searchLower) ||
               city.includes(searchLower)
      })
    }

    // Gender filter
    if (filterGender) {
      filtered = filtered.filter(secretary => secretary.gender === filterGender)
    }

    setFilteredSecretaries(filtered)
  }, [secretaries, searchTerm, filterGender])

  const handleAddSecretary = () => {
    setSelectedSecretary(null)
    setIsModalOpen(true)
  }

  const handleEditSecretary = (secretary) => {
    setSelectedSecretary(secretary)
    setIsModalOpen(true)
  }

  const handleDeleteSecretary = async (secretaryId) => {
    if (window.confirm('Are you sure you want to delete this secretary? This action cannot be undone.')) {
      try {
        setError(null) // Clear any existing errors
        const response = await secretariesAPI.delete(secretaryId)
        
        if (response && response.success) {
          setSecretaries(prev => prev.filter(s => s._id !== secretaryId))
          console.log('Secretary deleted successfully')
          // Show success message (you can add a toast notification here)
        } else {
          setError(response?.message || 'Failed to delete secretary')
        }
      } catch (error) {
        console.error('Error deleting secretary:', error)
        const errorMessage = error.response?.data?.message || error.message || 'Failed to delete secretary. Please try again.'
        setError(errorMessage)
      }
    }
  }

  const handleModalSave = async (secretaryData) => {
    try {
      setError(null)
      
      if (selectedSecretary) {
        // Edit existing secretary - structure data according to API expectations
        const updateData = {
          userData: {
            email: secretaryData.userId.email,
            phone: secretaryData.userId.phone,
            ...(secretaryData.userId.password && { password: secretaryData.userId.password })
          },
          secretaryData: {
            firstName: secretaryData.firstName,
            lastName: secretaryData.lastName,
            birthDate: secretaryData.birthDate,
            gender: secretaryData.gender,
            address: {
              city: secretaryData.address.city
            }
          }
        }
        
        const response = await secretariesAPI.update(selectedSecretary._id, updateData)
        
        if (response.success) {
          // Update the secretary in the list
          setSecretaries(prev => prev.map(s => 
            s._id === selectedSecretary._id ? response.data : s
          ))
          setIsModalOpen(false)
          // Show success message (you can add toast here)
          console.log('Secretary updated successfully')
        } else {
          setError(response.message || 'Failed to update secretary')
        }
      } else {
        // Add new secretary - match the expected API structure
        const createData = {
          firstName: secretaryData.firstName,
          lastName: secretaryData.lastName,
          birthDate: secretaryData.birthDate,
          gender: secretaryData.gender,
          address: {
            city: secretaryData.address.city
          },
          userId: {
            email: secretaryData.userId.email,
            phone: secretaryData.userId.phone,
            password: secretaryData.userId.password,
            role: 'Secretary',
            status: 'active'
          }
        }
        
        const response = await secretariesAPI.create(createData)
        
        if (response.success) {
          // Add the new secretary to the list
          setSecretaries(prev => [response.data, ...prev])
          setIsModalOpen(false)
          // Show success message (you can add toast here)
          console.log('Secretary created successfully')
        } else {
          setError(response.message || 'Failed to create secretary')
        }
      }
    } catch (error) {
      console.error('Error saving secretary:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save secretary. Please try again.'
      setError(errorMessage)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB')
  }

  const calculateAge = (birthDate) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-400">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
            <div className="ml-auto">
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
            Secretaries Management
          </h2>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage your clinic secretaries and their information
          </p>
        </div>
        <Button
          onClick={handleAddSecretary}
          className="flex items-center gap-2"
          variant="primary"
        >
          <FaPlus className="w-4 h-4" />
          Add Secretary
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <Input
              type="text"
              placeholder="Search secretaries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value)}
            className="w-full"
          >
            <option value="">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </Select>
          <div className="flex items-center gap-2">
            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Total: {filteredSecretaries.length} secretaries
            </span>
          </div>
        </div>
      </Card>

      {/* Secretaries Grid */}
      {filteredSecretaries.length === 0 ? (
        <Card className="p-12 text-center">
          <FaUserTie className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
          <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            No Secretaries Found
          </h3>
          <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {searchTerm || filterGender 
              ? 'No secretaries match your current filters.' 
              : 'Start by adding your first secretary to the clinic.'}
          </p>
          {!searchTerm && !filterGender && (
            <Button onClick={handleAddSecretary} variant="primary">
              Add Your First Secretary
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSecretaries.map((secretary) => (
            <Card key={secretary._id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    secretary.gender === 'female' 
                      ? 'bg-pink-100 text-pink-600' 
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    {secretary.gender === 'female' ? (
                      <FaVenus className="w-6 h-6" />
                    ) : (
                      <FaMars className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h3 className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                      {secretary.firstName} {secretary.lastName}
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Age: {calculateAge(secretary.birthDate)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleEditSecretary(secretary)}
                    variant="outline"
                    size="sm"
                    className="p-2"
                  >
                    <FaEdit className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleDeleteSecretary(secretary._id)}
                    variant="outline"
                    size="sm"
                    className="p-2 text-red-600 hover:bg-red-50"
                  >
                    <FaTrash className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FaEnvelope className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {secretary.userId.email}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FaPhone className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {secretary.userId.phone}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {secretary.address.city}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Joined: {formatDate(secretary.createdAt)}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  secretary.userId.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {secretary.userId.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Secretary Modal */}
      {isModalOpen && (
        <SecretaryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleModalSave}
          secretary={selectedSecretary}
        />
      )}
    </div>
  )
}

export default SecretariesManagement