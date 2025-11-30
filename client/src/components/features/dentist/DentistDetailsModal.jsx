import { useState } from 'react'
import { 
  FaTimes,
  FaUser,
  FaCalendarAlt,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaIdCard,
  FaVenusMars,
  FaCertificate,
  FaGraduationCap,
  FaClock,
  FaBirthdayCake,
  FaEdit,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaTwitter,
  FaGlobe
} from 'react-icons/fa'
import { Button, Card, StatusBadge } from '../../common'
import { useTheme } from '../../../contexts/ThemeContext'

const DentistDetailsModal = ({ isOpen, onClose, dentistData, onEdit }) => {
  const { isDarkMode } = useTheme()
  const [activeTab, setActiveTab] = useState('overview')

  if (!isOpen || !dentistData) return null

  const calculateAge = (dateOfBirth) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusInfo = (status) => {
    switch (status) {
      case 'ACTIVE':
        return { icon: FaCheckCircle, label: 'Active', color: 'text-green-600' }
      case 'PENDING':
        return { icon: FaHourglassHalf, label: 'Pending Approval', color: 'text-yellow-600' }
      case 'DEACTIVATED':
        return { icon: FaTimesCircle, label: 'Deactivated', color: 'text-red-600' }
      default:
        return { icon: FaTimesCircle, label: status, color: 'text-gray-600' }
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaUser },
    { id: 'schedule', label: 'Schedule', icon: FaClock },
    { id: 'social', label: 'Social Links', icon: FaGlobe }
  ]

  const renderInfoRow = (icon, label, value) => (
    <div className="flex items-start gap-3 py-3">
      <div className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {label}
        </p>
        <p className={`mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {value || 'Not provided'}
        </p>
      </div>
    </div>
  )

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Personal Information */}
      <Card className={`p-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          <FaUser className="w-5 h-5" />
          Personal Information
        </h3>
        <div className="space-y-1 divide-y divide-gray-200 dark:divide-gray-600">
          {renderInfoRow(
            <FaUser className="w-4 h-4" />,
            'Full Name',
            `${dentistData.firstName} ${dentistData.lastName}`
          )}
          {renderInfoRow(
            <FaEnvelope className="w-4 h-4" />,
            'Email',
            dentistData.userId?.email
          )}
          {renderInfoRow(
            <FaPhone className="w-4 h-4" />,
            'Phone',
            dentistData.userId?.phone
          )}
          {renderInfoRow(
            <FaBirthdayCake className="w-4 h-4" />,
            'Date of Birth',
            `${formatDate(dentistData.birthDate)} (${calculateAge(dentistData.birthDate)} years old)`
          )}
          {renderInfoRow(
            <FaVenusMars className="w-4 h-4" />,
            'Gender',
            dentistData.gender
          )}
          {renderInfoRow(
            <FaMapMarkerAlt className="w-4 h-4" />,
            'City',
            dentistData.city
          )}
        </div>
      </Card>

      {/* Professional Information */}
      <Card className={`p-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          <FaCertificate className="w-5 h-5" />
          Professional Information
        </h3>
        <div className="space-y-1 divide-y divide-gray-200 dark:divide-gray-600">
          {renderInfoRow(
            <FaIdCard className="w-4 h-4" />,
            'License Number',
            dentistData.licenseNumber
          )}
          {renderInfoRow(
            <FaGraduationCap className="w-4 h-4" />,
            'Specializations',
            dentistData.specialization && dentistData.specialization.length > 0
              ? dentistData.specialization.join(', ')
              : 'General Dentistry'
          )}
          {renderInfoRow(
            <FaClock className="w-4 h-4" />,
            'Appointment Duration',
            `${dentistData.appointmentDuration || 30} minutes`
          )}
        </div>
      </Card>

      {/* Account Status */}
      <Card className={`p-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          <FaCheckCircle className="w-5 h-5" />
          Account Status
        </h3>
        <div className="space-y-1 divide-y divide-gray-200 dark:divide-gray-600">
          {renderInfoRow(
            <FaCheckCircle className="w-4 h-4" />,
            'Status',
            <StatusBadge 
              isActive={dentistData.userId?.status === 'ACTIVE'}
              activeIcon={FaCheckCircle}
              inactiveIcon={dentistData.userId?.status === 'PENDING' ? FaHourglassHalf : FaTimesCircle}
              activeLabel="Active"
              inactiveLabel={dentistData.userId?.status === 'PENDING' ? 'Pending' : 'Inactive'}
            />
          )}
          {renderInfoRow(
            <FaCalendarAlt className="w-4 h-4" />,
            'Joined Date',
            formatDate(dentistData.userId?.createdAt)
          )}
        </div>
      </Card>
    </div>
  )

  const renderSchedule = () => {
    const workingHours = dentistData.workingHours || []
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

    return (
      <div className="space-y-4">
        <Card className={`p-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <FaClock className="w-5 h-5" />
            Working Hours
          </h3>
          
          {workingHours.length > 0 ? (
            <div className="space-y-3">
              {daysOfWeek.map((day, index) => {
                const daySchedule = workingHours.find(wh => wh.day === day || wh.day === index)
                
                return (
                  <div 
                    key={day}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      isDarkMode ? 'bg-gray-600' : 'bg-white'
                    }`}
                  >
                    <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {day}
                    </span>
                    {daySchedule ? (
                      <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {daySchedule.startTime} - {daySchedule.endTime}
                      </span>
                    ) : (
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Not available
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <p className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              No working hours set
            </p>
          )}
        </Card>
      </div>
    )
  }

  const renderSocialLinks = () => {
    const socialLinks = dentistData.socialLinks || {}
    const socialPlatforms = [
      { key: 'facebook', icon: FaFacebook, label: 'Facebook', color: 'text-blue-600' },
      { key: 'instagram', icon: FaInstagram, label: 'Instagram', color: 'text-pink-600' },
      { key: 'linkedin', icon: FaLinkedin, label: 'LinkedIn', color: 'text-blue-700' },
      { key: 'twitter', icon: FaTwitter, label: 'Twitter', color: 'text-blue-400' },
      { key: 'website', icon: FaGlobe, label: 'Website', color: 'text-green-600' }
    ]

    const hasSocialLinks = Object.keys(socialLinks).some(key => socialLinks[key])

    return (
      <div className="space-y-4">
        <Card className={`p-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <FaGlobe className="w-5 h-5" />
            Social Media & Website
          </h3>
          
          {hasSocialLinks ? (
            <div className="space-y-3">
              {socialPlatforms.map(platform => {
                const link = socialLinks[platform.key]
                const Icon = platform.icon
                
                if (!link) return null
                
                return (
                  <div 
                    key={platform.key}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      isDarkMode ? 'bg-gray-600' : 'bg-white'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${platform.color}`} />
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {platform.label}
                      </p>
                      <a 
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-sm hover:underline ${
                          isDarkMode ? 'text-blue-400' : 'text-blue-600'
                        }`}
                      >
                        {link}
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              No social media links provided
            </p>
          )}
        </Card>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview()
      case 'schedule':
        return renderSchedule()
      case 'social':
        return renderSocialLinks()
      default:
        return renderOverview()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className={`relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-xl shadow-2xl ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`sticky top-0 z-10 px-6 py-4 border-b ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
                isDarkMode ? 'bg-gradient-to-br from-teal-500 to-cyan-600' : 'bg-gradient-to-br from-teal-400 to-cyan-500'
              } text-white`}>
                {dentistData.firstName?.[0]}{dentistData.lastName?.[0]}
              </div>
              <div>
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Dr. {dentistData.firstName} {dentistData.lastName}
                </h2>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {dentistData.licenseNumber}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onEdit && (
                <Button
                  variant="primary"
                  onClick={() => {
                    onEdit(dentistData)
                    onClose()
                  }}
                  className="flex items-center gap-2"
                >
                  <FaEdit className="w-4 h-4" />
                  Edit
                </Button>
              )}
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? 'hover:bg-gray-700 text-gray-400'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <FaTimes className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            {tabs.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? isDarkMode
                        ? 'bg-teal-600 text-white'
                        : 'bg-teal-500 text-white'
                      : isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}

export default DentistDetailsModal
