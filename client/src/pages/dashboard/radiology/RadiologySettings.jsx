import { useState, useEffect } from 'react'
import { 
  FaHospital, 
  FaSave, 
  FaGlobe, 
  FaMapMarkerAlt, 
  FaEdit,
  FaLock,
  FaEnvelope,
  FaPhone,
  FaUser,
  FaIdCard,
  FaClock
} from 'react-icons/fa'
import { Card, Button, Input, LoadingSpinner, ProfileImageUpload, TwoFactorAuth, LocationPicker, PhoneInput, Toast } from '../../../components'
import { useTheme } from '../../../contexts/ThemeContext'
import { authUtils } from '../../../utils/auth'
import { PALESTINIAN_CITIES, COUNTRY_CODES, IMAGING_TYPES } from '../../../utils/constants'

const RadiologySettings = ({ userData, onUpdate, refreshData }) => {
  const { isDarkMode } = useTheme()
  const [activeTab, setActiveTab] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [toast, setToast] = useState(null)
  const [formData, setFormData] = useState({
    centerName: '',
    registrationNumber: '',
    website: '',
    city: '',
    location: '',
    description: '',
    supportedTypes: [],
    email: '',
    countryCode: '+970',
    phoneNumber: '',
    profileImage: '',
    coordinates: '',
    createdAt: '',
    status: ''
  })
  const [newType, setNewType] = useState('')
  const [workingHours, setWorkingHours] = useState({
    sunday: { start: '', end: '', isOpen: false },
    monday: { start: '', end: '', isOpen: false },
    tuesday: { start: '', end: '', isOpen: false },
    wednesday: { start: '', end: '', isOpen: false },
    thursday: { start: '', end: '', isOpen: false },
    friday: { start: '', end: '', isOpen: false },
    saturday: { start: '', end: '', isOpen: false }
  })
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (userData) {
      setLoading(true)
      const user = authUtils.getCurrentUser()
      
      // Parse phone number
      const fullPhone = userData.user?.phone || userData.phone || ''
      let parsedCountryCode = '+970'
      let parsedPhoneNumber = ''
      
      if (fullPhone) {
        // Try to match a known country code
        let matched = false
        for (const country of COUNTRY_CODES) {
          if (fullPhone.startsWith(country.value)) {
            parsedCountryCode = country.value
            parsedPhoneNumber = fullPhone.substring(country.value.length)
            matched = true
            break
          }
        }
        
        // If no known country code matched, try generic regex
        if (!matched) {
          const countryCodeMatch = fullPhone.match(/^(\+\d{1,3})/)
          if (countryCodeMatch) {
            parsedCountryCode = countryCodeMatch[1]
            parsedPhoneNumber = fullPhone.substring(countryCodeMatch[1].length)
          } else {
            parsedPhoneNumber = fullPhone.replace(/\D/g, '')
          }
        }
      }
      
      setFormData({
        centerName: userData.centerName || '',
        registrationNumber: userData.registrationNumber || '',
        website: userData.website || '',
        city: userData.city || '',
        location: userData.location || '',
        description: userData.description || '',
        supportedTypes: userData.supportedTypes || [],
        email: user?.email || '',
        countryCode: parsedCountryCode,
        phoneNumber: parsedPhoneNumber,
        profileImage: userData.user?.profileImage || userData.profileImage || '',
        coordinates: userData.coordinates || '',
        createdAt: userData.user?.createdAt || userData.createdAt || '',
        status: userData.user?.status || userData.status || ''
      })
      
      // Load working hours if they exist
      if (userData.workingHours && userData.workingHours.length > 0) {
        const hoursObject = Array.isArray(userData.workingHours) 
          ? convertWorkingHoursArrayToObject(userData.workingHours)
          : userData.workingHours
        setWorkingHours(hoursObject)
      }
      setLoading(false)
    }
  }, [userData])

  const convertWorkingHoursArrayToObject = (workingHoursArray) => {
    const daysMap = {
      'Sunday': 'sunday',
      'Monday': 'monday', 
      'Tuesday': 'tuesday',
      'Wednesday': 'wednesday',
      'Thursday': 'thursday',
      'Friday': 'friday',
      'Saturday': 'saturday'
    }
    
    const result = {
      sunday: { start: '', end: '', isOpen: false },
      monday: { start: '', end: '', isOpen: false },
      tuesday: { start: '', end: '', isOpen: false },
      wednesday: { start: '', end: '', isOpen: false },
      thursday: { start: '', end: '', isOpen: false },
      friday: { start: '', end: '', isOpen: false },
      saturday: { start: '', end: '', isOpen: false }
    }
    
    // Fill in the actual working hours with isOpen status from database
    workingHoursArray.forEach(({ day, startTime, endTime, isOpen }) => {
      const dayKey = daysMap[day]
      if (dayKey) {
        result[dayKey] = {
          isOpen: isOpen !== undefined ? isOpen : true,
          start: startTime,
          end: endTime
        }
      }
    })
    
    return result
  }

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
    if (e && e.preventDefault) {
      e.preventDefault()
    }
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      const token = authUtils.getAccessToken()
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/radiology-centers/me`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          phone: `${formData.countryCode}${formData.phoneNumber}`
        })
      })

      if (response.ok) {
        setSuccess('Settings updated successfully')
        setIsEditing(false)
        
        // Update the stored user data in authUtils
        const currentStoredUser = authUtils.getCurrentUser()
        if (currentStoredUser && currentStoredUser.radiology) {
          const updatedUser = {
            ...currentStoredUser,
            radiology: {
              ...currentStoredUser.radiology,
              centerName: formData.centerName
            }
          }
          authUtils.updateUser(updatedUser)
        }
        
        // Dispatch event to notify other components
        window.dispatchEvent(new Event('profileUpdated'))
        
        if (refreshData) {
          await refreshData()
        }
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
      setSaving(false)
    }
  }

  const handleSaveWorkingHours = async () => {
    try {
      setSaving(true)
      setError('')
      setSuccess('')
      
      // Convert working hours object to array format expected by backend
      const workingHoursArray = Object.entries(workingHours).map(([day, hours]) => ({
        day: day.charAt(0).toUpperCase() + day.slice(1),
        startTime: hours.start,
        endTime: hours.end,
        isOpen: hours.isOpen
      }))
      
      const token = authUtils.getAccessToken()
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/radiology-centers/me`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ workingHours: workingHoursArray })
      })

      if (response.ok) {
        setSuccess('Working hours updated successfully')
        if (refreshData) {
          await refreshData()
        }
        if (onUpdate) {
          onUpdate()
        }
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to update working hours')
      }
    } catch (error) {
      console.error('Error updating working hours:', error)
      setError('An error occurred while updating working hours')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (security.newPassword !== security.confirmPassword) {
      setToast({ message: 'New passwords do not match!', type: 'error' })
      return
    }

    if (security.newPassword.length < 6) {
      setToast({ message: 'Password must be at least 6 characters long!', type: 'error' })
      return
    }

    try {
      setSaving(true)
      const token = authUtils.getAccessToken()

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: security.currentPassword,
          newPassword: security.newPassword
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to change password')
      }

      setToast({ message: 'Password changed successfully!', type: 'success' })
      setSecurity({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (err) {
      console.error('Error changing password:', err)
      setToast({ message: err.message || 'Failed to change password. Please try again.', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: FaUser },
    { id: 'hours', label: 'Working Hours', icon: FaClock },
    { id: 'security', label: 'Security', icon: FaLock }
  ]

  const renderProfileTab = () => (
    <div className="space-y-6">
      {/* Profile Picture */}
      <Card className={`p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <ProfileImageUpload 
          currentImage={formData.profileImage}
          onImageUpdate={(imageUrl) => {
            setFormData(prev => ({ ...prev, profileImage: imageUrl }))
          }}
          userName={formData.centerName}
          onToast={setToast}
        />
        <div className="mt-4">
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
            {formData.city}
          </p>
          <p className={`text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Registration: {formData.registrationNumber}
          </p>
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

        <div className="space-y-4">
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
                className={!isEditing ? 'opacity-60' : ''}
              />
            </div>

            {/* Registration Number */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Registration Number
              </label>
              <Input
                type="text"
                name="registrationNumber"
                value={formData.registrationNumber}
                disabled={true}
                icon={FaIdCard}
                className="opacity-60"
              />
              <p className={`text-xs mt-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Registration number cannot be changed
              </p>
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
                className="opacity-60"
              />
              <p className={`text-xs mt-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Email cannot be changed
              </p>
            </div>

            {/* Phone */}
            <PhoneInput
              label="Phone"
              countryCode={formData.countryCode}
              phoneNumber={formData.phoneNumber}
              onCountryChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
              onPhoneChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value.replace(/\D/g, '') })}
              placeholder="Enter phone number"
              icon={FaPhone}
              className={!isEditing ? 'opacity-60 pointer-events-none' : ''}
            />

            {/* City */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                City <span className="text-red-500">*</span>
              </label>
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                disabled={!isEditing}
                required
                className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } ${!isEditing ? 'opacity-60' : ''}`}
              >
                <option value="">Select city</option>
                {PALESTINIAN_CITIES.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
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
                className={!isEditing ? 'opacity-60' : ''}
                autoComplete="off"
              />
            </div>

            {/* Map Location Picker */}
            <div className="md:col-span-2">
              <LocationPicker
                value={formData.coordinates}
                onChange={(coords) => setFormData({ ...formData, coordinates: coords })}
                disabled={!isEditing}
                className={!isEditing ? 'opacity-60' : ''}
              />
            </div>

            {/* Website */}
            <div>
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
                className={!isEditing ? 'opacity-60' : ''}
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
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
                placeholder="Brief description of the radiology center..."
                rows={3}
                className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } ${!isEditing ? 'opacity-60' : ''}`}
              />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className={`text-lg font-semibold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            Supported Imaging Types <span className="text-red-500">*</span>
          </h3>
          
          {!isEditing ? (
            <div className="flex flex-wrap gap-2">
              {formData.supportedTypes.length > 0 ? (
                formData.supportedTypes.map((type, index) => (
                  <span
                    key={index}
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                      isDarkMode
                        ? 'bg-blue-900 text-blue-200'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {type}
                  </span>
                ))
              ) : (
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  No imaging types selected
                </p>
              )}
            </div>
          ) : (
            <div className={`grid grid-cols-2 md:grid-cols-3 gap-3 p-4 rounded-lg border ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              {IMAGING_TYPES.map((type) => (
                <label
                  key={type}
                  className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                    isDarkMode
                      ? 'hover:bg-gray-600'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.supportedTypes.includes(type)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData(prev => ({
                          ...prev,
                          supportedTypes: [...prev.supportedTypes, type]
                        }))
                      } else {
                        setFormData(prev => ({
                          ...prev,
                          supportedTypes: prev.supportedTypes.filter(t => t !== type)
                        }))
                      }
                    }}
                    className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                  />
                  <span className={`text-sm ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    {type}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

          {isEditing && (
            <div className="mt-6 flex gap-4">
              <Button 
                variant="primary"
                onClick={handleSubmit}
                disabled={saving}
              >
                <FaSave className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false)
                  setError('')
                  setSuccess('')
                  // Reset form data
                  if (userData) {
                    const user = authUtils.getCurrentUser()
                    setFormData({
                      centerName: userData.centerName || '',
                      registrationNumber: userData.registrationNumber || '',
                      website: userData.website || '',
                      city: userData.city || '',
                      location: userData.location || '',
                      description: userData.description || '',
                      supportedTypes: userData.supportedTypes || [],
                      email: user?.email || ''
                    })
                  }
                }}
                disabled={saving}
              > 
                Cancel
              </Button>
            </div>
          )}
      </Card>
    </div>
  )

  const renderWorkingHoursTab = () => (
    <Card className={`p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          Working Hours
        </h3>
      </div>

      <div className="space-y-4">
        {Object.entries(workingHours).map(([day, hours]) => (
          <div key={day} className={`flex items-center justify-between p-4 rounded-lg border ${
            isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'
          }`}>
            <div className="flex items-center space-x-4">
              <input
                type="checkbox"
                checked={hours.isOpen}
                onChange={(e) => setWorkingHours({
                  ...workingHours,
                  [day]: { ...hours, isOpen: e.target.checked }
                })}
                className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
              />
              <span className={`font-medium capitalize min-w-25 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {day}
              </span>
            </div>
            
            {hours.isOpen && (
              <div className="flex items-center space-x-2">
                <input
                  type="time"
                  value={hours.start}
                  onChange={(e) => setWorkingHours({
                    ...workingHours,
                    [day]: { ...hours, start: e.target.value }
                  })}
                  className={`px-3 py-1 border rounded ${
                    isDarkMode 
                      ? 'bg-gray-600 border-gray-500 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>to</span>
                <input
                  type="time"
                  value={hours.end}
                  onChange={(e) => setWorkingHours({
                    ...workingHours,
                    [day]: { ...hours, end: e.target.value }
                  })}
                  className={`px-3 py-1 border rounded ${
                    isDarkMode 
                      ? 'bg-gray-600 border-gray-500 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            )}
            
            {!hours.isOpen && (
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Closed
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-6">
        <Button
          variant="primary"
          onClick={handleSaveWorkingHours}
          disabled={saving}
        >
          <FaSave className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Working Hours'}
        </Button>
      </div>
    </Card>
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
          <Input
            label="Current Password"
            type="password"
            value={security.currentPassword}
            onChange={(e) => setSecurity(prev => ({
              ...prev,
              currentPassword: e.target.value
            }))}
            icon={FaLock}
          />

          <Input
            label="New Password"
            type="password"
            value={security.newPassword}
            onChange={(e) => setSecurity(prev => ({
              ...prev,
              newPassword: e.target.value
            }))}
            icon={FaLock}
          />

          <Input
            label="Confirm New Password"
            type="password"
            value={security.confirmPassword}
            onChange={(e) => setSecurity(prev => ({
              ...prev,
              confirmPassword: e.target.value
            }))}
            icon={FaLock}
          />

          <Button 
            variant="primary"
            onClick={handleChangePassword}
            disabled={saving}
          >
            {saving ? 'Updating...' : 'Update Password'}
          </Button>
        </div>
      </Card>

      {/* Two-Factor Authentication */}
      <TwoFactorAuth />
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-2xl font-bold ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>
          Profile Settings
        </h1>
        <p className={`mt-1 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Manage your profile and account preferences
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
      <Card className={`p-4 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="flex space-x-4">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-teal-600 text-white'
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
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'hours' && renderWorkingHoursTab()}
          {activeTab === 'security' && renderSecurityTab()}
        </>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}

export default RadiologySettings
