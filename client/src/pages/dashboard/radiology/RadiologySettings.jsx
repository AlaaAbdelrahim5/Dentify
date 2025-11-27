import { useState, useEffect } from 'react'
import { 
  FaHospital, 
  FaSave, 
  FaGlobe, 
  FaMapMarkerAlt, 
  FaCamera,
  FaEdit,
  FaLock,
  FaEnvelope,
  FaPhone,
  FaUser,
  FaIdCard
} from 'react-icons/fa'
import { Card, Button, Input, LoadingSpinner } from '../../../components'
import { useTheme } from '../../../contexts/ThemeContext'
import { authUtils } from '../../../utils/auth'

const RadiologySettings = ({ radiologyData, onUpdate }) => {
  const { isDarkMode } = useTheme()
  const [activeTab, setActiveTab] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    centerName: '',
    registrationNumber: '',
    website: '',
    city: '',
    location: '',
    description: '',
    supportedTypes: [],
    email: ''
  })
  const [newType, setNewType] = useState('')
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (radiologyData) {
      const user = authUtils.getCurrentUser()
      setFormData({
        centerName: radiologyData.centerName || '',
        registrationNumber: radiologyData.registrationNumber || '',
        website: radiologyData.website || '',
        city: radiologyData.city || '',
        location: radiologyData.location || '',
        description: radiologyData.description || '',
        supportedTypes: radiologyData.supportedTypes || [],
        email: user?.email || ''
      })
    }
  }, [radiologyData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAddType = () => {
    if (newType && !formData.supportedTypes.includes(newType)) {
      setFormData(prev => ({
        ...prev,
        supportedTypes: [...prev.supportedTypes, newType]
      }))
      setNewType('')
    }
  }

  const handleRemoveType = (typeToRemove) => {
    setFormData(prev => ({
      ...prev,
      supportedTypes: prev.supportedTypes.filter(type => type !== typeToRemove)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsSaving(true)

    try {
      const token = authUtils.getAccessToken()
      
      const response = await fetch('http://localhost:5000/api/radiology-centers/me', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setSuccess('Settings updated successfully')
        setIsEditing(false)
        if (onUpdate) {
          onUpdate()
        }
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to update settings')
      }
    } catch (error) {
      console.error('Error updating settings:', error)
      setError('An error occurred while updating settings')
    } finally {
      setIsSaving(false)
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: FaUser },
    { id: 'security', label: 'Security', icon: FaLock }
  ]

  const renderProfileTab = () => (
    <div className="space-y-6">
      {/* Profile Picture */}
      <Card className={`p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
              isDarkMode ? 'bg-blue-900' : 'bg-blue-100'
            }`}>
              <FaHospital className="w-10 h-10 text-blue-600" />
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700">
              <FaCamera className="w-4 h-4" />
            </button>
          </div>
          <div>
            <h3 className={`text-xl font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>
              {formData.centerName}
            </h3>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
              {formData.city}
            </p>
            <p className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Registration: {formData.registrationNumber}
            </p>
          </div>
        </div>
      </Card>

      {/* Basic Information */}
      <Card className={`p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className={`text-lg font-semibold ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            Center Information
          </h3>
          <Button
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
          >
            <FaEdit className="w-4 h-4 mr-2" />
            {isEditing ? 'Cancel' : 'Edit'}
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Center Name */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Center Name <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                name="centerName"
                value={formData.centerName}
                onChange={handleChange}
                disabled={!isEditing}
                required
                icon={FaHospital}
              />
            </div>

            {/* Registration Number */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Registration Number <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleChange}
                disabled={!isEditing}
                required
                icon={FaIdCard}
              />
            </div>

            {/* Email */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Email
              </label>
              <Input
                type="email"
                value={formData.email}
                disabled={true}
                icon={FaEnvelope}
              />
              <p className={`text-xs mt-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Email cannot be changed
              </p>
            </div>

            {/* City */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                City <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                disabled={!isEditing}
                required
                icon={FaMapMarkerAlt}
              />
            </div>

            {/* Location */}
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Address/Location
              </label>
              <Input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="Full address"
                icon={FaMapMarkerAlt}
              />
            </div>

            {/* Website */}
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Website
              </label>
              <Input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="https://example.com"
                icon={FaGlobe}
              />
            </div>
          </div>

          {/* Description */}
          <div className="mt-6">
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={!isEditing}
              rows="4"
              placeholder="Describe your radiology center..."
              className={`w-full px-3 py-2 border rounded-lg resize-none ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } ${!isEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
            />
          </div>

          {isEditing && (
            <div className="mt-6 flex gap-4">
              <Button 
                variant="primary"
                type="submit"
                disabled={isSaving}
              >
                <FaSave className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setIsEditing(false)
                  setError('')
                  setSuccess('')
                  // Reset form data
                  if (radiologyData) {
                    const user = authUtils.getCurrentUser()
                    setFormData({
                      centerName: radiologyData.centerName || '',
                      registrationNumber: radiologyData.registrationNumber || '',
                      website: radiologyData.website || '',
                      city: radiologyData.city || '',
                      location: radiologyData.location || '',
                      description: radiologyData.description || '',
                      supportedTypes: radiologyData.supportedTypes || [],
                      email: user?.email || ''
                    })
                  }
                }}
                disabled={isSaving}
              >
                Cancel
              </Button>
            </div>
          )}
        </form>
      </Card>

      {/* Supported Imaging Types */}
      <Card className={`p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>
          Supported Imaging Types
        </h3>
        
        <div className="space-y-3">
          {/* Display existing types */}
          <div className="flex flex-wrap gap-2">
            {formData.supportedTypes.map((type, index) => (
              <span
                key={index}
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                  isDarkMode
                    ? 'bg-blue-900 text-blue-200'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {type}
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => handleRemoveType(type)}
                    className="hover:text-red-500"
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>

          {/* Add new type */}
          {isEditing && (
            <div className="flex gap-2">
              <Input
                type="text"
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                placeholder="e.g., X-ray, CT, MRI, 3D Imaging"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddType()
                  }
                }}
              />
              <Button
                type="button"
                onClick={handleAddType}
                variant="secondary"
              >
                Add
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  )

  const renderSecurityTab = () => (
    <div className="space-y-6">
      {/* Change Password */}
      <Card className={`p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className={`text-lg font-semibold mb-6 ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>
          Change Password
        </h3>

        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Current Password
            </label>
            <Input
              type="password"
              value={security.currentPassword}
              onChange={(e) => setSecurity(prev => ({
                ...prev,
                currentPassword: e.target.value
              }))}
              icon={FaLock}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              New Password
            </label>
            <Input
              type="password"
              value={security.newPassword}
              onChange={(e) => setSecurity(prev => ({
                ...prev,
                newPassword: e.target.value
              }))}
              icon={FaLock}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Confirm New Password
            </label>
            <Input
              type="password"
              value={security.confirmPassword}
              onChange={(e) => setSecurity(prev => ({
                ...prev,
                confirmPassword: e.target.value
              }))}
              icon={FaLock}
            />
          </div>

          <Button variant="primary">
            Update Password
          </Button>
        </div>
      </Card>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-2xl font-bold ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>
          Center Settings
        </h1>
        <p className={`mt-1 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Manage your center information and account preferences
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div className={`p-4 rounded-lg border ${
          isDarkMode 
            ? 'bg-red-900/20 border-red-800 text-red-400' 
            : 'bg-red-50 border-red-200 text-red-600'
        }`}>
          <p>{error}</p>
        </div>
      )}
      {success && (
        <div className={`p-4 rounded-lg border ${
          isDarkMode 
            ? 'bg-green-900/20 border-green-800 text-green-400' 
            : 'bg-green-50 border-green-200 text-green-600'
        }`}>
          <p>{success}</p>
        </div>
      )}

      {/* Tabs */}
      <Card className={`p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex space-x-4">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : isDarkMode
                      ? 'text-gray-300 hover:bg-gray-700'
                      : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </Card>

      {/* Tab Content */}
      {activeTab === 'profile' && renderProfileTab()}
      {activeTab === 'security' && renderSecurityTab()}
    </div>
  )
}

export default RadiologySettings
