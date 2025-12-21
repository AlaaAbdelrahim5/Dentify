import { FaUserShield, FaTimes, FaEnvelope, FaPhone, FaCheck, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'
import { StatusBadge } from '../../common'
import { useTheme } from '../../../contexts/ThemeContext'
import { formatDate as formatDateHelper, getImageUrl } from '../../../utils/helpers'

export const AdminDetailsModal = ({ admin, onClose }) => {
  const { isDarkMode } = useTheme()

  if (!admin) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`relative rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col ${
            isDarkMode
              ? "bg-gray-800 border border-gray-700"
              : "bg-white border border-gray-200"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with gradient background */}
          <div className="relative bg-linear-to-r from-teal-600 to-cyan-600 p-6">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-lg transition-colors bg-white/10 hover:bg-white/20 text-white"
            >
              <FaTimes className="w-5 h-5" />
            </button>
            
            {/* Avatar and basic info */}
            <div className="flex items-center gap-4 mt-8">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-lg">
                  {admin.userId?.profileImage ? (
                    <img 
                      src={getImageUrl(admin.userId.profileImage)}
                      alt={admin.fullName}
                      className="w-24 h-24 rounded-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'block';
                      }}
                    />
                  ) : null}
                  {admin.userId?.profileImage ? (
                    <FaUserShield className="w-12 h-12 text-teal-600 hidden" />
                  ) : (
                    <FaUserShield className="w-12 h-12 text-teal-600" />
                  )}
                </div>
                {/* Status indicator on avatar */}
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
                <StatusBadge 
                  isActive={admin.userId?.status === 'active'}
                  activeIcon={FaCheckCircle}
                  inactiveIcon={FaTimesCircle}
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  <FaUserShield className="w-5 h-5 text-teal-600" />
                  Personal Information
                </h3>
                <div className={`grid grid-cols-2 gap-4 p-4 rounded-lg ${
                  isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                }`}>
                  <div>
                    <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      First Name
                    </p>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {admin.firstName}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Last Name
                    </p>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {admin.lastName}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Gender
                    </p>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {admin.gender.charAt(0).toUpperCase() + admin.gender.slice(1)}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Created Date
                    </p>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatDateHelper(admin.createdAt)}
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
                        {admin.userId?.email}
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
                        {admin.userId?.phone}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
