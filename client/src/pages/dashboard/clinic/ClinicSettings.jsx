import { useState, useEffect } from 'react'
import { 
  FaBuilding,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaSave,
  FaEdit,
  FaUser,
  FaLock,
  FaBell,
  FaKey,
  FaPalette,
  FaGlobe
} from 'react-icons/fa'
import { Card, Button, Input } from '../../../components'
import { useTheme } from '../../../contexts/ThemeContext'
import { authUtils } from '../../../utils/auth'
import api from '../../../services/api'

const ClinicSettings = () => {
  const { isDarkMode } = useTheme()
  const [activeSection, setActiveSection] = useState('general')
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  
  const [clinicInfo, setClinicInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
    website: '',
    description: ''
  })

  const [workingHours, setWorkingHours] = useState({
    monday: { start: '09:00', end: '17:00', isOpen: true },
    tuesday: { start: '09:00', end: '17:00', isOpen: true },
    wednesday: { start: '09:00', end: '17:00', isOpen: true },
    thursday: { start: '09:00', end: '17:00', isOpen: true },
    friday: { start: '09:00', end: '17:00', isOpen: true },
    saturday: { start: '09:00', end: '14:00', isOpen: true },
    sunday: { start: '10:00', end: '14:00', isOpen: false }
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    appointmentReminders: true,
    systemUpdates: false,
    marketingEmails: false
  })

  useEffect(() => {
    const user = authUtils.getCurrentUser()
    if (user) {
      setCurrentUser(user)
      loadClinicData(user.id)
    }
  }, [])

  const loadClinicData = async (clinicId) => {
    try {
      setLoading(true)
      const response = await api.get(`/clinics/${clinicId}`)
      const clinic = response.data.data // API returns { success: true, data: clinic }
      
      setClinicInfo({
        name: clinic.clinicName || '',
        email: clinic.userId?.email || '',
        phone: clinic.userId?.phone || '',
        address: clinic.location || '',
        city: clinic.city || '',
        country: clinic.country || '',
        postalCode: clinic.postalCode || '',
        website: clinic.website || '',
        description: clinic.description || ''
      })
      
      // Load working hours if they exist
      if (clinic.workingHours) {
        const hoursObject = Array.isArray(clinic.workingHours) 
          ? convertWorkingHoursArrayToObject(clinic.workingHours)
          : clinic.workingHours
        setWorkingHours(hoursObject)
      }
    } catch (error) {
      console.error('Error loading clinic data:', error)
    } finally {
      setLoading(false)
    }
  }

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
      monday: { start: '09:00', end: '17:00', isOpen: false },
      tuesday: { start: '09:00', end: '17:00', isOpen: false },
      wednesday: { start: '09:00', end: '17:00', isOpen: false },
      thursday: { start: '09:00', end: '17:00', isOpen: false },
      friday: { start: '09:00', end: '17:00', isOpen: false },
      saturday: { start: '09:00', end: '14:00', isOpen: false },
      sunday: { start: '10:00', end: '14:00', isOpen: false }
    }
    
    // Fill in the actual working hours
    workingHoursArray.forEach(({ day, startTime, endTime }) => {
      const dayKey = daysMap[day]
      if (dayKey) {
        result[dayKey] = {
          isOpen: true,
          start: startTime,
          end: endTime
        }
      }
    })
    
    return result
  }

  const handleSaveGeneralInfo = async () => {
    try {
      setLoading(true)
      
      // Prepare data in the format expected by the backend
      const updateData = {
        clinicData: {
          clinicName: clinicInfo.name,
          location: clinicInfo.address,
          city: clinicInfo.city,
          website: clinicInfo.website,
          description: clinicInfo.description
        },
        userData: {
          phone: clinicInfo.phone
        }
      }
      
      await api.put(`/clinics/${currentUser.id}`, updateData)
      setIsEditing(false)
      alert('Clinic information updated successfully!')
    } catch (error) {
      console.error('Error updating clinic info:', error)
      alert('Error updating clinic information')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveWorkingHours = async () => {
    try {
      setLoading(true)
      await api.put(`/clinics/${currentUser.id}/working-hours`, { workingHours })
      alert('Working hours updated successfully!')
    } catch (error) {
      console.error('Error updating working hours:', error)
      alert('Error updating working hours')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match')
      return
    }

    try {
      setLoading(true)
      await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      alert('Password changed successfully!')
    } catch (error) {
      console.error('Error changing password:', error)
      alert('Error changing password')
    } finally {
      setLoading(false)
    }
  }

  const settingSections = [
    { id: 'general', label: 'General Information', icon: FaBuilding },
    { id: 'hours', label: 'Working Hours', icon: FaClock },
    { id: 'security', label: 'Security', icon: FaLock },
    { id: 'notifications', label: 'Notifications', icon: FaBell }
  ]

  const renderGeneralSettings = () => (
    <Card className={`p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          General Information
        </h3>
        <Button
          variant={isEditing ? "secondary" : "primary"}
          onClick={() => setIsEditing(!isEditing)}
          disabled={loading}
        >
          <FaEdit className="w-4 h-4 mr-2" />
          {isEditing ? 'Cancel' : 'Edit'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Clinic Name"
          icon={FaBuilding}
          value={clinicInfo.name}
          onChange={(e) => setClinicInfo({ ...clinicInfo, name: e.target.value })}
          disabled={!isEditing}
        />
        
        <Input
          label="Email"
          type="email"
          icon={FaEnvelope}
          value={clinicInfo.email}
          onChange={(e) => setClinicInfo({ ...clinicInfo, email: e.target.value })}
          disabled={!isEditing}
        />
        
        <Input
          label="Phone"
          icon={FaPhone}
          value={clinicInfo.phone}
          onChange={(e) => setClinicInfo({ ...clinicInfo, phone: e.target.value })}
          disabled={!isEditing}
        />
        
        <Input
          label="Website"
          icon={FaGlobe}
          value={clinicInfo.website}
          onChange={(e) => setClinicInfo({ ...clinicInfo, website: e.target.value })}
          disabled={!isEditing}
        />
        
        <Input
          label="Address"
          icon={FaMapMarkerAlt}
          value={clinicInfo.address}
          onChange={(e) => setClinicInfo({ ...clinicInfo, address: e.target.value })}
          disabled={!isEditing}
        />
        
        <Input
          label="City"
          value={clinicInfo.city}
          onChange={(e) => setClinicInfo({ ...clinicInfo, city: e.target.value })}
          disabled={!isEditing}
        />
        
        <Input
          label="Country"
          value={clinicInfo.country}
          onChange={(e) => setClinicInfo({ ...clinicInfo, country: e.target.value })}
          disabled={!isEditing}
        />
        
        <Input
          label="Postal Code"
          value={clinicInfo.postalCode}
          onChange={(e) => setClinicInfo({ ...clinicInfo, postalCode: e.target.value })}
          disabled={!isEditing}
        />
      </div>

      <div className="mt-6">
        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Description
        </label>
        <textarea
          rows={4}
          value={clinicInfo.description}
          onChange={(e) => setClinicInfo({ ...clinicInfo, description: e.target.value })}
          disabled={!isEditing}
          className={`w-full px-3 py-2 border rounded-lg ${
            isDarkMode 
              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
              : 'bg-white border-gray-300 text-gray-900'
          } ${!isEditing ? 'opacity-60' : ''}`}
          placeholder="Brief description of your clinic..."
        />
      </div>

      {isEditing && (
        <div className="flex justify-end mt-6">
          <Button
            variant="primary"
            onClick={handleSaveGeneralInfo}
            disabled={loading}
          >
            <FaSave className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      )}
    </Card>
  )

  const renderWorkingHours = () => (
    <Card className={`p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
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
              <span className={`font-medium capitalize min-w-[100px] ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
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
          disabled={loading}
        >
          <FaSave className="w-4 h-4 mr-2" />
          {loading ? 'Saving...' : 'Save Working Hours'}
        </Button>
      </div>
    </Card>
  )

  const renderSecuritySettings = () => (
    <Card className={`p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
      <h3 className={`text-xl font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
        Security Settings
      </h3>

      <div className="space-y-6">
        <div>
          <h4 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Change Password
          </h4>
          <div className="grid grid-cols-1 gap-4 max-w-md">
            <Input
              label="Current Password"
              type="password"
              icon={FaLock}
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
            />
            <Input
              label="New Password"
              type="password"
              icon={FaLock}
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
            />
            <Input
              label="Confirm New Password"
              type="password"
              icon={FaLock}
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
            />
            <Button
              variant="primary"
              onClick={handleChangePassword}
              disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
            >
              <FaKey className="w-4 h-4 mr-2" />
              {loading ? 'Changing...' : 'Change Password'}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )

  const renderNotificationSettings = () => (
    <Card className={`p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
      <h3 className={`text-xl font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
        Notification Preferences
      </h3>

      <div className="space-y-4">
        {Object.entries(notifications).map(([key, value]) => (
          <div key={key} className={`flex items-center justify-between p-4 rounded-lg border ${
            isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'
          }`}>
            <div>
              <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </span>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {key === 'emailNotifications' && 'Receive general email notifications'}
                {key === 'appointmentReminders' && 'Get reminders about upcoming appointments'}
                {key === 'systemUpdates' && 'Receive system updates and maintenance notifications'}
                {key === 'marketingEmails' && 'Receive promotional emails and updates'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => setNotifications({ ...notifications, [key]: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 dark:peer-focus:ring-teal-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-teal-600"></div>
            </label>
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-6">
        <Button
          variant="primary"
          onClick={() => alert('Notification preferences saved!')}
        >
          <FaSave className="w-4 h-4 mr-2" />
          Save Preferences
        </Button>
      </div>
    </Card>
  )

  const renderContent = () => {
    switch (activeSection) {
      case 'general':
        return renderGeneralSettings()
      case 'hours':
        return renderWorkingHours()
      case 'security':
        return renderSecuritySettings()
      case 'notifications':
        return renderNotificationSettings()
      default:
        return renderGeneralSettings()
    }
  }

  return (
    <div className="space-y-6">
      {/* Section Navigation */}
      <div className="flex flex-wrap gap-2">
        {settingSections.map((section) => {
          const Icon = section.icon
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                activeSection === section.id
                  ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg'
                  : isDarkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {section.label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  )
}

export default ClinicSettings