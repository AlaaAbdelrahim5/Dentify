import { 
  FaBuilding,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaIdCard,
  FaCalendarPlus,
  FaEye
} from 'react-icons/fa'
import { Card, Button } from '../../common'
import { useTheme } from '../../../contexts/ThemeContext'
import { formatDistance } from '../../../utils/geoUtils'

const ClinicCard = ({ 
  clinic, 
  onViewDetails,
  onBookAppointment,
  layout = 'grid', // 'grid' or 'list'
  showActions = true
}) => {
  const { isDarkMode } = useTheme()

  // Extract clinic information
  const clinicName = clinic.clinicName || 'Unnamed Clinic'
  const city = clinic.city || 'N/A'
  const address = clinic.address || 'N/A'
  const email = clinic.user?.email || clinic.email || 'N/A'
  const phone = clinic.user?.phone || clinic.phone || 'N/A'
  const registrationNumber = clinic.registrationNumber || 'N/A'
  const hasDistance = clinic.distance !== undefined && clinic.distance !== Infinity

  if (layout === 'list') {
    return (
      <Card className={`transition-all duration-300 ${
        isDarkMode ? 'hover:bg-gray-750' : 'hover:shadow-xl'
      }`}>
        <Card.Content className="p-6">
          <div className="flex items-start space-x-6">
            {/* Clinic Icon */}
            <div className="shrink-0">
              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg">
                <FaBuilding className="text-white text-2xl" />
              </div>
            </div>

            {/* Clinic Info */}
            <div className="grow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className={`text-xl font-bold mb-1 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {clinicName}
                  </h3>
                  <div className="flex items-center space-x-2 mb-2">
                    <FaIdCard className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <span className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {registrationNumber}
                    </span>
                  </div>
                </div>

                {hasDistance && (
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    isDarkMode ? 'bg-teal-500/20 text-teal-300' : 'bg-teal-50 text-teal-700'
                  }`}>
                    📍 {formatDistance(clinic.distance)}
                  </span>
                )}
              </div>

              {/* Location */}
              <div className="flex items-start space-x-2 mb-3">
                <FaMapMarkerAlt className={`mt-1 ${
                  isDarkMode ? 'text-teal-400' : 'text-teal-600'
                }`} />
                <div>
                  <p className={`font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {city}
                  </p>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {address}
                  </p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div className="flex items-center space-x-2">
                  <FaEnvelope className={`${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <span className={`text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {email}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaPhone className={`${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <span className={`text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {phone}
                  </span>
                </div>
              </div>

              {/* Actions */}
              {showActions && (
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetails?.(clinic)}
                  >
                    <FaEye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  {onBookAppointment && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onBookAppointment?.(clinic)}
                    >
                      <FaCalendarPlus className="w-4 h-4 mr-2" />
                      Book Appointment
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card.Content>
      </Card>
    )
  }

  // Grid layout (card view)
  return (
    <Card 
      hover 
      className="group cursor-pointer h-full flex flex-col"
      onClick={() => onViewDetails?.(clinic)}
    >
      <Card.Header className="pb-3">
        <div className="flex items-start justify-between mb-3">
          <div className={`
            w-12 h-12 rounded-lg flex items-center justify-center
            ${isDarkMode ? 'bg-teal-900/30' : 'bg-teal-100'}
            group-hover:scale-110 transition-transform duration-300
          `}>
            <FaBuilding className="w-6 h-6 text-teal-600" />
          </div>
          
          {hasDistance && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              isDarkMode ? 'bg-teal-500/20 text-teal-300' : 'bg-teal-50 text-teal-700'
            }`}>
              📍 {formatDistance(clinic.distance)}
            </span>
          )}
        </div>

        <h3 className={`text-lg font-bold mb-1 ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>
          {clinicName}
        </h3>

        <div className="flex items-center gap-2 text-xs">
          <FaIdCard className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            {registrationNumber}
          </span>
        </div>
      </Card.Header>

      <Card.Content className="space-y-3 grow">
        {/* Location */}
        <div className={`
          p-3 rounded-lg 
          ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}
        `}>
          <div className="flex items-start gap-2 mb-2">
            <FaMapMarkerAlt className={`w-4 h-4 mt-0.5 ${
              isDarkMode ? 'text-teal-400' : 'text-teal-600'
            }`} />
            <div>
              <p className={`font-medium text-sm ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {city}
              </p>
              <p className={`text-xs ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {address}
              </p>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FaEnvelope className={`w-3 h-3 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <span className={`text-xs truncate ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {email}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FaPhone className={`w-3 h-3 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <span className={`text-xs ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {phone}
            </span>
          </div>
        </div>
      </Card.Content>

      {/* Actions */}
      {showActions && (
        <Card.Footer className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation()
                onViewDetails?.(clinic)
              }}
            >
              <FaEye className="w-3 h-3 mr-1" />
              Details
            </Button>
            {onBookAppointment && (
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation()
                  onBookAppointment?.(clinic)
                }}
              >
                <FaCalendarPlus className="w-3 h-3 mr-1" />
                Book
              </Button>
            )}
          </div>
        </Card.Footer>
      )}
    </Card>
  )
}

export default ClinicCard
