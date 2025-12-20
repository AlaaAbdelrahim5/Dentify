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
  FaCalendarAlt
} from 'react-icons/fa'
import { Card, Button, StatusBadge } from '../../common'
import { useTheme } from '../../../contexts/ThemeContext'

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
              {doctor.photoUrl && !imageError ? (
                <img
                  src={doctor.photoUrl}
                  alt={fullName}
                  onError={() => setImageError(true)}
                  className="w-24 h-24 rounded-xl object-cover shadow-lg"
                />
              ) : (
                <div className={`w-24 h-24 rounded-xl flex items-center justify-center bg-linear-to-br ${getAvatarColor()} shadow-lg`}>
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
    <Card className={`h-full transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${
      isDarkMode ? 'hover:bg-gray-750' : ''
    }`}>
      <Card.Content className="p-6">
        {/* Doctor Avatar with enhanced styling */}
        <div className="flex justify-center mb-4">
          {doctor.photoUrl && !imageError ? (
            <div className="relative">
              <img
                src={doctor.photoUrl}
                alt={fullName}
                onError={() => setImageError(true)}
                className="w-24 h-24 rounded-full object-cover shadow-xl ring-4 ring-offset-2 ring-teal-500/20"
              />
              {isActive && (
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-lg" />
              )}
            </div>
          ) : (
            <div className="relative">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center bg-linear-to-br ${getAvatarColor()} shadow-xl ring-4 ring-offset-2 ${
                isDarkMode ? 'ring-gray-700' : 'ring-gray-200'
              }`}>
                <span className="text-white text-3xl font-bold">
                  {getAvatarPlaceholder()}
                </span>
              </div>
              {isActive && (
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-lg" />
              )}
            </div>
          )}
        </div>

        {/* Doctor Name & Status */}
        <div className="text-center mb-4">
          <h3 className={`text-lg font-bold mb-2 transition-colors ${
            isDarkMode ? 'text-white group-hover:text-teal-400' : 'text-gray-900 group-hover:text-teal-600'
          }`}>
            {fullName}
          </h3>
          
          <div className="flex items-center justify-center mb-3">
            <div className={`p-2 rounded-lg mr-2 ${
              isDarkMode ? 'bg-teal-600/20' : 'bg-teal-50'
            }`}>
              <FaStethoscope className={`${
                isDarkMode ? 'text-teal-400' : 'text-teal-600'
              }`} />
            </div>
            <span className={`text-sm font-semibold ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {specialty}
            </span>
          </div>

          <div className="flex justify-center">
            {isActive ? (
              <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center ${
                isDarkMode 
                  ? 'bg-green-600/20 text-green-400 border border-green-600/50' 
                  : 'bg-green-100 text-green-700 border border-green-200'
              }`}>
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                Available
              </span>
            ) : (
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-400' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                Unavailable
              </span>
            )}
          </div>
        </div>

        {/* Rating with enhanced design */}
        {totalReviews > 0 && (
          <div className={`flex items-center justify-center mb-4 p-3 rounded-xl ${
            isDarkMode ? 'bg-yellow-600/10' : 'bg-yellow-50'
          }`}>
            <div className="flex items-center mr-2">
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  className={`w-4 h-4 transition-all duration-200 ${
                    i < Math.floor(rating)
                      ? 'text-yellow-400 drop-shadow-lg'
                      : isDarkMode ? 'text-gray-600' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className={`text-sm font-bold ${
              isDarkMode ? 'text-yellow-400' : 'text-yellow-700'
            }`}>
              {rating.toFixed(1)}
            </span>
            <span className={`text-xs ml-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              ({totalReviews})
            </span>
          </div>
        )}

        {/* Experience */}
        {yearsOfExperience > 0 && (
          <div className="flex items-center justify-center mb-4">
            <FaClock className={`mr-2 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <span className={`text-sm ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {yearsOfExperience} years of experience
            </span>
          </div>
        )}

        {/* Clinic Info */}
        {clinic.name && (
          <div className={`mb-4 p-3 rounded-lg ${
            isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
          }`}>
            <div className="flex items-center justify-center mb-1">
              <FaBuilding className={`mr-2 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <span className={`text-sm font-medium ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {clinic.name}
              </span>
            </div>
            {clinic.city && (
              <div className="flex items-center justify-center">
                <FaMapMarkerAlt className={`mr-2 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <span className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {clinic.city}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons with enhanced styling */}
        <div className="space-y-3 mt-6">
          <button
            onClick={() => onViewProfile(doctor)}
            className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
              isDarkMode
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 border border-gray-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
            }`}
          >
            👁️ View Profile
          </button>
          {isActive && (
            <button
              onClick={() => onBookAppointment(doctor)}
              className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${
                isDarkMode
                  ? 'bg-linear-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-500 hover:to-cyan-500'
                  : 'bg-linear-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600'
              }`}
            >
              <div className="flex items-center justify-center">
                <FaCalendarAlt className="mr-2" />
                Book Appointment
              </div>
            </button>
          )}
        </div>
      </Card.Content>
    </Card>
  )
}

export default DoctorCard
