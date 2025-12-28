import { 
  FaUser,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaBirthdayCake
} from 'react-icons/fa'
import { Card } from '../../common'
import { useTheme } from '../../../contexts/ThemeContext'
import { calculateAge, capitalizeFirstLetter, getStatusDisplay } from '../../../utils/helpers'

const PatientCard = ({ patient, onClick }) => {
  const { isDarkMode } = useTheme()
  const statusDisplay = getStatusDisplay(patient.status)

  return (
    <Card 
      hover 
      onClick={() => onClick(patient)}
      className="group cursor-pointer"
    >
      <Card.Header className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={`
              w-12 h-12 rounded-lg flex items-center justify-center
              ${isDarkMode ? 'bg-teal-900/30' : 'bg-teal-100'}
              group-hover:scale-110 transition-transform duration-300
            `}>
              <FaUser className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>
                {patient.name}
              </h3>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {capitalizeFirstLetter(patient.gender) || 'N/A'} • {calculateAge(patient.dateOfBirth)} years
              </p>
            </div>
          </div>
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusDisplay.className}`}>
            {statusDisplay.label}
          </span>
        </div>
      </Card.Header>

      <Card.Content className="space-y-4">
        {/* Contact Info */}
        <div className={`
          p-3 rounded-lg 
          ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}
        `}>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FaPhone className={`w-4 h-4 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <span className={`text-sm ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {patient.phone}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FaEnvelope className={`w-4 h-4 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <span className={`text-sm ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {patient.email}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt className={`w-4 h-4 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <span className={`text-sm ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {capitalizeFirstLetter(patient.city)}
              </span>
            </div>
          </div>
        </div>

        {/* Birth Date */}
        <div className="flex items-center gap-2 text-sm">
          <FaBirthdayCake className={`w-4 h-4 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`} />
          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            Born: {patient.dateOfBirth && !isNaN(new Date(patient.dateOfBirth).getTime()) 
              ? new Date(patient.dateOfBirth).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) 
              : 'N/A'}
          </span>
        </div>
      </Card.Content>
    </Card>
  )
}

export default PatientCard
