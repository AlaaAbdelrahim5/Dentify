import { useState, useEffect } from 'react'
import { 
  FaUser,
  FaCamera,
  FaSave,
  FaEdit,
  FaLock,
  FaBell,
  FaGlobe,
  FaStethoscope,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaFacebook,
  FaInstagram,
  FaWhatsapp,
  FaTiktok,
  FaClock
} from 'react-icons/fa'
import { Card, Button, Input, LoadingSpinner, ProfileImageUpload, Toast } from '../../../components'
import { useTheme } from '../../../contexts/ThemeContext'
import { dentistsAPI } from '../../../services/api'
import { authUtils } from '../../../utils/auth'
import { toISODateString, ensureArray } from '../../../utils/helpers'
import DentistSchedule from './DentistSchedule'

const DentistSettings = () => {
  const { isDarkMode } = useTheme()
  const [activeTab, setActiveTab] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)

  // Dentist profile data
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    licenseNumber: '',
    specialization: [],
    birthDate: '',
    gender: '',
    profileImage: '',
    address: {
      city: ''
    },
    clinic: {
      name: '',
      address: ''
    },
    workingHours: [],
    socialLinks: {
      facebook: '',
      instagram: '',
      whatsapp: '',
      tiktok: ''
    }
  })

  // Fetch dentist profile on mount
  useEffect(() => {
    fetchDentistProfile()
  }, [])

  const fetchDentistProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await dentistsAPI.getMyProfile()
      const dentist = response.data?.dentist || response.dentist || response.data
      
      if (!dentist) {
        throw new Error('Dentist profile not found')
      }

      // Map the data to profile state
      // Note: email and phone come from user object
      setProfile({
        firstName: dentist.firstName || '',
        lastName: dentist.lastName || '',
        email: dentist.user?.email || dentist.email || '',
        phone: dentist.user?.phone || dentist.phone || '',
        licenseNumber: dentist.licenseNumber || '',
        specialization: ensureArray(dentist.specialization),
        birthDate: dentist.birthDate ? toISODateString(dentist.birthDate) : '',
        gender: dentist.gender || '',
        profileImage: dentist.user?.profileImage || dentist.profileImage || '',
        address: {
          city: dentist.city || ''
        },
        clinic: {
          name: dentist.clinic?.clinicName || '',
          address: dentist.clinic?.location || ''
        },
        workingHours: ensureArray(dentist.workingHours),
        socialLinks: typeof dentist.socialLinks === 'object' && dentist.socialLinks !== null ? {
          facebook: dentist.socialLinks.facebook || '',
          instagram: dentist.socialLinks.instagram || '',
          whatsapp: dentist.socialLinks.whatsapp || dentist.user?.phone || dentist.phone || '',
          tiktok: dentist.socialLinks.tiktok || ''
        } : {
          facebook: '',
          instagram: '',
          whatsapp: dentist.user?.phone || dentist.phone || '',
          tiktok: ''
        }
      })
    } catch (err) {
      console.error('Error fetching dentist profile:', err)
      setError('Failed to load profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const specializations = [
    'General Dentistry',
    'Orthodontics',
    'Endodontics',
    'Periodontics',
    'Oral Surgery',
    'Prosthodontics',
    'Pediatric Dentistry',
    'Oral Pathology',
    'Cosmetic Dentistry',
    'Implantology'
  ]

  const handleProfileUpdate = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNestedUpdate = (parent, field, value) => {
    setProfile(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }))
  }

  const handleSpecializationChange = (specialization) => {
    setProfile(prev => ({
      ...prev,
      specialization: prev.specialization.includes(specialization)
        ? prev.specialization.filter(s => s !== specialization)
        : [...prev.specialization, specialization]
    }))
  }

  const handleSaveProfile = async () => {
    try {
      setSaving(true)
      setError(null)
      
      // Prepare data for API
      const updateData = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        licenseNumber: profile.licenseNumber,
        specialization: profile.specialization,
        birthDate: profile.birthDate,
        gender: profile.gender,
        city: profile.address.city,
        socialLinks: profile.socialLinks
      }

      await dentistsAPI.updateMyProfile(updateData)
      setIsEditing(false)
      setToast({ message: 'Profile updated successfully!', type: 'success' })
      // Refresh profile data
      await fetchDentistProfile()
    } catch (err) {
      console.error('Error saving profile:', err)
      setError('Failed to save profile. Please try again.')
      setToast({ message: 'Failed to save profile. Please try again.', type: 'error' })
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

      const response = await fetch('http://localhost:5000/api/auth/change-password', {
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
        />
        <div className="mt-4">
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
            {profile.specialization.join(', ')}
          </p>
          <p className={`text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            License: {profile.licenseNumber}
          </p>
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
              onChange={(e) => handleProfileUpdate('email', e.target.value)}
              disabled={true}
              icon={FaEnvelope}
            />
            <p className={`text-xs mt-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Email cannot be changed
            </p>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Phone
            </label>
            <Input
              type="tel"
              value={profile.phone}
              onChange={(e) => handleProfileUpdate('phone', e.target.value)}
              disabled={!isEditing}
              icon={FaPhone}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              License Number
            </label>
            <Input
              type="text"
              value={profile.licenseNumber}
              onChange={(e) => handleProfileUpdate('licenseNumber', e.target.value)}
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Gender
            </label>
            <select
              value={profile.gender}
              onChange={(e) => handleProfileUpdate('gender', e.target.value)}
              disabled={!isEditing}
              className={`w-full px-3 py-2 border rounded-lg ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } ${!isEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Date of Birth
            </label>
            <input
              type="date"
              value={profile.birthDate}
              onChange={(e) => handleProfileUpdate('birthDate', e.target.value)}
              disabled={!isEditing}
              className={`w-full px-3 py-2 border rounded-lg ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } ${!isEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              City
            </label>
            <Input
              type="text"
              value={profile.address.city}
              onChange={(e) => handleNestedUpdate('address', 'city', e.target.value)}
              disabled={!isEditing}
              icon={FaMapMarkerAlt}
            />
          </div>
        </div>

        <div className="mt-6">
          <h3 className={`text-lg font-semibold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            Specializations
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {specializations.map((spec) => (
              <label key={spec} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={profile.specialization.includes(spec)}
                  onChange={() => handleSpecializationChange(spec)}
                  disabled={!isEditing}
                  className="w-4 h-4 text-teal-600 rounded"
                />
                <span className={`text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {spec}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <h3 className={`text-lg font-semibold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            Social Media Links
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Facebook
              </label>
              <Input
                type="url"
                value={profile.socialLinks.facebook}
                onChange={(e) => handleNestedUpdate('socialLinks', 'facebook', e.target.value)}
                disabled={!isEditing}
                icon={FaFacebook}
                placeholder="https://facebook.com/..."
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Instagram
              </label>
              <Input
                type="url"
                value={profile.socialLinks.instagram}
                onChange={(e) => handleNestedUpdate('socialLinks', 'instagram', e.target.value)}
                disabled={!isEditing}
                icon={FaInstagram}
                placeholder="https://instagram.com/..."
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                WhatsApp
              </label>
              <Input
                type="tel"
                value={profile.socialLinks.whatsapp}
                onChange={(e) => handleNestedUpdate('socialLinks', 'whatsapp', e.target.value)}
                disabled={!isEditing}
                icon={FaWhatsapp}
                placeholder="+1234567890"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                TikTok
              </label>
              <Input
                type="url"
                value={profile.socialLinks.tiktok}
                onChange={(e) => handleNestedUpdate('socialLinks', 'tiktok', e.target.value)}
                disabled={!isEditing}
                icon={FaTiktok}
                placeholder="https://tiktok.com/@..."
              />
            </div>
          </div>

          {isEditing && (
            <div className="mt-8 flex gap-4">
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
        </div>
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
    </div>
  )

  const tabs = [
    { id: 'profile', label: 'Profile', icon: FaUser },
    { id: 'schedule', label: 'Schedule', icon: FaClock },
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
          {activeTab === 'schedule' && <DentistSchedule />}
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

export default DentistSettings