import { useState, useEffect } from 'react'
import { 
  FaUser,
  FaSave,
  FaLock,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaEdit,
  FaFacebook,
  FaInstagram,
  FaWhatsapp,
  FaTiktok
} from 'react-icons/fa'
import { Card, Button, Input, Select, LoadingSpinner, ProfileImageUpload, Toast, TwoFactorAuth, PhoneInput } from '../../../components'
import { useTheme } from '../../../contexts/ThemeContext'
import { dentistsAPI } from '../../../services/api'
import { authUtils } from '../../../utils/auth'
import { toISODateString, ensureArray } from '../../../utils/helpers'
import { PALESTINIAN_CITIES, COUNTRY_CODES, DENTAL_SPECIALIZATIONS } from '../../../utils/constants'
import DentistSchedule from './DentistSchedule'

const DentistSettings = ({ initialTab }) => {
  const { isDarkMode } = useTheme()
  const [activeTab, setActiveTab] = useState(initialTab || 'profile')
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
    countryCode: '+970',
    phoneNumber: '',
    licenseNumber: '',
    specialization: [],
    birthDate: '',
    gender: '',
    city: '',
    appointmentDuration: 30,
    profileImage: '',
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
    },
    createdAt: '',
    status: ''
  })

  // Fetch dentist profile on mount
  useEffect(() => {
    fetchDentistProfile()
  }, [])
  
  // Handle initial tab changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab)
    }
  }, [initialTab])

  const fetchDentistProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await dentistsAPI.getMyProfile()
      const dentist = response.data?.dentist || response.dentist || response.data
      
      if (!dentist) {
        throw new Error('Dentist profile not found')
      }

      // Parse phone number
      const fullPhone = dentist.user?.phone || dentist.phone || ''
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

      // Map the data to profile state
      // Note: email and phone come from user object
      setProfile({
        firstName: dentist.firstName || '',
        lastName: dentist.lastName || '',
        email: dentist.user?.email || dentist.email || '',
        countryCode: parsedCountryCode,
        phoneNumber: parsedPhoneNumber,
        licenseNumber: dentist.licenseNumber || '',
        specialization: ensureArray(dentist.specialization),
        birthDate: dentist.birthDate ? toISODateString(dentist.birthDate) : '',
        gender: dentist.gender || '',
        city: dentist.city || '',
        appointmentDuration: dentist.appointmentDuration || 30,
        profileImage: dentist.user?.profileImage || dentist.profileImage || '',
        clinic: {
          name: dentist.clinic?.clinicName || '',
          address: dentist.clinic?.location || ''
        },
        workingHours: ensureArray(dentist.workingHours),
        socialLinks: typeof dentist.socialLinks === 'object' && dentist.socialLinks !== null ? {
          facebook: dentist.socialLinks.facebook || '',
          instagram: dentist.socialLinks.instagram || '',
          whatsapp: dentist.socialLinks.whatsapp || '',
          tiktok: dentist.socialLinks.tiktok || ''
        } : {
          facebook: '',
          instagram: '',
          whatsapp: '',
          tiktok: ''
        },
        createdAt: dentist.user?.createdAt || dentist.createdAt || '',
        status: dentist.user?.status || dentist.status || ''
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

  // Helper function to normalize specialization names for matching
  const normalizeSpecialization = (spec) => {
    return spec.trim().toLowerCase()
      .replace(/ist$/, '') // Remove 'ist' ending (e.g., Orthodontist -> Orthodont)
      .replace(/ics$/, '') // Remove 'ics' ending (e.g., Orthodontics -> Orthodont)
      .replace(/ry$/, '') // Remove 'ry' ending (e.g., Dentistry -> Dentist, Surgery -> Surg)
      .replace(/y$/, '') // Remove trailing 'y' (e.g., Implantology -> Implantolog)
  }

  // Helper function to check if a specialization is selected
  const isSpecializationSelected = (spec) => {
    const normalizedSpec = normalizeSpecialization(spec)
    return profile.specialization.some(s => 
      normalizeSpecialization(s) === normalizedSpec
    )
  }

  // Use unique specializations from constants, removing duplicates
  const specializations = [...new Set(DENTAL_SPECIALIZATIONS.map(spec => {
    // Prefer the '-ics' or '-y' ending versions for display
    const normalized = normalizeSpecialization(spec)
    return DENTAL_SPECIALIZATIONS.find(s => 
      normalizeSpecialization(s) === normalized && (s.endsWith('ics') || s.endsWith('y'))
    ) || spec
  }))]

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
        phone: `${profile.countryCode}${profile.phoneNumber}`,
        licenseNumber: profile.licenseNumber,
        specialization: profile.specialization,
        birthDate: profile.birthDate,
        gender: profile.gender,
        city: profile.city,
        appointmentDuration: profile.appointmentDuration,
        socialLinks: profile.socialLinks
      }

      await dentistsAPI.updateMyProfile(updateData)
      setIsEditing(false)
      setToast({ message: 'Profile updated successfully!', type: 'success' })
      
      // Update the stored user data in authUtils
      const currentUser = authUtils.getCurrentUser()
      if (currentUser && currentUser.dentist) {
        const updatedUser = {
          ...currentUser,
          dentist: {
            ...currentUser.dentist,
            firstName: profile.firstName,
            lastName: profile.lastName
          }
        }
        authUtils.updateUser(updatedUser)
      }
      
      // Dispatch event to notify other components
      window.dispatchEvent(new Event('profileUpdated'))
      
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
            {profile.specialization.join(', ')}
          </p>
          <p className={`text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            License: {profile.licenseNumber}
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
          {/* First Name */}
          <Input
            label="First Name"
            type="text"
            value={profile.firstName}
            onChange={(e) => handleProfileUpdate('firstName', e.target.value)}
            disabled={!isEditing}
            className={!isEditing ? 'opacity-60' : ''}
          />

          {/* Last Name */}
          <Input
            label="Last Name"
            type="text"
            value={profile.lastName}
            onChange={(e) => handleProfileUpdate('lastName', e.target.value)}
            disabled={!isEditing}
            className={!isEditing ? 'opacity-60' : ''}
          />

          {/* Email */}
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

          {/* Gender */}
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

          {/* Date of Birth */}
          <Input
            label="Date of Birth"
            type="date"
            value={profile.birthDate}
            onChange={(e) => handleProfileUpdate('birthDate', e.target.value)}
            disabled={!isEditing}
            className={!isEditing ? 'opacity-60' : ''}
          />

          {/* License Number */}
          <div>
            <Input
              label="License Number"
              type="text"
              value={profile.licenseNumber}
              disabled={true}
              className="opacity-60"
            />
            <p className={`text-xs mt-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              License number cannot be changed
            </p>
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

        {/* Specializations Section */}
        <div className="mt-8">
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
                  checked={isSpecializationSelected(spec)}
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

        {/* Social Media Links Section */}
        <div className="mt-8">
          <h3 className={`text-lg font-semibold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            Social Media Links
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Facebook"
              type="url"
              value={profile.socialLinks.facebook}
              onChange={(e) => handleNestedUpdate('socialLinks', 'facebook', e.target.value)}
              disabled={!isEditing}
              icon={FaFacebook}
              placeholder="https://facebook.com/..."
              className={!isEditing ? 'opacity-60' : ''}
            />

            <Input
              label="Instagram"
              type="url"
              value={profile.socialLinks.instagram}
              onChange={(e) => handleNestedUpdate('socialLinks', 'instagram', e.target.value)}
              disabled={!isEditing}
              icon={FaInstagram}
              placeholder="https://instagram.com/..."
              className={!isEditing ? 'opacity-60' : ''}
            />

            <Input
              label="WhatsApp"
              type="tel"
              value={profile.socialLinks.whatsapp}
              onChange={(e) => handleNestedUpdate('socialLinks', 'whatsapp', e.target.value)}
              disabled={!isEditing}
              icon={FaWhatsapp}
              placeholder="+1234567890"
              className={!isEditing ? 'opacity-60' : ''}
            />

            <Input
              label="TikTok"
              type="url"
              value={profile.socialLinks.tiktok}
              onChange={(e) => handleNestedUpdate('socialLinks', 'tiktok', e.target.value)}
              disabled={!isEditing}
              icon={FaTiktok}
              placeholder="https://tiktok.com/@..."
              className={!isEditing ? 'opacity-60' : ''}
            />
          </div>
        </div>

        {/* Save/Cancel Buttons */}
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
      </Card>
    </div>
  )

  const renderSecurityTab = () => (
    <div className="space-y-6">
      {/* Change Password Card */}
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