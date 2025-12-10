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
  FaGlobe,
  FaBuilding
} from 'react-icons/fa'
import { Button, Card, StatusBadge, BaseModal } from '../../common'
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
      {/* Personal & Contact Information */}
      <div>
        <h3 className={`text-lg font-semibold mb-6 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Personal & Contact Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Email */}
          <div className={`flex items-start gap-3 p-4 rounded-lg border ${
            isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <FaEnvelope className="text-teal-500 mt-1 text-xl" />
            <div className="flex-1">
              <p className={`text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Email
              </p>
              <p className={`font-semibold break-words ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {dentistData.user?.email || dentistData.userId?.email || 'N/A'}
              </p>
            </div>
          </div>

          {/* Phone */}
          <div className={`flex items-start gap-3 p-4 rounded-lg border ${
            isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <FaPhone className="text-teal-500 mt-1 text-xl" />
            <div className="flex-1">
              <p className={`text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Phone Number
              </p>
              <p className={`font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {dentistData.user?.phone || dentistData.userId?.phone || 'N/A'}
              </p>
            </div>
          </div>

          {/* Date of Birth */}
          <div className={`flex items-start gap-3 p-4 rounded-lg border ${
            isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <FaBirthdayCake className="text-teal-500 mt-1 text-xl" />
            <div className="flex-1">
              <p className={`text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Date of Birth
              </p>
              <p className={`font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {formatDate(dentistData.birthDate)}
              </p>
              <p className={`text-sm mt-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {calculateAge(dentistData.birthDate)} years old
              </p>
            </div>
          </div>

          {/* Gender */}
          <div className={`flex items-start gap-3 p-4 rounded-lg border ${
            isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <FaVenusMars className="text-teal-500 mt-1 text-xl" />
            <div className="flex-1">
              <p className={`text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Gender
              </p>
              <p className={`font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {dentistData.gender || 'Not specified'}
              </p>
            </div>
          </div>

          {/* City */}
          <div className={`flex items-start gap-3 p-4 rounded-lg border ${
            isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <FaMapMarkerAlt className="text-teal-500 mt-1 text-xl" />
            <div className="flex-1">
              <p className={`text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                City
              </p>
              <p className={`font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {dentistData.city || 'N/A'}
              </p>
            </div>
          </div>

          {/* Status */}
          <div className={`flex items-start gap-3 p-4 rounded-lg border ${
            isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <FaCheckCircle className="text-teal-500 mt-1 text-xl" />
            <div className="flex-1">
              <p className={`text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Status
              </p>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  (dentistData.user?.status || dentistData.userId?.status) === 'ACTIVE' ? 'bg-green-500' :
                  (dentistData.user?.status || dentistData.userId?.status) === 'PENDING' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></span>
                <p className={`font-semibold ${
                  (dentistData.user?.status || dentistData.userId?.status) === 'ACTIVE' 
                    ? isDarkMode ? 'text-green-400' : 'text-green-600'
                    : (dentistData.user?.status || dentistData.userId?.status) === 'PENDING'
                    ? isDarkMode ? 'text-yellow-400' : 'text-yellow-600'
                    : isDarkMode ? 'text-red-400' : 'text-red-600'
                }`}>
                  {(dentistData.user?.status || dentistData.userId?.status) === 'ACTIVE' ? 'Active' :
                   (dentistData.user?.status || dentistData.userId?.status) === 'PENDING' ? 'Pending' : 'Inactive'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="space-y-4">
          {/* Clinic */}
          {dentistData.clinic?.clinicName && (
            <div className={`p-4 rounded-lg border ${
              isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <FaBuilding className="text-teal-500" />
                <p className={`text-sm font-medium ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Clinic
                </p>
              </div>
              <p className={`font-medium ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {dentistData.clinic.clinicName}
              </p>
            </div>
          )}

          {/* Specializations */}
          {dentistData.specialization && dentistData.specialization.length > 0 && (
            <div className={`p-4 rounded-lg border ${
              isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                <FaGraduationCap className="text-teal-500" />
                <p className={`text-sm font-medium ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Specializations
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {dentistData.specialization.map((spec, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                      isDarkMode
                        ? 'bg-teal-900/30 text-teal-400 border border-teal-700'
                        : 'bg-teal-50 text-teal-700 border border-teal-200'
                    }`}
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Appointment Duration */}
          <div className={`p-4 rounded-lg border ${
            isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <FaClock className="text-teal-500" />
              <p className={`text-sm font-medium ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Appointment Duration
              </p>
            </div>
            <p className={`font-medium ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {dentistData.appointmentDuration || 30} minutes
            </p>
          </div>

          {/* Account Dates */}
          <div className={`p-4 rounded-lg border ${
            isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className={`text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Joined Date
                </p>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {formatDate(dentistData.user?.createdAt || dentistData.userId?.createdAt)}
                </p>
              </div>
              <div>
                <p className={`text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Last Updated
                </p>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {formatDate(dentistData.user?.updatedAt || dentistData.userId?.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSchedule = () => {
    const workingHours = dentistData.workingHours || []
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

    return (
      <div>
        <h3 className={`text-lg font-semibold mb-6 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Working Schedule
        </h3>
        
        <div className={`p-4 rounded-lg border ${
          isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <FaClock className="text-teal-500" />
            <p className={`text-sm font-medium ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Working Hours
            </p>
          </div>
          
          {workingHours.length > 0 ? (
            <div className="space-y-2">
              {daysOfWeek.map((day, index) => {
                const daySchedule = workingHours.find(wh => wh.day === day || wh.day === index)
                
                return (
                  <div 
                    key={day}
                    className="flex justify-between items-center py-1"
                  >
                    <span className={`font-medium ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {day}
                    </span>
                    {daySchedule && daySchedule.startTime && daySchedule.endTime ? (
                      <span className={`${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {daySchedule.startTime} - {daySchedule.endTime}
                      </span>
                    ) : (
                      <span className={`text-sm ${
                        isDarkMode ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        Closed
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
        </div>
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
      <div>
        <h3 className={`text-lg font-semibold mb-6 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Social Media & Website
        </h3>
        
        {hasSocialLinks ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {socialPlatforms.map(platform => {
              const link = socialLinks[platform.key]
              const Icon = platform.icon
              
              if (!link) return null
              
              return (
                <div 
                  key={platform.key}
                  className={`flex items-start gap-3 p-4 rounded-lg border ${
                    isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <Icon className={`${platform.color} mt-1 text-xl`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium mb-1 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {platform.label}
                    </p>
                    <a 
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-sm hover:underline break-all ${
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
          <div className={`text-center py-12 rounded-lg ${
            isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'
          }`}>
            <FaGlobe className={`mx-auto text-4xl mb-3 ${
              isDarkMode ? 'text-gray-600' : 'text-gray-400'
            }`} />
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              No social media links provided
            </p>
          </div>
        )}
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
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      size="5xl"
      showCloseButton={false}
      noPadding={true}
    >
      {/* Header */}
      <div className={`px-8 py-6 border-b ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
              <FaUser className="text-white text-2xl" />
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Dr. {dentistData.firstName} {dentistData.lastName}
              </h2>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                License: {dentistData.licenseNumber}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 space-y-8 max-h-[calc(100vh-200px)] overflow-y-auto">
        {/* Personal & Contact Information */}
        {renderOverview()}
        
        {/* Working Schedule */}
        {renderSchedule()}
        
        {/* Social Links */}
        {renderSocialLinks()}
      </div>
    </BaseModal>
  )
}

export default DentistDetailsModal
                {(dentistData.user?.status || dentistData.userId?.status) === 'ACTIVE' ? (
                  <>
                    <FaCheckCircle className="text-green-600 dark:text-green-400 text-sm" />
                    <span className="text-green-700 dark:text-green-300 font-medium text-sm">Active</span>
                  </>
                ) : (dentistData.user?.status || dentistData.userId?.status) === 'PENDING' ? (
                  <>
                    <FaHourglassHalf className="text-yellow-600 dark:text-yellow-400 text-sm" />
                    <span className="text-yellow-700 dark:text-yellow-300 font-medium text-sm">Pending</span>
                  </>
                ) : (
                  <>
                    <FaTimesCircle className="text-red-600 dark:text-red-400 text-sm" />
                    <span className="text-red-700 dark:text-red-300 font-medium text-sm">Inactive</span>
                  </>
                )}
              </div>
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Registered on {formatDate(dentistData.user?.createdAt || dentistData.userId?.createdAt)}
              </span>
            </div>

            {/* Deactivate Button */}
            {onEdit && (
              <button
                onClick={() => {
                  onEdit(dentistData)
                  onClose()
                }}
                className="w-full px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <FaTimesCircle className="w-5 h-5" />
                Deactivate
              </button>
            )}

            {/* Personal Information */}
            <div>
              <div className={`flex items-center gap-2 mb-3 pb-2 border-b ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <FaUser className="text-teal-500" />
                <h3 className={`text-base font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Personal Information
                </h3>
              </div>
              <div className="space-y-3">
                <div className={`p-3 rounded-lg ${
                  isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50'
                }`}>
                  <p className={`text-xs font-medium ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Name
                  </p>
                  <p className={`mt-1 font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Dr. {dentistData.firstName} {dentistData.lastName}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${
                  isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50'
                }`}>
                  <p className={`text-xs font-medium ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Email
                  </p>
                  <p className={`mt-1 font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {dentistData.user?.email || dentistData.userId?.email || 'N/A'}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${
                  isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50'
                }`}>
                  <p className={`text-xs font-medium ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Phone
                  </p>
                  <p className={`mt-1 font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {dentistData.user?.phone || dentistData.userId?.phone || 'N/A'}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${
                  isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50'
                }`}>
                  <p className={`text-xs font-medium ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Gender
                  </p>
                  <p className={`mt-1 font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {dentistData.gender || 'N/A'}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${
                  isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50'
                }`}>
                  <p className={`text-xs font-medium ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Birth Date
                  </p>
                  <p className={`mt-1 font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {formatDate(dentistData.birthDate)}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${
                  isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50'
                }`}>
                  <p className={`text-xs font-medium ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    City
                  </p>
                  <p className={`mt-1 font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {dentistData.city || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div>
              <div className={`flex items-center gap-2 mb-3 pb-2 border-b ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <FaCertificate className="text-teal-500" />
                <h3 className={`text-base font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Professional Information
                </h3>
              </div>
              <div className="space-y-3">
                <div className={`p-3 rounded-lg ${
                  isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50'
                }`}>
                  <p className={`text-xs font-medium ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    License Number
                  </p>
                  <p className={`mt-1 font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {dentistData.licenseNumber}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${
                  isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50'
                }`}>
                  <p className={`text-xs font-medium ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Specialization
                  </p>
                  <p className={`mt-1 font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {dentistData.specialization && dentistData.specialization.length > 0
                      ? dentistData.specialization.join(', ')
                      : 'General Dentistry'}
                  </p>
                </div>
              </div>
            </div>

            {/* Clinic Information */}
            {dentistData.clinic && (
              <div>
                <div className={`flex items-center gap-2 mb-3 pb-2 border-b ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <FaBuilding className="text-teal-500" />
                  <h3 className={`text-base font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Clinic Information
                  </h3>
                </div>
                <div className={`p-3 rounded-lg ${
                  isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50'
                }`}>
                  <p className={`text-xs font-medium ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Clinic Name
                  </p>
                  <p className={`mt-1 font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {dentistData.clinic.clinicName || 'N/A'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
    </BaseModal>
  )
}

export default DentistDetailsModal

