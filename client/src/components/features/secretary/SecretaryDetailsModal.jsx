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
    <BaseModal isOpen={isOpen} onClose={onClose} size="5xl" showCloseButton={false} noPadding={true}>
      {/* Header with gradient */}
      <div className="relative bg-gradient-to-r from-teal-600 to-cyan-600 p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg transition-colors bg-white/10 hover:bg-white/20 text-white"
        >
          <FaTimes className="w-5 h-5" />
        </button>
        
        {/* Profile section */}
        <div className="flex items-center gap-4">
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
            <div className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg ${secretary.userId?.profileImage ? 'hidden' : ''} bg-white`}>
              <FaUserTie className="w-12 h-12 text-teal-600" />
            </div>
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
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${
              secretary.userId?.status?.toLowerCase() === 'active'
                ? 'bg-green-900/20 text-green-300 border-green-700'
                : 'bg-red-900/20 text-red-300 border-red-700'
            }`}>
              {secretary.userId?.status?.toLowerCase() === 'active' ? (
                <><FaCheckCircle className="w-3 h-3" /> Active</>
              ) : (
                <><FaTimesCircle className="w-3 h-3" /> Inactive</>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 space-y-8 max-h-[calc(100vh-200px)] overflow-y-auto">
        {/* Basic Information */}
        <div>
          <h3 className={`text-lg font-semibold mb-6 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Basic Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`flex items-start gap-3 p-4 rounded-lg border ${
              isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
            }`}>
              <FaUserTie className="text-teal-500 mt-1 text-xl" />
              <div className="flex-1">
                <p className={`text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  First Name
                </p>
                <p className={`font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {secretary.firstName}
                </p>
              </div>
            </div>

            <div className={`flex items-start gap-3 p-4 rounded-lg border ${
              isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
            }`}>
              <FaUserTie className="text-teal-500 mt-1 text-xl" />
              <div className="flex-1">
                <p className={`text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Last Name
                </p>
                <p className={`font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {secretary.lastName}
                </p>
              </div>
            </div>

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
                  {secretary.gender?.charAt(0).toUpperCase() + secretary.gender?.slice(1)}
                </p>
              </div>
            </div>

            <div className={`flex items-start gap-3 p-4 rounded-lg border ${
              isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
            }`}>
              <FaCalendarAlt className="text-teal-500 mt-1 text-xl" />
              <div className="flex-1">
                <p className={`text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Birth Date
                </p>
                <p className={`font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {formatDate(secretary.birthDate)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h3 className={`text-lg font-semibold mb-6 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Contact Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`flex items-start gap-3 p-4 rounded-lg border ${
              isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
            }`}>
              <FaEnvelope className="text-teal-500 mt-1 text-xl" />
              <div className="flex-1">
                <p className={`text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Email Address
                </p>
                <p className={`font-semibold wrap-break-word ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {secretary.userId?.email}
                </p>
              </div>
            </div>

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
                  {secretary.userId?.phone}
                </p>
              </div>
            </div>

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
                  {getCityLabel(secretary.address?.city)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Employment Information */}
        <div>
          <h3 className={`text-lg font-semibold mb-6 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Employment Information
          </h3>
          
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
      </div>
    </BaseModal>
  )
}

export default SecretaryDetailsModal
