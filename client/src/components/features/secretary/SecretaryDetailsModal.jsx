import { 
  FaTimes,
  FaUserTie,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaVenusMars,
  FaCheck
} from 'react-icons/fa'
import { BaseModal } from '../../common'
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
    <BaseModal isOpen={isOpen} onClose={onClose} title="Secretary Details" size="2xl">
      <div className="space-y-6">
        {/* Profile Section */}
        <div className="flex items-center gap-4 pb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            {secretary.userId?.profileImage ? (
              <img
                src={getImageUrl(secretary.userId.profileImage)}
                alt={`${secretary.firstName} ${secretary.lastName}`}
                className="w-20 h-20 rounded-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className={`w-20 h-20 rounded-full ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
            } flex items-center justify-center ${secretary.userId?.profileImage ? 'hidden' : ''}`}>
              <FaUserTie className="w-10 h-10 text-teal-500" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className={`text-xl font-bold mb-1 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {secretary.firstName} {secretary.lastName}
            </h3>
            <p className={`text-sm mb-2 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Secretary • Age: {calculateAge(secretary.birthDate)}
            </p>
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              secretary.userId?.status?.toLowerCase() === 'active'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              {secretary.userId?.status?.toLowerCase() === 'active' ? (
                <><FaCheckCircle className="w-3 h-3" /> Active</>
              ) : (
                <><FaTimesCircle className="w-3 h-3" /> Inactive</>
              )}
            </span>
          </div>
        </div>
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              First Name
            </label>
            <p className={`text-base ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {secretary.firstName}
            </p>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Last Name
            </label>
            <p className={`text-base ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {secretary.lastName}
            </p>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Gender
            </label>
            <p className={`text-base ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {secretary.gender?.charAt(0).toUpperCase() + secretary.gender?.slice(1)}
            </p>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Birth Date
            </label>
            <p className={`text-base ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {formatDate(secretary.birthDate)}
            </p>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Email Address
            </label>
            <p className={`text-base break-words ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {secretary.userId?.email}
            </p>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Phone Number
            </label>
            <p className={`text-base ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {secretary.userId?.phone}
            </p>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              City
            </label>
            <p className={`text-base ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {getCityLabel(secretary.address?.city)}
            </p>
          </div>
        </div>

        {/* Employment Information */}
        {secretary.clinic && (
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Employment Information
            </label>
            <div className={`p-4 rounded-lg border ${
              isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex justify-between items-center">
              <span className={`text-sm font-medium ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Join Date
              </span>
              <span className={`font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {formatDate(secretary.createdAt)}
              </span>
            </div>
            </div>
          </div>
        )}
      </div>
    </BaseModal>
  )
}

export default SecretaryDetailsModal
