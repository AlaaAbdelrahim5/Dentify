import { FaUserShield, FaEnvelope, FaPhone, FaCheck, FaTimes, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'
import { StatusBadge, BaseModal } from '../../common'
import { useTheme } from '../../../contexts/ThemeContext'
import { formatDate as formatDateHelper, getImageUrl } from '../../../utils/helpers'

export const AdminDetailsModal = ({ admin, onClose }) => {
  const { isDarkMode } = useTheme()

  if (!admin) return null

  return (
    <BaseModal
      isOpen={!!admin}
      onClose={onClose}
      size="5xl"
      showCloseButton={false}
      noPadding={true}
    >
      {/* Header with gradient */}
      <div className="relative bg-gradient-to-r from-teal-600 to-cyan-600 p-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg transition-colors bg-white/10 hover:bg-white/20 text-white"
        >
          <FaTimes className="w-5 h-5" />
        </button>

        {/* Profile section */}
        <div className="flex items-center gap-4">
          <div className="relative">
            {admin.userId?.profileImage ? (
              <img 
                src={getImageUrl(admin.userId.profileImage)}
                alt={admin.fullName}
                className="w-24 h-24 rounded-full object-cover shadow-lg"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className={`w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-lg ${admin.userId?.profileImage ? 'hidden' : ''}`}>
              <FaUserShield className="w-12 h-12 text-teal-600" />
            </div>
            <div className={`absolute bottom-1 right-1 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center ${
              admin.userId?.status === 'active' ? 'bg-green-500' : 'bg-red-500'
            }`}>
              {admin.userId?.status === 'active' ? (
                <FaCheck className="w-3 h-3 text-white" />
              ) : (
                <FaTimes className="w-3 h-3 text-white" />
              )}
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-1">
              {admin.fullName}
            </h2>
            <p className="text-teal-100 text-sm mb-2">
              Administrator
            </p>
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${
              admin.userId?.status === 'active'
                ? 'bg-green-900/20 text-green-300 border-green-700'
                : 'bg-red-900/20 text-red-300 border-red-700'
            }`}>
              {admin.userId?.status === 'active' ? (
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
        {/* Personal Information */}
        <div>
          <h3 className={`text-lg font-semibold mb-6 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Personal Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`flex items-start gap-3 p-4 rounded-lg border ${
              isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
            }`}>
              <FaUserShield className="text-teal-500 mt-1 text-xl" />
              <div className="flex-1">
                <p className={`text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  First Name
                </p>
                <p className={`font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {admin.firstName}
                </p>
              </div>
            </div>

            <div className={`flex items-start gap-3 p-4 rounded-lg border ${
              isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
            }`}>
              <FaUserShield className="text-teal-500 mt-1 text-xl" />
              <div className="flex-1">
                <p className={`text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Last Name
                </p>
                <p className={`font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {admin.lastName}
                </p>
              </div>
            </div>

            <div className={`flex items-start gap-3 p-4 rounded-lg border ${
              isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
            }`}>
              <FaUserShield className="text-teal-500 mt-1 text-xl" />
              <div className="flex-1">
                <p className={`text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Gender
                </p>
                <p className={`font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {admin.gender.charAt(0).toUpperCase() + admin.gender.slice(1)}
                </p>
              </div>
            </div>

            <div className={`flex items-start gap-3 p-4 rounded-lg border ${
              isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
            }`}>
              <FaCheckCircle className="text-teal-500 mt-1 text-xl" />
              <div className="flex-1">
                <p className={`text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Created Date
                </p>
                <p className={`font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {formatDateHelper(admin.createdAt)}
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
                  {admin.userId?.email}
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
                  {admin.userId?.phone}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  )
}
