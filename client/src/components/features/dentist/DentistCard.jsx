import { useState } from 'react'
import { 
  FaUserMd, 
  FaStar, 
  FaMapMarkerAlt, 
  FaBuilding,
  FaPhone,
  FaEnvelope,
  FaStethoscope,
  FaClock,
  FaCalendarAlt,
  FaEye
} from 'react-icons/fa'
import { Card, Button, StatusBadge } from '../../common'
import { useTheme } from '../../../contexts/ThemeContext'
import { getImageUrl } from '../../../utils/helpers'

const DoctorCard = ({ 
  doctor, 
  onViewProfile, 
  onBookAppointment,
  layout = 'grid' // 'grid' or 'list'
}) => {
  const { isDarkMode } = useTheme()
  const [imageError, setImageError] = useState(false)

  // Extract doctor information
  const fullName = `Dr. ${doctor.firstName} ${doctor.lastName}`
  const specialty = doctor.specialty || 'General Dentistry'
  const clinic = doctor.clinic || {}
  const rating = doctor.rating || 4.5
  const totalReviews = doctor.totalReviews || 0
  const yearsOfExperience = doctor.yearsOfExperience || 0
  const isActive = doctor.isActive !== false

  // Generate avatar placeholder
  const getAvatarPlaceholder = () => {
    const initials = `${doctor.firstName?.[0] || ''}${doctor.lastName?.[0] || ''}`.toUpperCase()
    return initials
  }

  // Generate random color for avatar based on name
  const getAvatarColor = () => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-teal-500 to-teal-600',
      'from-purple-500 to-purple-600',
      'from-pink-500 to-pink-600',
      'from-indigo-500 to-indigo-600',
      'from-cyan-500 to-cyan-600'
    ]
    const index = (doctor.firstName?.charCodeAt(0) || 0) % colors.length
    return colors[index]
  }

  if (layout === 'list') {
    return (
      <Card className={`transition-all duration-300 ${
        isDarkMode ? 'hover:bg-gray-750' : 'hover:shadow-xl'
      }`}>
        <Card.Content className="p-6">
          <div className="flex items-start space-x-6">
            {/* Doctor Avatar */}
            <div className="shrink-0">
              {(doctor.user?.profileImage || doctor.profileImage) && !imageError ? (
                <img
                  src={getImageUrl(doctor.user?.profileImage || doctor.profileImage)}
                  alt={fullName}
                  onError={() => setImageError(true)}
                  className="w-24 h-24 rounded-xl object-cover shadow-lg"
                />
              ) : (
                <div className={`w-24 h-24 rounded-xl flex items-center justify-center bg-gradient-to-br ${getAvatarColor()} shadow-lg`}>
                  <span className="text-white text-3xl font-bold">
                    {getAvatarPlaceholder()}
                  </span>
                </div>
              )}
            </div>

            {/* Doctor Info */}
            <div className="grow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className={`text-xl font-bold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {fullName}
                    </h3>
                    {isActive ? (
                      <StatusBadge status="active" label="Available" />
                    ) : (
                      <StatusBadge status="inactive" label="Unavailable" />
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 mb-2">
                    <div className="flex items-center">
                      <FaStethoscope className={`mr-2 ${
                        isDarkMode ? 'text-teal-400' : 'text-teal-600'
                      }`} />
                      <span className={`font-medium ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {specialty}
                      </span>
                    </div>
                    
                    {yearsOfExperience > 0 && (
                      <div className="flex items-center">
                        <FaClock className={`mr-2 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`} />
                        <span className={`text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {yearsOfExperience} years exp.
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Rating */}
                  {totalReviews > 0 && (
                    <div className="flex items-center mb-3">
                      <div className="flex items-center mr-2">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(rating)
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className={`text-sm font-medium ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {rating.toFixed(1)}
                      </span>
                      <span className={`text-sm ml-1 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        ({totalReviews} reviews)
                      </span>
                    </div>
                  )}

                  {/* Clinic Info */}
                  {clinic.name && (
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <FaBuilding className={`mr-2 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`} />
                        <span className={`text-sm ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          {clinic.name}
                        </span>
                      </div>
                      {clinic.city && (
                        <div className="flex items-center">
                          <FaMapMarkerAlt className={`mr-2 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`} />
                          <span className={`text-sm ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            {clinic.city}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col space-y-2">
                  <Button
                    onClick={() => onViewProfile(doctor)}
                    variant="outline"
                    size="sm"
                  >
                    View Profile
                  </Button>
                  {isActive && (
                    <Button
                      onClick={() => onBookAppointment(doctor)}
                      size="sm"
                    >
                      <FaCalendarAlt className="mr-2" />
                      Book Appointment
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card.Content>
      </Card>
    )
  }

  // Grid layout (default)
  return (
    <Card 
      hover 
      className="group cursor-pointer h-full flex flex-col"
      onClick={() => onViewProfile(doctor)}
    >
      <Card.Header className="pb-3">
        <div className="flex items-start justify-between mb-3">
          <div className={`
            w-12 h-12 rounded-lg flex items-center justify-center
            ${isDarkMode ? 'bg-teal-900/30' : 'bg-teal-100'}
            group-hover:scale-110 transition-transform duration-300
          `}>
            <FaUserMd className="w-6 h-6 text-teal-600" />
          </div>
          
          {isActive ? (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              isDarkMode ? 'bg-green-500/20 text-green-300' : 'bg-green-50 text-green-700'
            }`}>
              Available
            </span>
          ) : (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'
            }`}>
              Unavailable
            </span>
          )}
        </div>

        <h3 className={`text-lg font-bold mb-1 ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>
          {fullName}
        </h3>

        <div className="flex items-center gap-2 text-xs">
          <FaStethoscope className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            {specialty}
          </span>
        </div>
      </Card.Header>

      <Card.Content className="space-y-3 grow">
        {/* Rating */}
        {totalReviews > 0 && (
          <div className={`
            p-3 rounded-lg 
            ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}
          `}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.floor(rating)
                        ? 'text-yellow-400'
                        : isDarkMode ? 'text-gray-600' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className={`text-sm font-medium ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {rating.toFixed(1)} ({totalReviews})
              </span>
            </div>
          </div>
        )}

        {/* Clinic & Location Info */}
        {(clinic.name || clinic.city) && (
          <div className={`
            p-3 rounded-lg 
            ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}
          `}>
            <div className="space-y-2">
              {clinic.name && (
                <div className="flex items-start gap-2">
                  <FaBuilding className={`w-4 h-4 mt-0.5 ${
                    isDarkMode ? 'text-teal-400' : 'text-teal-600'
                  }`} />
                  <span className={`text-sm font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {clinic.name}
                  </span>
                </div>
              )}
              {clinic.city && (
                <div className="flex items-start gap-2">
                  <FaMapMarkerAlt className={`w-4 h-4 mt-0.5 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <span className={`text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {clinic.city}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contact & Experience */}
        <div className="space-y-2">
          {(doctor.user?.email || doctor.email) && (
            <div className="flex items-center gap-2">
              <FaEnvelope className={`w-3 h-3 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <span className={`text-xs truncate ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {doctor.user?.email || doctor.email}
              </span>
            </div>
          )}
          {(doctor.user?.phone || doctor.phone) && (
            <div className="flex items-center gap-2">
              <FaPhone className={`w-3 h-3 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <span className={`text-xs ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {doctor.user?.phone || doctor.phone}
              </span>
            </div>
          )}
          {yearsOfExperience > 0 && (
            <div className="flex items-center gap-2">
              <FaClock className={`w-3 h-3 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <span className={`text-xs ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {yearsOfExperience} years exp.
              </span>
            </div>
          )}
        </div>
      </Card.Content>

      {/* Actions */}
      <Card.Footer className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation()
              onViewProfile(doctor)
            }}
          >
            <FaEye className="w-3 h-3 mr-1" />
            Profile
          </Button>
          {isActive && (
            <Button
              variant="primary"
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation()
                onBookAppointment(doctor)
              }}
            >
              <FaCalendarAlt className="w-3 h-3 mr-1" />
              Book
            </Button>
          )}
        </div>
      </Card.Footer>
    </Card>
  )
}

export default DoctorCard
