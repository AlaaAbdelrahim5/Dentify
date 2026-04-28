import { useState, useEffect } from 'react'
import { 
  FaUser,
  FaSave,
  FaLock,
  FaPhone,
  FaEnvelope,
  FaEdit
} from 'react-icons/fa'
import { Card, Button, Input, Select, LoadingSpinner, ProfileImageUpload, Toast, TwoFactorAuth, PhoneInput } from '../../../components'
import { useTheme } from '../../../contexts/ThemeContext'
import { authUtils } from '../../../utils/auth'
import { getImageUrl } from '../../../utils/helpers'
import { COUNTRY_CODES } from '../../../utils/constants'

const AdminSettings = () => {
  const { isDarkMode } = useTheme()
  const [activeTab, setActiveTab] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)

  // Admin profile data
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    countryCode: '+970',
    phoneNumber: '',
    gender: '',
    profileImage: '',
    createdAt: '',
    status: ''
  })

  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Fetch admin profile on mount
  useEffect(() => {
    fetchAdminProfile()
  }, [])

  const fetchAdminProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = authUtils.getAccessToken()
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile')
      }

      const data = await response.json()
      const admin = data.data || data

      // Parse phone number
      const fullPhone = admin.user?.phone || admin.phone || ''
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

      setProfile({
        firstName: admin.firstName || '',
        lastName: admin.lastName || '',
        email: admin.user?.email || admin.email || '',
        countryCode: parsedCountryCode,
        phoneNumber: parsedPhoneNumber,
        gender: admin.gender || '',
        profileImage: admin.user?.profileImage || admin.profileImage || '',
        createdAt: admin.user?.createdAt || admin.createdAt || '',
        status: admin.user?.status || admin.status || ''
      })
    } catch (err) {
      console.error('Error fetching admin profile:', err)
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
      const adminId = currentUser?.id
      
      if (!adminId) {
        throw new Error('Admin ID not found')
      }

      const updateData = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: `${profile.countryCode}${profile.phoneNumber}`,
        gender: profile.gender
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/${adminId}`, {
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
      
      // Update the stored user data in authUtils
      const updatedCurrentUser = authUtils.getCurrentUser()
      if (updatedCurrentUser && updatedCurrentUser.admin) {
        const updatedUser = {
          ...updatedCurrentUser,
          admin: {
            ...updatedCurrentUser.admin,
            firstName: profile.firstName,
            lastName: profile.lastName
          }
        }
        authUtils.updateUser(updatedUser)
      }
      
      // Dispatch event to notify other components
      window.dispatchEvent(new Event('profileUpdated'))
      
      await fetchAdminProfile()
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
      <Card className={`p-6 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
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
            System Administrator
          </p>
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
      <Card className={`p-6 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
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
          <Input
            label="First Name"
            type="text"
            value={profile.firstName}
            onChange={(e) => handleProfileUpdate('firstName', e.target.value)}
            disabled={!isEditing}
            className={!isEditing ? 'opacity-60' : ''}
          />

          <Input
            label="Last Name"
            type="text"
            value={profile.lastName}
            onChange={(e) => handleProfileUpdate('lastName', e.target.value)}
            disabled={!isEditing}
            className={!isEditing ? 'opacity-60' : ''}
          />

          <div>
            <Input
              label="Email"
              type="email"
              value={profile.email}
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
            className={!isEditing ? 'opacity-60' : ''}
          />
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
      <Card className={`p-6 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
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

export default AdminSettings
