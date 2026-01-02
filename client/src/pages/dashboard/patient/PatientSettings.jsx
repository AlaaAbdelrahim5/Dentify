import { useState, useEffect } from 'react'
import { 
  FaUser,
  FaSave,
  FaEdit,
  FaLock,
  FaEnvelope,
  FaBirthdayCake,
  FaMapMarkerAlt,
  FaPhone
} from 'react-icons/fa'
import { Card, Button, Input, Select, LoadingSpinner, ProfileImageUpload, Toast, TwoFactorAuth, PhoneInput } from '../../../components'
import { useTheme } from '../../../contexts/ThemeContext'
import { authUtils } from '../../../utils/auth'
import { calculateAge } from '../../../utils/helpers'
import { PALESTINIAN_CITIES, COUNTRY_CODES } from '../../../utils/constants'

const PatientSettings = () => {
  const { isDarkMode } = useTheme()
  const [activeTab, setActiveTab] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)

  // Patient profile data
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    countryCode: '+970',
    phoneNumber: '',
    gender: '',
    birthDate: '',
    city: '',
    profileImage: '',
    createdAt: '',
    status: ''
  })

  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Fetch patient profile on mount
  useEffect(() => {
    fetchPatientProfile()
  }, [])

  const fetchPatientProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = authUtils.getAccessToken()
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/patients/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile')
      }

      const data = await response.json()
      const patient = data.data || data

      // Parse phone number
      const fullPhone = patient.user?.phone || patient.phone || ''
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
            parsedPhoneNumber = fullPhone
          }
        }
      }

      setProfile({
        firstName: patient.firstName || '',
        lastName: patient.lastName || '',
        email: patient.user?.email || patient.email || '',
        countryCode: parsedCountryCode,
        phoneNumber: parsedPhoneNumber,
        gender: patient.gender || '',
        birthDate: patient.birthDate ? patient.birthDate.split('T')[0] : '',
        city: patient.city || '',
        profileImage: patient.user?.profileImage || patient.profileImage || '',
        createdAt: patient.user?.createdAt || patient.createdAt || '',
        status: patient.user?.status || patient.status || ''
      })
    } catch (err) {
      console.error('Error fetching patient profile:', err)
      setError('Failed to load profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveProfile = async () => {
    try {
      setSaving(true)
      setError(null)
      
      const token = authUtils.getAccessToken()
      const currentUser = authUtils.getCurrentUser()
      const patientId = currentUser?.id
      
      if (!patientId) {
        throw new Error('Patient ID not found')
      }

      const updateData = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: `${profile.countryCode}${profile.phoneNumber}`,
        gender: profile.gender,
        birthDate: profile.birthDate,
        city: profile.city
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/patients/${patientId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update profile')
      }

      setIsEditing(false)
      setToast({ message: 'Profile updated successfully!', type: 'success' })
      await fetchPatientProfile()
    } catch (err) {
      console.error('Error saving profile:', err)
      setError(err.message || 'Failed to save profile. Please try again.')
      setToast({ message: err.message || 'Failed to save profile. Please try again.', type: 'error' })
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

  const renderProfileTab = () => (
    <div className="space-y-6">
      {/* Profile Picture */}
      <Card className={`p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <ProfileImageUpload 
          currentImage={profile.profileImage}
          onImageUpdate={(imageUrl) => {
            setProfile(prev => ({ ...prev, profileImage: imageUrl }))
          }}
          userName={`${profile.firstName} ${profile.lastName}`}
          onToast={setToast}
        />
        <div className="mt-4">
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
            Patient
          </p>
          {profile.birthDate && (
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Age: {calculateAge(profile.birthDate)} years
            </p>
          )}
          {profile.createdAt && (
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Member since: {new Date(profile.createdAt).toLocaleDateString()}
            </p>
          )}
          {profile.status && (
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Status: <span className={`font-medium ${profile.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}`}>{profile.status}</span>
            </p>
          )}
        </div>
      </Card>

      {/* Basic Information */}
      <Card className={`p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className={`text-lg font-semibold ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            Personal Information
          </h3>
          <Button
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
          >
            <FaEdit className="w-4 h-4 mr-2" />
            {isEditing ? 'Cancel' : 'Edit'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              First Name
            </label>
            <Input
              type="text"
              value={profile.firstName}
              onChange={(e) => handleProfileUpdate('firstName', e.target.value)}
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Last Name
            </label>
            <Input
              type="text"
              value={profile.lastName}
              onChange={(e) => handleProfileUpdate('lastName', e.target.value)}
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Email
            </label>
            <Input
              type="email"
              value={profile.email}
              disabled={true}
              icon={FaEnvelope}
            />
            <p className={`text-xs mt-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Email cannot be changed
            </p>
          </div>

          <PhoneInput
            label="Phone"
            countryCode={profile.countryCode}
            phoneNumber={profile.phoneNumber}
            onCountryChange={(e) => handleProfileUpdate('countryCode', e.target.value)}
            onPhoneChange={(e) => handleProfileUpdate('phoneNumber', e.target.value.replace(/\D/g, ''))}
            placeholder="Enter phone number"
            icon={FaPhone}
            className={!isEditing ? 'opacity-60 pointer-events-none' : ''}
          />

          <div>
            <Select
              label="Gender"
              value={profile.gender}
              onChange={(e) => handleProfileUpdate('gender', e.target.value)}
              disabled={!isEditing}
              options={[
                { value: 'Male', label: 'Male' },
                { value: 'Female', label: 'Female' }
              ]}
              placeholder="Select Gender"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Birth Date
            </label>
            <div className="relative">
              <Input
                type="date"
                value={profile.birthDate}
                onChange={(e) => handleProfileUpdate('birthDate', e.target.value)}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              City
            </label>
            <select
              value={profile.city}
              onChange={(e) => handleProfileUpdate('city', e.target.value)}
              disabled={!isEditing}
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
        </div>

        {isEditing && (
          <div className="mt-6 flex gap-4">
            <Button 
              variant="primary"
              onClick={handleSaveProfile}
              disabled={saving}
            >
              <FaSave className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsEditing(false)}
              disabled={saving}
            >
              Cancel
            </Button>
          </div>
        )}
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

  const tabs = [
    { id: 'profile', label: 'Profile', icon: FaUser },
    { id: 'security', label: 'Security', icon: FaLock }
  ]

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

      {/* Error Message */}
      {error && (
        <div className={`p-4 rounded-lg border ${
          isDarkMode 
            ? 'bg-red-900/20 border-red-800 text-red-400' 
            : 'bg-red-50 border-red-200 text-red-600'
        }`}>
          <p>{error}</p>
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

export default PatientSettings
