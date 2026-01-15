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
  FaBuilding,
  FaCheck
} from 'react-icons/fa'
import { Button, Card, StatusBadge, BaseModal } from '../../common'
import { useTheme } from '../../../contexts/ThemeContext'
import { calculateAge, formatDate, getImageUrl } from '../../../utils/helpers'

const DentistDetailsModal = ({ isOpen, onClose, dentistData, onEdit }) => {
  const { isDarkMode } = useTheme()
  const [activeTab, setActiveTab] = useState('overview')

  if (!isOpen || !dentistData) return null

  const formatDateLong = (dateString) => {
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
              <p className={`font-semibold wrap-break-word ${
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
              <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border ${
                (dentistData.user?.status || dentistData.userId?.status) === 'ACTIVE'
                  ? isDarkMode
                    ? 'bg-green-900/20 text-green-400 border-green-800'
                    : 'bg-green-100 text-green-800 border-green-200'
                  : (dentistData.user?.status || dentistData.userId?.status) === 'PENDING'
                    ? isDarkMode
                      ? 'bg-yellow-900/20 text-yellow-400 border-yellow-800'
                      : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                    : isDarkMode
                      ? 'bg-red-900/20 text-red-400 border-red-800'
                      : 'bg-red-100 text-red-800 border-red-200'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  (dentistData.user?.status || dentistData.userId?.status) === 'ACTIVE' ? 'bg-green-500' :
                  (dentistData.user?.status || dentistData.userId?.status) === 'PENDING' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></span>
                {(dentistData.user?.status || dentistData.userId?.status) === 'ACTIVE' ? 'Active' :
                 (dentistData.user?.status || dentistData.userId?.status) === 'PENDING' ? 'Pending' : 'Inactive'}
              </span>
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
    // Parse workingHours - handle JSON string or array
    let workingHours = []
    try {
      if (typeof dentistData.workingHours === 'string') {
        workingHours = JSON.parse(dentistData.workingHours)
      } else if (Array.isArray(dentistData.workingHours)) {
        workingHours = dentistData.workingHours
      }
    } catch (error) {
      console.error('Error parsing working hours:', error)
    }

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
          
          {workingHours && workingHours.length > 0 ? (
            <div className="space-y-2">
              {daysOfWeek.map((day, index) => {
                // Try multiple matching strategies
                const daySchedule = workingHours.find(wh => 
                  wh.day === day || 
                  wh.day === index || 
                  wh.day === day.toLowerCase() ||
                  wh.day === index.toString()
                )
                
                return (
                  <div 
                    key={day}
                    className={`flex justify-between items-center py-2 px-3 rounded ${
                      daySchedule && daySchedule.start && daySchedule.end 
                        ? isDarkMode ? 'bg-gray-700/30' : 'bg-white'
                        : ''
                    }`}
                  >
                    <span className={`font-medium ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {day}
                    </span>
                    {daySchedule && (daySchedule.start || daySchedule.startTime) && (daySchedule.end || daySchedule.endTime) ? (
                      <span className={`font-medium ${
                        isDarkMode ? 'text-teal-400' : 'text-teal-600'
                      }`}>
                        {daySchedule.start || daySchedule.startTime} - {daySchedule.end || daySchedule.endTime}
                      </span>
                    ) : (
                      <span className={`text-sm font-medium ${
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

  const statusInfo = getStatusInfo(dentistData.user?.status || dentistData.userId?.status)
  const StatusIcon = statusInfo.icon

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Dentist Details"
      size="2xl"
    >
      {/* Fixed Profile Section */}
      <div className="flex items-center gap-4 pb-6 border-b border-gray-200 dark:border-gray-700 mb-6">
        <div className="relative">
          {dentistData.user?.profileImage || dentistData.userId?.profileImage || dentistData.profileImage ? (
            <img
              src={getImageUrl(dentistData.user?.profileImage || dentistData.userId?.profileImage || dentistData.profileImage)}
              alt={`Dr. ${dentistData.firstName} ${dentistData.lastName}`}
              className="w-20 h-20 rounded-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div className={`w-20 h-20 rounded-full ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
          } flex items-center justify-center ${dentistData.user?.profileImage || dentistData.userId?.profileImage || dentistData.profileImage ? 'hidden' : ''}`}>
            <FaUser className="w-10 h-10 text-teal-500" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className={`text-xl font-bold mb-1 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Dr. {dentistData.firstName} {dentistData.lastName}
          </h3>
          <p className={`text-sm mb-2 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Dentist
          </p>
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${
            dentistData.user?.status === 'ACTIVE' || dentistData.userId?.status === 'ACTIVE'
              ? isDarkMode
                ? 'bg-green-900/20 text-green-400 border-green-800'
                : 'bg-green-100 text-green-800 border-green-200'
              : dentistData.user?.status === 'PENDING' || dentistData.userId?.status === 'PENDING'
              ? isDarkMode
                ? 'bg-yellow-900/20 text-yellow-400 border-yellow-800'
                : 'bg-yellow-100 text-yellow-700 border-yellow-200'
              : isDarkMode
                ? 'bg-red-900/20 text-red-400 border-red-800'
                : 'bg-red-100 text-red-800 border-red-200'
          }`}>
            <StatusIcon className="w-3 h-3" />
            {statusInfo.label}
          </span>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="space-y-6 overflow-y-auto overflow-x-hidden max-h-[calc(90vh-280px)] pr-2">
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
