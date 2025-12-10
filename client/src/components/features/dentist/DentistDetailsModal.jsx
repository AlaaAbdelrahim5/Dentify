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
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      showCloseButton={false}
      noPadding={true}
    >
      {/* Header with Teal Gradient */}
      <div className="bg-gradient-to-br from-teal-500 to-cyan-500 px-8 py-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-2"
        >
          <FaTimes className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
            <FaUser className="text-white text-2xl" />
          </div>
          <div className="text-white">
            <h2 className="text-2xl font-bold">
              Dr. {dentistData.firstName} {dentistData.lastName}
            </h2>
            <p className="text-white/90 text-sm mt-1">
              License: {dentistData.licenseNumber}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`p-8 max-h-[calc(90vh-140px)] overflow-y-auto ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
          <div className="space-y-6">
            {/* Status Badge */}
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
                dentistData.userId?.status === 'ACTIVE' 
                  ? 'bg-green-100 dark:bg-green-900/30' 
                  : dentistData.userId?.status === 'PENDING'
                  ? 'bg-yellow-100 dark:bg-yellow-900/30'
                  : 'bg-red-100 dark:bg-red-900/30'
              }`}>
                {dentistData.userId?.status === 'ACTIVE' ? (
                  <>
                    <FaCheckCircle className="text-green-600 dark:text-green-400 text-sm" />
                    <span className="text-green-700 dark:text-green-300 font-medium text-sm">Active</span>
                  </>
                ) : dentistData.userId?.status === 'PENDING' ? (
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
                Registered on {formatDate(dentistData.userId?.createdAt)}
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
                    {dentistData.userId?.email || 'N/A'}
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
                    {dentistData.userId?.phone || 'N/A'}
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
