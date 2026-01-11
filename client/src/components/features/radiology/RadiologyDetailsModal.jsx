import { 
  FaTimes,
  FaXRay,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaCheck,
  FaClock,
  FaGlobe
} from 'react-icons/fa'
import { BaseModal, LocationMap } from '../../common'
import { useTheme } from '../../../contexts/ThemeContext'

const RadiologyDetailsModal = ({ isOpen, center, onClose }) => {
  const { isDarkMode } = useTheme()

  if (!center) return null

  const cityLabel = center.city

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Radiology Center Details" size="2xl">
      <div className="space-y-6">
        {/* Fixed Profile Section */}
        <div className="flex items-center gap-4 pb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <div className={`w-20 h-20 rounded-full ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
            } flex items-center justify-center`}>
              <FaXRay className="w-10 h-10 text-teal-500" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className={`text-xl font-bold mb-1 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {center.centerName || center.registrationNumber}
            </h3>
            <p className={`text-sm mb-2 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Radiology Center
            </p>
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              center.user?.status === 'ACTIVE'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              {center.user?.status === 'ACTIVE' ? <FaCheckCircle className="w-3 h-3" /> : <FaTimesCircle className="w-3 h-3" />}
              {center.user?.status === 'ACTIVE' ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
        
        {/* Scrollable Content */}
        <div className="overflow-y-auto overflow-x-hidden max-h-[calc(90vh-280px)] pr-2 space-y-6">
          {/* Basic Information */}
          <div>
          <h3 className={`text-lg font-semibold mb-6 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Basic Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className={`flex items-start gap-3 p-4 rounded-lg border ${
              isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
            }`}>
              <FaXRay className="text-teal-500 mt-1 text-xl" />
              <div className="flex-1">
                <p className={`text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Center Name
                </p>
                <p className={`font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {center.centerName || center.registrationNumber}
                </p>
              </div>
            </div>

            <div className={`flex items-start gap-3 p-4 rounded-lg border ${
              isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
            }`}>
              <FaXRay className="text-teal-500 mt-1 text-xl" />
              <div className="flex-1">
                <p className={`text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Registration Number
                </p>
                <p className={`font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {center.registrationNumber || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            {center.website && (
              <div className={`p-4 rounded-lg border ${
                isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <FaGlobe className="text-teal-500" />
                  <p className={`text-sm font-medium ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Website
                  </p>
                </div>
                <a 
                  href={center.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`font-medium hover:underline wrap-break-word ${
                    isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                  }`}
                >
                  {center.website}
                </a>
              </div>
            )}

            {center.description && (
              <div className={`p-4 rounded-lg border ${
                isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}>
                <p className={`text-sm font-medium mb-3 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Description
                </p>
                <p className={`leading-relaxed ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {center.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Location */}
        <div>
          <h3 className={`text-lg font-semibold mb-6 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Location
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  {cityLabel}
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
                  Street Address
                </p>
                <p className={`font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {center.location || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Location Map */}
        {center.coordinates && (
          <div>
            <h3 className={`text-lg font-semibold mb-6 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Location Map
            </h3>
            <div className={`p-4 rounded-lg border ${
              isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
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
                  {center.user?.email || 'N/A'}
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
                  {center.user?.phone || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Services & Equipment */}
        {center.supportedTypes && center.supportedTypes.length > 0 && (
          <div>
            <h3 className={`text-lg font-semibold mb-6 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Supported Types
            </h3>
            <div className={`p-4 rounded-lg border ${
              isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex flex-wrap gap-2">
                {center.supportedTypes.map((service, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                      isDarkMode
                        ? 'bg-teal-900/30 text-teal-400 border border-teal-700'
                        : 'bg-teal-50 text-teal-700 border border-teal-200'
                    }`}
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Working Hours */}
        {center.workingHours && (
          <div>
            <h3 className={`text-lg font-semibold mb-6 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Working Hours
            </h3>
            <div className={`p-4 rounded-lg border ${
              isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                <FaClock className="text-teal-500" />
                <p className={`text-sm font-medium ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Working Schedule
                </p>
              </div>
              <div className="space-y-2">
                {(() => {
                  const hours = center.workingHours;
                  if (Array.isArray(hours) && hours.length > 0) {
                    return hours.map((schedule, index) => (
                      <div key={index} className="flex justify-between items-center py-1">
                        <span className={`font-medium ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {schedule.day}
                        </span>
                        <span className={`${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {schedule.startTime} - {schedule.endTime}
                        </span>
                      </div>
                    ));
                  } else if (typeof hours === 'object' && Object.keys(hours).length > 0) {
                    return Object.entries(hours).map(([day, schedule]) => (
                      <div key={day} className="flex justify-between items-center py-1">
                        <span className={`font-medium capitalize ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {day}
                        </span>
                        <span className={`${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
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
      </div>
    </BaseModal>
  )
}

export default RadiologyDetailsModal
