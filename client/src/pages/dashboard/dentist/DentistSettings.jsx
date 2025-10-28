import { useState } from 'react'
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
import { Card, Button, Input } from '../../../components'
import { useTheme } from '../../../contexts/ThemeContext'
import DentistSchedule from './DentistSchedule'

const DentistSettings = () => {
  const { isDarkMode } = useTheme()
  const [activeTab, setActiveTab] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)

  // Mock dentist profile data
  const [profile, setProfile] = useState({
    firstName: 'Dr. John',
    lastName: 'Smith',
    email: 'dr.john@dentify.com',
    phone: '+1234567890',
    licenseNumber: 'DDS12345',
    specialization: ['General Dentistry', 'Cosmetic Dentistry'],
    birthDate: '1985-03-15',
    gender: 'male',
    address: {
      city: 'New York'
    },
    clinic: {
      name: 'Smile Dental Center',
      address: '123 Main St, New York, NY'
    },
    bio: 'Experienced dentist with over 10 years of practice in general and cosmetic dentistry.',
    workingHours: [
      { day: 'Monday', startTime: '09:00', endTime: '17:00' },
      { day: 'Tuesday', startTime: '09:00', endTime: '17:00' },
      { day: 'Wednesday', startTime: '09:00', endTime: '17:00' },
      { day: 'Thursday', startTime: '09:00', endTime: '17:00' },
      { day: 'Friday', startTime: '09:00', endTime: '15:00' }
    ],
    socialLinks: {
      facebook: '',
      instagram: '',
      whatsapp: '+1234567890',
      tiktok: ''
    }
  })

  const [notifications, setNotifications] = useState({
    emailAppointments: true,
    emailReminders: true,
    smsAppointments: false,
    smsReminders: true,
    pushNotifications: true,
    marketingEmails: false
  })

  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false
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

  const renderProfileTab = () => (
    <div className="space-y-6">
      {/* Profile Picture */}
      <Card className={`p-6 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
              isDarkMode ? 'bg-teal-900' : 'bg-teal-100'
            }`}>
              <FaUser className="w-10 h-10 text-teal-600" />
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white hover:bg-teal-700">
              <FaCamera className="w-4 h-4" />
            </button>
          </div>
          <div>
            <h3 className={`text-xl font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>
              {profile.firstName} {profile.lastName}
            </h3>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
              {profile.specialization.join(', ')}
            </p>
            <p className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              License: {profile.licenseNumber}
            </p>
          </div>
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
            Basic Information
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
              disabled={!isEditing}
              icon={FaEnvelope}
            />
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
              <option value="male">Male</option>
              <option value="female">Female</option>
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
          <label className={`block text-sm font-medium mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Bio
          </label>
          <textarea
            value={profile.bio}
            onChange={(e) => handleProfileUpdate('bio', e.target.value)}
            disabled={!isEditing}
            rows={4}
            className={`w-full px-3 py-2 border rounded-lg resize-none ${
              isDarkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            } ${!isEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
            placeholder="Tell patients about yourself..."
          />
        </div>

        {isEditing && (
          <div className="mt-6 flex gap-4">
            <Button variant="primary">
              <FaSave className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
          </div>
        )}
      </Card>

      {/* Specializations */}
      <Card className={`p-6 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
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
      </Card>

      {/* Social Links */}
      <Card className={`p-6 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
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
      </Card>
    </div>
  )

  const renderNotificationTab = () => (
    <Card className={`p-6 ${
      isDarkMode ? 'bg-gray-800' : 'bg-white'
    }`}>
      <h3 className={`text-lg font-semibold mb-6 ${
        isDarkMode ? 'text-white' : 'text-gray-800'
      }`}>
        Notification Preferences
      </h3>

      <div className="space-y-6">
        <div>
          <h4 className={`text-md font-medium mb-4 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Email Notifications
          </h4>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                New appointment notifications
              </span>
              <input
                type="checkbox"
                checked={notifications.emailAppointments}
                onChange={(e) => setNotifications(prev => ({
                  ...prev,
                  emailAppointments: e.target.checked
                }))}
                className="w-5 h-5 text-teal-600 rounded"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                Appointment reminders
              </span>
              <input
                type="checkbox"
                checked={notifications.emailReminders}
                onChange={(e) => setNotifications(prev => ({
                  ...prev,
                  emailReminders: e.target.checked
                }))}
                className="w-5 h-5 text-teal-600 rounded"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                Marketing emails
              </span>
              <input
                type="checkbox"
                checked={notifications.marketingEmails}
                onChange={(e) => setNotifications(prev => ({
                  ...prev,
                  marketingEmails: e.target.checked
                }))}
                className="w-5 h-5 text-teal-600 rounded"
              />
            </label>
          </div>
        </div>

        <div>
          <h4 className={`text-md font-medium mb-4 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            SMS Notifications
          </h4>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                New appointment notifications
              </span>
              <input
                type="checkbox"
                checked={notifications.smsAppointments}
                onChange={(e) => setNotifications(prev => ({
                  ...prev,
                  smsAppointments: e.target.checked
                }))}
                className="w-5 h-5 text-teal-600 rounded"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                Appointment reminders
              </span>
              <input
                type="checkbox"
                checked={notifications.smsReminders}
                onChange={(e) => setNotifications(prev => ({
                  ...prev,
                  smsReminders: e.target.checked
                }))}
                className="w-5 h-5 text-teal-600 rounded"
              />
            </label>
          </div>
        </div>

        <div>
          <h4 className={`text-md font-medium mb-4 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Push Notifications
          </h4>
          <label className="flex items-center justify-between">
            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
              Enable push notifications
            </span>
            <input
              type="checkbox"
              checked={notifications.pushNotifications}
              onChange={(e) => setNotifications(prev => ({
                ...prev,
                pushNotifications: e.target.checked
              }))}
              className="w-5 h-5 text-teal-600 rounded"
            />
          </label>
        </div>
      </div>

      <div className="mt-8">
        <Button variant="primary">
          <FaSave className="w-4 h-4 mr-2" />
          Save Notification Settings
        </Button>
      </div>
    </Card>
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

          <Button variant="primary">
            Update Password
          </Button>
        </div>
      </Card>

      {/* Two-Factor Authentication */}
      <Card className={`p-6 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>
          Two-Factor Authentication
        </h3>

        <div className="flex items-center justify-between">
          <div>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
              Add an extra layer of security to your account
            </p>
            <p className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {security.twoFactorEnabled ? 'Two-factor authentication is enabled' : 'Two-factor authentication is disabled'}
            </p>
          </div>
          <Button
            variant={security.twoFactorEnabled ? "outline" : "primary"}
            onClick={() => setSecurity(prev => ({
              ...prev,
              twoFactorEnabled: !prev.twoFactorEnabled
            }))}
          >
            {security.twoFactorEnabled ? 'Disable' : 'Enable'}
          </Button>
        </div>
      </Card>
    </div>
  )

  const tabs = [
    { id: 'profile', label: 'Profile', icon: FaUser },
    { id: 'schedule', label: 'Schedule', icon: FaClock },
    { id: 'notifications', label: 'Notifications', icon: FaBell },
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
      {activeTab === 'profile' && renderProfileTab()}
      {activeTab === 'schedule' && <DentistSchedule />}
      {activeTab === 'notifications' && renderNotificationTab()}
      {activeTab === 'security' && renderSecurityTab()}
    </div>
  )
}

export default DentistSettings