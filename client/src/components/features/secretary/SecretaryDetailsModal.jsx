import { 
  FaTimes,
  FaUserTie,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaVenus,
  FaMars,
  FaCheck
} from 'react-icons/fa'
import { StatusBadge, BaseModal } from '../../common'
import { useTheme } from '../../../contexts/ThemeContext'
import { calculateAge, formatDate, getImageUrl } from '../../../utils/helpers'
import { CITY_OPTIONS_LOWERCASE } from '../../../utils/constants'

const SecretaryDetailsModal = ({ isOpen, secretary, onClose }) => {
  const { isDarkMode } = useTheme()

  if (!secretary) return null

  // Helper function to get city label
  const getCityLabel = (cityValue) => {
    if (!cityValue) return 'N/A'
    const city = CITY_OPTIONS_LOWERCASE.find(c => c.value === cityValue?.toLowerCase())
    return city ? city.label : cityValue
  }

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} size="2xl" noPadding>
      {/* Header with gradient background */}
      <div className="relative bg-gradient-to-r from-teal-600 to-cyan-600 p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg transition-colors bg-white/10 hover:bg-white/20 text-white"
        >
          <FaTimes className="w-5 h-5" />
        </button>
        
        {/* Avatar and basic info */}
        <div className="flex items-center gap-4 mt-8">
          <div className="relative">
            {secretary.userId?.profileImage ? (
              <img
                src={getImageUrl(secretary.userId.profileImage)}
                alt={`${secretary.firstName} ${secretary.lastName}`}
                className="w-24 h-24 rounded-full object-cover shadow-lg"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg ${secretary.userId?.profileImage ? 'hidden' : ''} ${
              secretary.gender?.toLowerCase() === 'female' ? 'bg-pink-100' : 'bg-blue-100'
            }`}>
              {secretary.gender?.toLowerCase() === 'female' ? (
                <FaVenus className="w-12 h-12 text-pink-600" />
              ) : (
                <FaMars className="w-12 h-12 text-blue-600" />
              )}
            </div>
            {/* Status indicator on avatar */}
            <div className={`absolute bottom-1 right-1 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center ${
              secretary.userId?.status?.toLowerCase() === 'active' ? 'bg-green-500' : 'bg-red-500'
            }`}>
              {secretary.userId?.status?.toLowerCase() === 'active' ? (
                <FaCheck className="w-3 h-3 text-white" />
              ) : (
                <FaTimes className="w-3 h-3 text-white" />
              )}
            </div>
          </div>
          
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-1">
              {secretary.firstName} {secretary.lastName}
            </h2>
            <p className="text-teal-100 text-sm mb-2">
              Secretary • Age: {calculateAge(secretary.birthDate)}
            </p>
            <StatusBadge 
              isActive={secretary.userId?.status?.toLowerCase() === 'active'}
              activeIcon={FaCheckCircle}
              inactiveIcon={FaTimesCircle}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <FaUserTie className="w-5 h-5 text-teal-600" />
            Basic Information
          </h3>
          <div className={`grid grid-cols-2 gap-4 p-4 rounded-lg ${
            isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
          }`}>
            <div>
              <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                First Name
              </p>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {secretary.firstName}
              </p>
            </div>
            <div>
              <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Last Name
              </p>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {secretary.lastName}
              </p>
            </div>
            <div>
              <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Gender
              </p>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {secretary.gender?.charAt(0).toUpperCase() + secretary.gender?.slice(1)}
              </p>
            </div>
            <div>
              <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Birth Date
              </p>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {formatDate(secretary.birthDate)}
              </p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <FaEnvelope className="w-5 h-5 text-teal-600" />
            Contact Information
          </h3>
          <div className={`space-y-3 p-4 rounded-lg ${
            isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isDarkMode ? 'bg-gray-600' : 'bg-white'
              }`}>
                <FaEnvelope className="w-4 h-4 text-teal-600" />
              </div>
              <div className="flex-1">
                <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Email Address
                </p>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {secretary.userId?.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isDarkMode ? 'bg-gray-600' : 'bg-white'
              }`}>
                <FaPhone className="w-4 h-4 text-teal-600" />
              </div>
              <div className="flex-1">
                <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Phone Number
                </p>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {secretary.userId?.phone}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isDarkMode ? 'bg-gray-600' : 'bg-white'
              }`}>
                <FaMapMarkerAlt className="w-4 h-4 text-teal-600" />
              </div>
              <div className="flex-1">
                <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  City
                </p>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {getCityLabel(secretary.address?.city)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Employment Information */}
        <div>
          <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <FaCalendarAlt className="w-5 h-5 text-teal-600" />
            Employment Information
          </h3>
          <div className={`p-4 rounded-lg ${
            isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
          }`}>
            <div className="flex justify-between">
              <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Join Date:
              </span>
              <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {formatDate(secretary.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  )
}

export default SecretaryDetailsModal
