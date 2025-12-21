import { 
  FaTimes,
  FaXRay,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaCheck,
  FaCog,
  FaClock
} from 'react-icons/fa'
import { BaseModal, LocationMap } from '../../common'
import { useTheme } from '../../../contexts/ThemeContext'

const RadiologyDetailsModal = ({ isOpen, center, onClose }) => {
  const { isDarkMode } = useTheme()

  if (!center) return null

  const cityLabel = center.city

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} size="2xl" noPadding>
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
              <FaXRay className="w-12 h-12 text-teal-600" />
            </div>
            {/* Status indicator on avatar */}
            <div className={`absolute bottom-1 right-1 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center ${
              center.user?.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'
            }`}>
              {center.user?.status === 'ACTIVE' ? (
                <FaCheck className="w-3 h-3 text-white" />
              ) : (
                <FaTimes className="w-3 h-3 text-white" />
              )}
            </div>
          </div>
          
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-1">
              {center.centerName || center.registrationNumber}
            </h2>
            <p className="text-teal-100 text-sm mb-2">
              Radiology Center
            </p>
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${
              center.user?.status === 'ACTIVE'
                ? 'bg-green-900/20 text-green-300 border-green-700'
                : 'bg-red-900/20 text-red-300 border-red-700'
            }`}>
              {center.user?.status === 'ACTIVE' ? <FaCheckCircle className="w-3 h-3" /> : <FaTimesCircle className="w-3 h-3" />}
              {center.user?.status === 'ACTIVE' ? 'Active' : 'Inactive'}
            </span>
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
            <FaXRay className="w-5 h-5 text-teal-600" />
            Basic Information
          </h3>
          <div className={`grid grid-cols-2 gap-4 p-4 rounded-lg ${
            isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
          }`}>
            <div>
              <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Center Name
              </p>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {center.centerName || center.registrationNumber}
              </p>
            </div>
            <div>
              <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Registration Number
              </p>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {center.registrationNumber || 'N/A'}
              </p>
            </div>
            {center.website && (
              <div className="col-span-2">
                <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Website
                </p>
                <a href={center.website} target="_blank" rel="noopener noreferrer" 
                   className="text-sm font-medium text-teal-600 hover:underline">
                  {center.website}
                </a>
              </div>
            )}
            {center.description && (
              <div className="col-span-2">
                <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Description
                </p>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {center.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Location */}
        <div>
          <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <FaMapMarkerAlt className="w-5 h-5 text-teal-600" />
            Location
          </h3>
          <div className={`space-y-3 p-4 rounded-lg ${
            isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
          }`}>
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
                  {cityLabel}
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
                  Street Address
                </p>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {center.location || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Location Map */}
        {center.coordinates && (
          <div>
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              <FaMapMarkerAlt className="w-5 h-5 text-teal-600" />
              Location Map
            </h3>
            <div className={`p-4 rounded-lg ${
              isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
            }`}>
              <LocationMap
                coordinates={center.coordinates}
                title={center.centerName}
                address={center.location || center.city}
                height={300}
                isDarkMode={isDarkMode}
              />
              <p className={`text-xs mt-2 ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`}>
                Coordinates: {center.coordinates}
              </p>
            </div>
          </div>
        )}

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
                  {center.user?.email || 'N/A'}
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
                  {center.user?.phone || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Services & Equipment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Services / Supported Types */}
          {center.supportedTypes && center.supportedTypes.length > 0 && (
            <div>
              <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <FaCog className="w-5 h-5 text-teal-600" />
                Supported Types
              </h3>
              <div className="flex flex-wrap gap-2">
                {center.supportedTypes.map((service, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isDarkMode ? 'bg-teal-900/20 text-teal-400 border border-teal-800' : 'bg-teal-100 text-teal-700 border border-teal-200'
                    }`}
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Working Hours */}
        {center.workingHours && (
          <div>
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              <FaClock className="w-5 h-5 text-teal-600" />
              Working Hours
            </h3>
            <div className={`p-4 rounded-lg ${
              isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
            }`}>
              <div className="space-y-2">
                {(() => {
                  const hours = center.workingHours;
                  if (Array.isArray(hours) && hours.length > 0) {
                    return hours.map((schedule, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className={`font-medium ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {schedule.day}
                        </span>
                        <span className={`${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {schedule.startTime} - {schedule.endTime}
                        </span>
                      </div>
                    ));
                  } else if (typeof hours === 'object' && Object.keys(hours).length > 0) {
                    return Object.entries(hours).map(([day, schedule]) => (
                      <div key={day} className="flex justify-between items-center">
                        <span className={`font-medium capitalize ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {day}
                        </span>
                        <span className={`${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {schedule.isOpen ? `${schedule.start} - ${schedule.end}` : 'Closed'}
                        </span>
                      </div>
                    ));
                  }
                  return <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>No hours set</p>;
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </BaseModal>
  )
}

export default RadiologyDetailsModal
