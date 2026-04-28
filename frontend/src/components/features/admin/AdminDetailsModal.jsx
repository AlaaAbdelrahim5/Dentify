import { FaUserShield, FaEnvelope, FaPhone, FaCheckCircle } from 'react-icons/fa'
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
      title="Admin Details"
      size="2xl"
    >
      <div className="space-y-6">
        {/* Profile Section */}
        <div className="flex items-center gap-4 pb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            {admin.userId?.profileImage ? (
              <img 
                src={getImageUrl(admin.userId.profileImage)}
                alt={admin.fullName}
                className="w-20 h-20 rounded-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className={`w-20 h-20 rounded-full ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
            } flex items-center justify-center ${admin.userId?.profileImage ? 'hidden' : ''}`}>
              <FaUserShield className="w-10 h-10 text-teal-500" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className={`text-xl font-bold mb-1 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {admin.fullName}
            </h3>
            <p className={`text-sm mb-2 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Administrator
            </p>
            <StatusBadge status={admin.userId?.status} />
          </div>
        </div>

        {/* Personal Information */}
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
              {admin.firstName}
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
              {admin.lastName}
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
              {admin.gender.charAt(0).toUpperCase() + admin.gender.slice(1)}
            </p>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Created Date
            </label>
            <p className={`text-base ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {formatDateHelper(admin.createdAt)}
            </p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Email Address
            </label>
            <p className={`text-base break-words ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {admin.userId?.email}
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
              {admin.userId?.phone}
            </p>
          </div>
        </div>
      </div>
    </BaseModal>
  )
}
