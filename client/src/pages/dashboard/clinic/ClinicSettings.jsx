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
  FaGlobe,
  FaIdCard
} from 'react-icons/fa'
import { Card, Button, Input, ProfileImageUpload } from '../../../components'
import { AvailableTreatmentsManager } from '../../../components/features'
import { useTheme } from '../../../contexts/ThemeContext'
import { authUtils } from '../../../utils/auth'
import api from '../../../services/api'

const ClinicSettings = () => {
  const { isDarkMode } = useTheme()
  const [activeTab, setActiveTab] = useState('general')
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  
  const [clinicInfo, setClinicInfo] = useState({
    name: '',
    registrationNumber: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    website: '',
    description: '',
    profileImage: ''
  })

  const [workingHours, setWorkingHours] = useState({
    sunday: { start: '', end: '', isOpen: false },
    monday: { start: '', end: '', isOpen: false },
    tuesday: { start: '', end: '', isOpen: false },
    wednesday: { start: '', end: '', isOpen: false },
    thursday: { start: '', end: '', isOpen: false },
    friday: { start: '', end: '', isOpen: false },
    saturday: { start: '', end: '', isOpen: false }
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
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
      const response = await api.get(`/clinics/me`)
      
      const clinic = response.data.data || response.data // Handle both formats
      
      // Set actual values from database
      setClinicInfo({
        name: clinic.clinicName || '',
        registrationNumber: clinic.registrationNumber || '',
        email: clinic.user?.email || clinic.email || '',
        phone: clinic.user?.phone || clinic.phone || '',
        address: clinic.location || clinic.address || '',
        city: clinic.city || '',
        website: clinic.website || '',
        description: clinic.description || '',
        profileImage: clinic.user?.profileImage || clinic.profileImage || ''
      })
      
      // Load working hours if they exist
      if (clinic.workingHours && clinic.workingHours.length > 0) {
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

  const handleSaveGeneralInfo = async () => {
    try {
      setLoading(true)
      
      // Prepare data in the format expected by the backend
      const updateData = {
        clinicName: clinicInfo.name,
        location: clinicInfo.address,
        city: clinicInfo.city,
        website: clinicInfo.website,
        description: clinicInfo.description
      }
      
      // Handle phone update separately if it changed (it's in User table)
      const phoneUpdatePromises = []
      if (clinicInfo.phone) {
        phoneUpdatePromises.push(
          api.put('/users/me', { phone: clinicInfo.phone })
        )
      }
      
      await Promise.all([
        api.put(`/clinics/me`, updateData),
        ...phoneUpdatePromises
      ])
      
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
      
      // Convert working hours object to array format expected by backend
      const workingHoursArray = Object.entries(workingHours).map(([day, hours]) => ({
        day: day.charAt(0).toUpperCase() + day.slice(1),
        startTime: hours.start,
        endTime: hours.end,
        isOpen: hours.isOpen
      }))
      
      await api.put(`/clinics/me`, { workingHours: workingHoursArray })
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

    if (passwordData.newPassword.length < 6) {
      alert('Password must be at least 6 characters long!')
      return
    }

    try {
      setLoading(true)
      await api.post('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      alert('Password changed successfully!')
    } catch (error) {
      console.error('Error changing password:', error)
      alert(error.response?.data?.error || 'Error changing password')
    } finally {
      setLoading(false)
    }
  }

  const settingSections = [
    { id: 'general', label: 'General Information', icon: FaBuilding },
    { id: 'hours', label: 'Working Hours', icon: FaClock },
    { id: 'treatments', label: 'Available Treatments', icon: FaIdCard },
    { id: 'security', label: 'Security', icon: FaLock }
  ]

  const renderGeneralSettings = () => (
    <>
      {/* Profile Picture Card */}
      <Card className={`p-6 mb-6 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <ProfileImageUpload 
          currentImage={clinicInfo.profileImage}
          onImageUpdate={(imageUrl) => {
            setClinicInfo(prev => ({ ...prev, profileImage: imageUrl }))
          }}
          userName={clinicInfo.name}
        />
      </Card>

      {/* General Information Card */}
      <Card className={`p-6 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
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
          <div>
            <Input
              label="Clinic Name"
              icon={FaBuilding}
              value={clinicInfo.name}
              onChange={(e) => setClinicInfo({ ...clinicInfo, name: e.target.value })}
              disabled={!isEditing}
            />
          </div>
          
          <div>
            <Input
              label="Email"
              type="email"
              icon={FaEnvelope}
              value={clinicInfo.email}
              disabled={true}
            />
            <p className={`text-xs mt-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Email cannot be changed
            </p>
          </div>
          
          <div>
            <Input
              label="Phone"
              icon={FaPhone}
              value={clinicInfo.phone}
              onChange={(e) => setClinicInfo({ ...clinicInfo, phone: e.target.value })}
              disabled={!isEditing}
            />
          </div>
          
          <div>
            <Input
              label="Registration Number"
              icon={FaIdCard}
              value={clinicInfo.registrationNumber}
              disabled={true}
            />
            <p className={`text-xs mt-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Registration number cannot be changed
            </p>
          </div>
          
          <div>
            <Input
              label="Website"
              icon={FaGlobe}
              value={clinicInfo.website}
              onChange={(e) => setClinicInfo({ ...clinicInfo, website: e.target.value })}
              disabled={!isEditing}
            />
          </div>
          
          <div>
            <Input
              label="Address"
              icon={FaMapMarkerAlt}
              value={clinicInfo.address}
              onChange={(e) => setClinicInfo({ ...clinicInfo, address: e.target.value })}
              disabled={!isEditing}
            />
          </div>
          
          <div>
            <Input
              label="City"
              value={clinicInfo.city}
              onChange={(e) => setClinicInfo({ ...clinicInfo, city: e.target.value })}
              disabled={!isEditing}
            />
          </div>
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
    </>
  )

  const renderWorkingHours = () => (
    <Card className={`p-6 ${
      isDarkMode ? 'bg-gray-800' : 'bg-white'
    }`}>
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
          disabled={loading}
        >
          <FaSave className="w-4 h-4 mr-2" />
          {loading ? 'Saving...' : 'Save Working Hours'}
        </Button>
      </div>
    </Card>
  )

  const renderSecuritySettings = () => (
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
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData(prev => ({
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
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData(prev => ({
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
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData(prev => ({
                ...prev,
                confirmPassword: e.target.value
              }))}
              icon={FaLock}
            />
          </div>

          <Button 
            variant="primary"
            onClick={handleChangePassword}
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </Button>
        </div>
      </Card>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings()
      case 'hours':
        return renderWorkingHours()
      case 'treatments':
        return <AvailableTreatmentsManager clinicId={currentUser?.id} />
      case 'security':
        return renderSecuritySettings()
      default:
        return renderGeneralSettings()
    }
  }

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
          {settingSections.map((section) => {
            const Icon = section.icon
            return (
              <button
                key={section.id}
                onClick={() => setActiveTab(section.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === section.id
                    ? 'bg-teal-600 text-white'
                    : isDarkMode
                      ? 'text-gray-300 hover:bg-gray-700'
                      : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {section.label}
              </button>
            )
          })}
        </div>
      </Card>

      {/* Tab Content */}
      {renderContent()}
    </div>
  )
}

export default ClinicSettings